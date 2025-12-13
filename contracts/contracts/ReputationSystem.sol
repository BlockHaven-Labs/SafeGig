// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "../interfaces/IJobManager.sol";
import "../interfaces/ISafeGigRegistry.sol";

contract ReputationSystem is AccessControl, Pausable {
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct Review {
        uint256 id;
        uint256 jobId;
        address reviewer;
        address reviewee;
        uint256 rating; // 1-5 stars * 100 (e.g., 450 = 4.5 stars)
        string reviewURI; // IPFS hash for review content
        uint256 timestamp;
        bool isFreelancerReview; // true if freelancer reviewing client
    }

    struct UserReputation {
        uint256 totalRating;
        uint256 reviewCount;
        uint256 averageRating;
        uint256 lastUpdated;
    }

    ISafeGigRegistry public registry;
    IJobManager public jobManager;

    Counters.Counter private reviewCounter;

    mapping(uint256 => Review) public reviews;
    mapping(address => UserReputation) public userReputations;
    mapping(uint256 => mapping(address => bool)) public hasReviewed; // jobId => user => hasReviewed
    mapping(address => uint256[]) public userReviews;

    event ReviewSubmitted(
        uint256 indexed reviewId,
        uint256 indexed jobId,
        address indexed reviewer,
        address reviewee,
        uint256 rating
    );
    event ReputationUpdated(address indexed user, uint256 newAverageRating);

    constructor(address _registryAddress, address _jobManagerAddress) {
        registry = ISafeGigRegistry(_registryAddress);
        jobManager = IJobManager(_jobManagerAddress);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function submitReview(
        uint256 _jobId,
        address _reviewee,
        uint256 _rating,
        string memory _reviewURI
    ) external whenNotPaused returns (uint256) {
        require(_rating >= 100 && _rating <= 500, "Rating must be between 1.0 and 5.0");
        require(_reviewee != msg.sender, "Cannot review yourself");
        require(!hasReviewed[_jobId][msg.sender], "Already reviewed for this job");

        (address client, address freelancer, , uint8 status) = jobManager.getJobDetails(_jobId);
        require(status == 4, "Job must be completed"); // JobStatus.Completed
        require(
            (msg.sender == client && _reviewee == freelancer) || 
            (msg.sender == freelancer && _reviewee == client),
            "Not authorized to review for this job"
        );

        uint256 reviewId = reviewCounter.current();
        reviewCounter.increment();

        reviews[reviewId] = Review({
            id: reviewId,
            jobId: _jobId,
            reviewer: msg.sender,
            reviewee: _reviewee,
            rating: _rating,
            reviewURI: _reviewURI,
            timestamp: block.timestamp,
            isFreelancerReview: (msg.sender == freelancer)
        });

        hasReviewed[_jobId][msg.sender] = true;
        userReviews[_reviewee].push(reviewId);

        _updateReputation(_reviewee, _rating);

        emit ReviewSubmitted(reviewId, _jobId, msg.sender, _reviewee, _rating);
        return reviewId;
    }

    function _updateReputation(address _user, uint256 _rating) internal {
        UserReputation storage reputation = userReputations[_user];
        
        reputation.totalRating += _rating;
        reputation.reviewCount += 1;
        reputation.averageRating = reputation.totalRating / reputation.reviewCount;
        reputation.lastUpdated = block.timestamp;

        emit ReputationUpdated(_user, reputation.averageRating);
    }

    function updateRating(address user, uint256 rating/*, uint256 jobId*/) external {
        // This function is called by other contracts in the system
        require(hasRole(ADMIN_ROLE, msg.sender), "Only admin can update ratings");
        _updateReputation(user, rating);
    }

    // View functions
    function getUserRating(address user) external view returns (uint256) {
        return userReputations[user].averageRating;
    }

    function getUserReputation(address user) external view returns (UserReputation memory) {
        return userReputations[user];
    }

    function getReview(uint256 reviewId) external view returns (Review memory) {
        return reviews[reviewId];
    }

    function getUserReviews(address user) external view returns (uint256[] memory) {
        return userReviews[user];
    }

    function getJobReviews(uint256 jobId) external view returns (Review[] memory) {
        uint256 totalReviews = reviewCounter.current();
        uint256 jobReviewCount = 0;
        
        // First pass: count reviews for this job
        for (uint256 i = 0; i < totalReviews; i++) {
            if (reviews[i].jobId == jobId) {
                jobReviewCount++;
            }
        }
        
        // Second pass: collect reviews
        Review[] memory jobReviews = new Review[](jobReviewCount);
        uint256 index = 0;
        for (uint256 i = 0; i < totalReviews; i++) {
            if (reviews[i].jobId == jobId) {
                jobReviews[index] = reviews[i];
                index++;
            }
        }
        
        return jobReviews;
    }

    // Admin functions
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
}