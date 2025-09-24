// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "../interfaces/IJobManager.sol";
import "../interfaces/ISafeGigRegistry.sol";

contract EscrowManager is AccessControl, Pausable, ReentrancyGuard {
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    enum EscrowStatus {
        Created,      // 0 - Escrow created, funds locked
        WorkStarted,  // 1 - Freelancer started work
        WorkSubmitted,// 2 - Work submitted for review
        Approved,     // 3 - Work approved by client
        Released,     // 4 - Payment released to freelancer
        Refunded,     // 5 - Payment refunded to client
        Disputed      // 6 - In dispute resolution
    }

    struct Escrow {
        uint256 id;
        uint256 jobId;
        address client;
        address freelancer;
        uint256 amount;
        uint256 platformFee; // Fee in basis points (100 = 1%)
        uint256 createdAt;
        uint256 releaseTime; // Auto-release time
        EscrowStatus status;
        bool clientApproved;
        bool freelancerConfirmed;
    }

    IJobManager public jobManager;
    ISafeGigRegistry public registry;

    Counters.Counter private escrowCounter;
    
    mapping(uint256 => Escrow) public escrows;
    mapping(uint256 => uint256) public jobToEscrow; // jobId => escrowId
    mapping(address => uint256[]) public userEscrows;

    uint256 public platformFeeRate = 250; // 2.5% in basis points
    uint256 public autoReleaseDelay = 7 days; // Auto-release after 7 days
    address public feeRecipient;

    event EscrowCreated(uint256 indexed escrowId, uint256 indexed jobId, address indexed client, address freelancer, uint256 amount);
    event WorkStarted(uint256 indexed escrowId);
    event WorkSubmitted(uint256 indexed escrowId);
    event PaymentApproved(uint256 indexed escrowId, address indexed client);
    event PaymentReleased(uint256 indexed escrowId, address indexed freelancer, uint256 amount);
    event PaymentRefunded(uint256 indexed escrowId, address indexed client, uint256 amount);
    event DisputeInitiated(uint256 indexed escrowId);

    modifier onlyEscrowParticipant(uint256 _escrowId) {
        require(
            escrows[_escrowId].client == msg.sender || 
            escrows[_escrowId].freelancer == msg.sender,
            "Not authorized for this escrow"
        );
        _;
    }

    modifier validEscrowStatus(uint256 _escrowId, EscrowStatus _status) {
        require(escrows[_escrowId].status == _status, "Invalid escrow status");
        _;
    }

    constructor(
        address _jobManagerAddress,
        address _registryAddress,
        address _feeRecipient
    ) {
        jobManager = IJobManager(_jobManagerAddress);
        registry = ISafeGigRegistry(_registryAddress);
        feeRecipient = _feeRecipient;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function createEscrow(uint256 _jobId) 
        external 
        payable 
        whenNotPaused 
        nonReentrant 
        returns (uint256) 
    {
        (address client, address freelancer, uint256 budget, uint8 status) = jobManager.getJobDetails(_jobId);
        
        require(client == msg.sender, "Only job client can create escrow");
        require(freelancer != address(0), "Job not assigned to freelancer");
        require(status == 1, "Job not in assigned status"); // JobStatus.Assigned
        require(msg.value == budget, "Incorrect escrow amount");
        require(jobToEscrow[_jobId] == 0, "Escrow already exists for this job");

        uint256 escrowId = escrowCounter.current();
        escrowCounter.increment();

        uint256 platformFee = (msg.value * platformFeeRate) / 10000;

        escrows[escrowId] = Escrow({
            id: escrowId,
            jobId: _jobId,
            client: client,
            freelancer: freelancer,
            amount: msg.value,
            platformFee: platformFee,
            createdAt: block.timestamp,
            releaseTime: block.timestamp + autoReleaseDelay,
            status: EscrowStatus.Created,
            clientApproved: false,
            freelancerConfirmed: false
        });

        jobToEscrow[_jobId] = escrowId;
        userEscrows[client].push(escrowId);
        userEscrows[freelancer].push(escrowId);

        emit EscrowCreated(escrowId, _jobId, client, freelancer, msg.value);
        return escrowId;
    }

    function startWork(uint256 _escrowId) 
        external 
        onlyEscrowParticipant(_escrowId)
        validEscrowStatus(_escrowId, EscrowStatus.Created)
    {
        require(escrows[_escrowId].freelancer == msg.sender, "Only freelancer can start work");

        escrows[_escrowId].status = EscrowStatus.WorkStarted;
        emit WorkStarted(_escrowId);
    }

    function submitWork(uint256 _escrowId, string memory _deliveryURI) 
        external 
        onlyEscrowParticipant(_escrowId)
        validEscrowStatus(_escrowId, EscrowStatus.WorkStarted)
    {
        require(escrows[_escrowId].freelancer == msg.sender, "Only freelancer can submit work");

        escrows[_escrowId].status = EscrowStatus.WorkSubmitted;
        escrows[_escrowId].freelancerConfirmed = true;
        
        // Reset release time to give client time to review
        escrows[_escrowId].releaseTime = block.timestamp + autoReleaseDelay;

        emit WorkSubmitted(_escrowId);
    }

    function approveWork(uint256 _escrowId) 
        external 
        onlyEscrowParticipant(_escrowId)
        validEscrowStatus(_escrowId, EscrowStatus.WorkSubmitted)
    {
        require(escrows[_escrowId].client == msg.sender, "Only client can approve work");

        escrows[_escrowId].status = EscrowStatus.Approved;
        escrows[_escrowId].clientApproved = true;

        emit PaymentApproved(_escrowId, msg.sender);
        _releasePayment(_escrowId);
    }

    function releasePayment(uint256 _escrowId) 
        external 
        onlyEscrowParticipant(_escrowId)
        nonReentrant
    {
        Escrow storage escrow = escrows[_escrowId];
        
        require(
            escrow.status == EscrowStatus.Approved || 
            (escrow.status == EscrowStatus.WorkSubmitted && block.timestamp >= escrow.releaseTime),
            "Cannot release payment yet"
        );

        _releasePayment(_escrowId);
    }

    function _releasePayment(uint256 _escrowId) internal {
        Escrow storage escrow = escrows[_escrowId];
        
        require(escrow.status != EscrowStatus.Released, "Payment already released");
        require(escrow.status != EscrowStatus.Refunded, "Payment already refunded");

        escrow.status = EscrowStatus.Released;

        uint256 freelancerAmount = escrow.amount - escrow.platformFee;
        
        // Transfer payment to freelancer
        (bool success1, ) = escrow.freelancer.call{value: freelancerAmount}("");
        require(success1, "Payment to freelancer failed");

        // Transfer platform fee
        if (escrow.platformFee > 0) {
            (bool success2, ) = feeRecipient.call{value: escrow.platformFee}("");
            require(success2, "Platform fee transfer failed");
        }

        emit PaymentReleased(_escrowId, escrow.freelancer, freelancerAmount);
    }

    function requestRefund(uint256 _escrowId) 
        external 
        onlyEscrowParticipant(_escrowId)
    {
        require(escrows[_escrowId].client == msg.sender, "Only client can request refund");
        require(
            escrows[_escrowId].status == EscrowStatus.Created || 
            escrows[_escrowId].status == EscrowStatus.WorkStarted,
            "Cannot refund at this stage"
        );

        escrows[_escrowId].status = EscrowStatus.Disputed;
        emit DisputeInitiated(_escrowId);
    }

    function processRefund(uint256 _escrowId) 
        external 
        onlyRole(ADMIN_ROLE)
        nonReentrant
    {
        Escrow storage escrow = escrows[_escrowId];
        
        require(escrow.status == EscrowStatus.Disputed, "Escrow not in disputed status");
        
        escrow.status = EscrowStatus.Refunded;

        // Refund full amount to client (minus any processing fees if needed)
        (bool success, ) = escrow.client.call{value: escrow.amount}("");
        require(success, "Refund failed");

        emit PaymentRefunded(_escrowId, escrow.client, escrow.amount);
    }

    // View functions
    function getEscrow(uint256 _escrowId) external view returns (Escrow memory) {
        return escrows[_escrowId];
    }

    function getUserEscrows(address _user) external view returns (uint256[] memory) {
        return userEscrows[_user];
    }

    function getEscrowByJob(uint256 _jobId) external view returns (uint256) {
        return jobToEscrow[_jobId];
    }

    // Admin functions
    function setPlatformFeeRate(uint256 _feeRate) external onlyRole(ADMIN_ROLE) {
        require(_feeRate <= 1000, "Fee rate cannot exceed 10%");
        platformFeeRate = _feeRate;
    }

    function setAutoReleaseDelay(uint256 _delay) external onlyRole(ADMIN_ROLE) {
        require(_delay >= 1 days && _delay <= 30 days, "Delay must be between 1-30 days");
        autoReleaseDelay = _delay;
    }

    function setFeeRecipient(address _feeRecipient) external onlyRole(ADMIN_ROLE) {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
    }

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
}