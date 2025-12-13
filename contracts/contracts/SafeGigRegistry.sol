// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SafeGigRegistry is AccessControl, Pausable, ReentrancyGuard {
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
    bytes32 public constant JOB_MANAGER_ROLE = keccak256("JOB_MANAGER_ROLE");

    enum UserType {
        None,
        Freelancer,
        Client,
        Both
    }

    struct UserProfile {
        string metadataURI; // IPFS hash for detailed profile
        UserType userType;
        uint256 registrationTime;
        bool isActive;
        bool isVerified;
        string location;
        string[] skills;
    }

    struct FreelancerStats {
        uint256 jobsCompleted;
        uint256 totalEarned;
        uint256 successRate; // percentage * 100
        uint256 responseTime; // in hours
        uint256 hourlyRate;
    }

    struct ClientStats {
        uint256 totalSpent;
        uint256 jobsPosted;
        uint256 jobsCompleted;
        uint256 responseTime;
    }

    mapping(address => UserProfile) public userProfiles;
    mapping(address => FreelancerStats) public freelancerStats;
    mapping(address => ClientStats) public clientStats;
    mapping(address => uint256) public userRatings; // rating * 100 (e.g., 450 = 4.5 stars)
    mapping(address => uint256) public ratingCounts;

    Counters.Counter private userCounter;

    event UserRegistered(
        address indexed user,
        UserType userType,
        uint256 timestamp
    );
    event ProfileUpdated(address indexed user, string metadataURI);
    event UserVerified(address indexed user);
    event StatsUpdated(address indexed user, UserType userType);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function registerUser(
        UserType _userType,
        string memory _metadataURI,
        string memory _location,
        string[] memory _skills
    ) external whenNotPaused nonReentrant {
        require(_userType != UserType.None, "Invalid user type");
        require(
            userProfiles[msg.sender].userType == UserType.None,
            "User already registered"
        );
        require(bytes(_metadataURI).length > 0, "Metadata URI required");

        userProfiles[msg.sender] = UserProfile({
            metadataURI: _metadataURI,
            userType: _userType,
            registrationTime: block.timestamp,
            isActive: true,
            isVerified: false,
            location: _location,
            skills: _skills
        });

        userCounter.increment();
        emit UserRegistered(msg.sender, _userType, block.timestamp);
    }

    function updateProfile(
        string memory _metadataURI,
        string memory _location,
        string[] memory _skills
    ) external {
        require(
            userProfiles[msg.sender].userType != UserType.None,
            "User not registered"
        );

        userProfiles[msg.sender].metadataURI = _metadataURI;
        userProfiles[msg.sender].location = _location;
        userProfiles[msg.sender].skills = _skills;

        emit ProfileUpdated(msg.sender, _metadataURI);
    }

    function verifyUser(address _user) external onlyRole(MODERATOR_ROLE) {
        require(
            userProfiles[_user].userType != UserType.None,
            "User not registered"
        );
        userProfiles[_user].isVerified = true;
        emit UserVerified(_user);
    }

    function updateFreelancerStats(
        address _freelancer,
        uint256 _jobsCompleted,
        uint256 _totalEarned,
        uint256 _successRate,
        uint256 _responseTime,
        uint256 _hourlyRate
    ) external onlyRole(JOB_MANAGER_ROLE) {
        freelancerStats[_freelancer] = FreelancerStats({
            jobsCompleted: _jobsCompleted,
            totalEarned: _totalEarned,
            successRate: _successRate,
            responseTime: _responseTime,
            hourlyRate: _hourlyRate
        });

        emit StatsUpdated(_freelancer, UserType.Freelancer);
    }

    function updateClientStats(
        address _client,
        uint256 _totalSpent,
        uint256 _jobsPosted,
        uint256 _jobsCompleted,
        uint256 _responseTime
    ) external onlyRole(JOB_MANAGER_ROLE) {
        clientStats[_client] = ClientStats({
            totalSpent: _totalSpent,
            jobsPosted: _jobsPosted,
            jobsCompleted: _jobsCompleted,
            responseTime: _responseTime
        });

        emit StatsUpdated(_client, UserType.Client);
    }

    // View functions
    function isRegisteredUser(address user) external view returns (bool) {
        return userProfiles[user].userType != UserType.None;
    }

    function getUserType(address user) external view returns (uint8) {
        return uint8(userProfiles[user].userType);
    }

    function getUserProfile(
        address user
    ) external view returns (string memory) {
        return userProfiles[user].metadataURI;
    }

    function getTotalUsers() external view returns (uint256) {
        return userCounter.current();
    }

    function getClientStats(
        address _client
    ) external view returns (ClientStats memory) {
        return clientStats[_client];
    }

    function getFreelancerStats(
        address _freelancer
    ) external view returns (FreelancerStats memory) {
        return freelancerStats[_freelancer];
    }

    // Admin functions
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
}
