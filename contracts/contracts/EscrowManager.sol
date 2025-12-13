// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "../interfaces/IJobManager.sol";
import "../interfaces/ISafeGigRegistry.sol";
import "../interfaces/IDisputeResolver.sol";

contract EscrowManager is AccessControl, Pausable, ReentrancyGuard {
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    IDisputeResolver public disputeResolver;
    uint256 public disputeFeeRate = 250;

    enum EscrowStatus {
        Created, // 0 - Escrow created, funds locked
        WorkStarted, // 1 - Freelancer started work
        WorkSubmitted, // 2 - Work submitted for review
        Approved, // 3 - Work approved by client
        Released, // 4 - Payment released to freelancer
        Refunded, // 5 - Payment refunded to client
        Disputed // 6 - In dispute resolution
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
    AggregatorV3Interface public priceFeed;

    Counters.Counter private escrowCounter;

    mapping(uint256 => Escrow) public escrows;
    mapping(uint256 => uint256) public jobToEscrow; // jobId => escrowId
    mapping(address => uint256[]) public userEscrows;

    uint256 public platformFeeRate = 250; // 2.5% in basis points
    uint256 public autoReleaseDelay = 15 days; // Auto-release after 15 days
    uint256 public constant MINIMUM_USD = 5 * 10 ** 8;
    address public feeRecipient;

    event EscrowCreated(
        uint256 indexed escrowId,
        uint256 indexed jobId,
        address indexed client,
        address freelancer,
        uint256 amount,
        uint256 usdValue
    );
    event WorkStarted(uint256 indexed escrowId);
    event WorkSubmitted(uint256 indexed escrowId);
    event PaymentApproved(uint256 indexed escrowId, address indexed client);
    event PaymentReleased(
        uint256 indexed escrowId,
        address indexed freelancer,
        uint256 amount,
        uint256 usdValue
    );
    event PaymentRefunded(
        uint256 indexed escrowId,
        address indexed client,
        uint256 amount
    );
    event DisputeInitiated(uint256 indexed escrowId);
    event PriceFeedUpdated(address indexed newPriceFeed);
    event DisputeResolutionPayment(
        uint256 indexed escrowId,
        uint256 freelancerAmount,
        uint256 clientRefund,
        uint256 platformFee,
        uint256 disputeFee
    );

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
        address _feeRecipient,
        address _priceFeedAddress,
        address _disputeResolverAddress
    ) {
        priceFeed = AggregatorV3Interface(_priceFeedAddress);
        require(address(priceFeed) != address(0), "Invalid price feed");
        require(_feeRecipient != address(0), "Invalid fee recipient");
        require(
            _disputeResolverAddress != address(0),
            "Invalid dispute resolver address"
        );

        jobManager = IJobManager(_jobManagerAddress);
        registry = ISafeGigRegistry(_registryAddress);
        disputeResolver = IDisputeResolver(_disputeResolverAddress);
        feeRecipient = _feeRecipient;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    /**
     * @notice Release payment based on dispute resolution
     * @param _escrowId The escrow ID
     */
    function releaseBasedOnDispute(
        uint256 _escrowId
    ) external onlyRole(ADMIN_ROLE) nonReentrant {
        Escrow storage escrow = escrows[_escrowId];

        require(
            escrow.status != EscrowStatus.Released,
            "Payment already released"
        );
        require(
            escrow.status != EscrowStatus.Refunded,
            "Payment already refunded"
        );
        require(
            escrow.status == EscrowStatus.Disputed,
            "Escrow not in disputed status"
        );

        // Get dispute details
        uint256 disputeId = disputeResolver.getJobDispute(escrow.jobId);
        require(disputeId > 0, "No dispute found for this job");

        (
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            uint8 disputeStatus,
            uint8 resolution,
            ,
            ,
            ,
            uint256 refundPercentage,

        ) = disputeResolver.getDispute(disputeId);

        require(
            disputeStatus == 2 || disputeStatus == 4,
            "Dispute not resolved or closed"
        );
        require(resolution != 0, "No resolution set");

        // Calculate fees
        uint256 totalAmount = escrow.amount;
        uint256 platformFee = escrow.platformFee; // Original 2.5%
        uint256 disputeFee = (totalAmount * disputeFeeRate) / 10000; // Additional 2.5%
        uint256 totalFees = platformFee + disputeFee;
        uint256 remainingAmount = totalAmount - totalFees;

        escrow.status = EscrowStatus.Released;

        // Process based on resolution
        if (resolution == 1) {
            // FavorFreelancer - Freelancer gets remaining amount
            _transferFunds(
                escrow.freelancer,
                remainingAmount,
                "Freelancer payment failed"
            );
            _transferFunds(feeRecipient, totalFees, "Fee transfer failed");

            emit DisputeResolutionPayment(
                _escrowId,
                remainingAmount,
                0,
                platformFee,
                disputeFee
            );
        } else if (resolution == 2) {
            // FavorClient - Client gets refund minus fees
            _transferFunds(
                escrow.client,
                remainingAmount,
                "Client refund failed"
            );
            _transferFunds(feeRecipient, totalFees, "Fee transfer failed");

            emit DisputeResolutionPayment(
                _escrowId,
                0,
                remainingAmount,
                platformFee,
                disputeFee
            );
        } else if (resolution == 3) {
            // PartialRefund - Split based on percentage
            require(refundPercentage <= 100, "Invalid refund percentage");

            uint256 clientAmount = (remainingAmount * refundPercentage) / 100;
            uint256 freelancerAmount = remainingAmount - clientAmount;

            _transferFunds(
                escrow.freelancer,
                freelancerAmount,
                "Freelancer payment failed"
            );
            _transferFunds(escrow.client, clientAmount, "Client refund failed");
            _transferFunds(feeRecipient, totalFees, "Fee transfer failed");

            emit DisputeResolutionPayment(
                _escrowId,
                freelancerAmount,
                clientAmount,
                platformFee,
                disputeFee
            );
        } else {
            revert("Invalid resolution type");
        }
    }

    /**
     * @notice Helper function to transfer funds safely
     */
    function _transferFunds(
        address recipient,
        uint256 amount,
        string memory errorMsg
    ) internal {
        if (amount > 0) {
            (bool success, ) = recipient.call{value: amount}("");
            require(success, errorMsg);
        }
    }

    /**
     * @notice Get current ETH/USD price from Chainlink
     * @return price in USD with 8 decimals (e.g., 2000_00000000 (2000 * 10^8))
     */
    function getLatestPrice() public view returns (uint256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        require(price > 0, "Invalid price from oracle");
        return uint256(price);
    }

    /**
     * @notice Convert ETH amount to USD value
     * @param ethAmount Amount in wei
     * @return USD value with 8 decimals
     */
    function getUSDValue(uint256 ethAmount) public view returns (uint256) {
        uint256 ethPrice = getLatestPrice(); // Price has 8 decimals
        // ethAmount is in wei (18 decimals)
        // Formula: (ethAmount * ethPrice) / 1e18
        return (ethAmount * ethPrice) / 1e18;
    }

    /**
     * @notice Convert USD amount to ETH
     * @param usdAmount USD amount with 8 decimals (e.g., 500000000 = $5.00)
     * @return ETH amount in wei
     */
    function getETHAmount(uint256 usdAmount) public view returns (uint256) {
        uint256 ethPrice = getLatestPrice();
        // Formula: (usdAmount * 1e18) / ethPrice
        return (usdAmount * 1e18) / ethPrice;
    }

    /**
     * @notice Check if ETH amount meets minimum USD requirement
     * @param ethAmount Amount in wei
     * @return true if meets minimum
     */
    function meetsMinimumUSD(uint256 ethAmount) public view returns (bool) {
        uint256 usdValue = getUSDValue(ethAmount);
        return usdValue >= MINIMUM_USD;
    }

    function setPriceFeed(address _priceFeed) external onlyRole(ADMIN_ROLE) {
        require(_priceFeed != address(0), "Invalid price feed");
        priceFeed = AggregatorV3Interface(_priceFeed);
        emit PriceFeedUpdated(_priceFeed);
    }

    function createEscrow(
        uint256 _jobId
    ) external payable whenNotPaused nonReentrant returns (uint256) {
        (
            address client,
            address freelancer,
            uint256 budget,
            uint8 status
        ) = jobManager.getJobDetails(_jobId);

        require(client == msg.sender, "Only job client can create escrow");
        require(freelancer != address(0), "Job not assigned to freelancer");
        require(status == 1, "Job not in assigned status"); // JobStatus.Assigned
        require(msg.value == budget, "Incorrect escrow amount");
        require(jobToEscrow[_jobId] == 0, "Escrow already exists for this job");

        // Check minimum USD value
        require(meetsMinimumUSD(msg.value), "Escrow amount below $5 minimum");

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

        uint256 usdValue = getUSDValue(msg.value);
        emit EscrowCreated(
            escrowId,
            _jobId,
            client,
            freelancer,
            msg.value,
            usdValue
        );
        return escrowId;
    }

    function startWork(
        uint256 _escrowId
    )
        external
        onlyEscrowParticipant(_escrowId)
        validEscrowStatus(_escrowId, EscrowStatus.Created)
    {
        require(
            escrows[_escrowId].freelancer == msg.sender,
            "Only freelancer can start work"
        );

        escrows[_escrowId].status = EscrowStatus.WorkStarted;
        emit WorkStarted(_escrowId);
    }

    function submitWork(
        uint256 _escrowId
        // string memory _deliveryURI
    )
        external
        onlyEscrowParticipant(_escrowId)
        validEscrowStatus(_escrowId, EscrowStatus.WorkStarted)
    {
        require(
            escrows[_escrowId].freelancer == msg.sender,
            "Only freelancer can submit work"
        );

        escrows[_escrowId].status = EscrowStatus.WorkSubmitted;
        escrows[_escrowId].freelancerConfirmed = true;

        // Reset release time to give client time to review
        escrows[_escrowId].releaseTime = block.timestamp + autoReleaseDelay;

        emit WorkSubmitted(_escrowId);
    }

    function approveWork(
        uint256 _escrowId
    )
        external
        onlyEscrowParticipant(_escrowId)
        validEscrowStatus(_escrowId, EscrowStatus.WorkSubmitted)
    {
        require(
            escrows[_escrowId].client == msg.sender,
            "Only client can approve work"
        );

        escrows[_escrowId].status = EscrowStatus.Approved;
        escrows[_escrowId].clientApproved = true;

        emit PaymentApproved(_escrowId, msg.sender);
        _releasePayment(_escrowId);
    }

    function releasePayment(
        uint256 _escrowId
    ) external onlyEscrowParticipant(_escrowId) nonReentrant {
        Escrow storage escrow = escrows[_escrowId];

        require(
            escrow.status == EscrowStatus.Approved ||
                (escrow.status == EscrowStatus.WorkSubmitted &&
                    block.timestamp >= escrow.releaseTime),
            "Cannot release payment yet"
        );

        _releasePayment(_escrowId);
    }

    function _releasePayment(uint256 _escrowId) internal {
        Escrow storage escrow = escrows[_escrowId];

        require(
            escrow.status != EscrowStatus.Released,
            "Payment already released"
        );
        require(
            escrow.status != EscrowStatus.Refunded,
            "Payment already refunded"
        );

        escrow.status = EscrowStatus.Released;

        uint256 freelancerAmount = escrow.amount - escrow.platformFee;
        uint256 usdValue = getUSDValue(freelancerAmount);

        // Transfer payment to freelancer
        (bool success1, ) = escrow.freelancer.call{value: freelancerAmount}("");
        require(success1, "Payment to freelancer failed");

        // Transfer platform fee
        if (escrow.platformFee > 0) {
            (bool success2, ) = feeRecipient.call{value: escrow.platformFee}(
                ""
            );
            require(success2, "Platform fee transfer failed");
        }

        emit PaymentReleased(
            _escrowId,
            escrow.freelancer,
            freelancerAmount,
            usdValue
        );
    }

    function requestRefund(
        uint256 _escrowId
    ) external onlyEscrowParticipant(_escrowId) {
        require(
            escrows[_escrowId].client == msg.sender,
            "Only client can request refund"
        );
        require(
            escrows[_escrowId].status == EscrowStatus.Created ||
                escrows[_escrowId].status == EscrowStatus.WorkStarted,
            "Cannot refund at this stage"
        );

        escrows[_escrowId].status = EscrowStatus.Disputed;
        emit DisputeInitiated(_escrowId);
    }

    /**
     * @notice Set dispute fee rate
     */
    function setDisputeFeeRate(uint256 _feeRate) external onlyRole(ADMIN_ROLE) {
        require(_feeRate <= 500, "Dispute fee cannot exceed 5%");
        disputeFeeRate = _feeRate;
    }

    /**
     * @notice Update dispute resolver address
     */
    function setDisputeResolver(
        address _disputeResolverAddress
    ) external onlyRole(ADMIN_ROLE) {
        require(
            _disputeResolverAddress != address(0),
            "Invalid dispute resolver address"
        );
        disputeResolver = IDisputeResolver(_disputeResolverAddress);
    }

    function processRefund(
        uint256 _escrowId
    ) external onlyRole(ADMIN_ROLE) nonReentrant {
        Escrow storage escrow = escrows[_escrowId];

        require(
            escrow.status == EscrowStatus.Disputed,
            "Escrow not in disputed status"
        );

        escrow.status = EscrowStatus.Refunded;

        // For early cancellations, return full amount minus only platform fee
        uint256 refundAmount = escrow.amount - escrow.platformFee;

        _transferFunds(escrow.client, refundAmount, "Refund failed");
        _transferFunds(feeRecipient, escrow.platformFee, "Fee transfer failed");

        emit PaymentRefunded(_escrowId, escrow.client, escrow.amount);
    }

    // View functions
    function getEscrow(
        uint256 _escrowId
    ) external view returns (Escrow memory) {
        return escrows[_escrowId];
    }

    function getEscrowUSDValue(
        uint256 _escrowId
    ) external view returns (uint256) {
        return getUSDValue(escrows[_escrowId].amount);
    }

    function getUserEscrows(
        address _user
    ) external view returns (uint256[] memory) {
        return userEscrows[_user];
    }

    function getEscrowByJob(uint256 _jobId) external view returns (uint256) {
        return jobToEscrow[_jobId];
    }

    // Admin functions
    function setPlatformFeeRate(
        uint256 _feeRate
    ) external onlyRole(ADMIN_ROLE) {
        require(_feeRate <= 1000, "Fee rate cannot exceed 10%");
        platformFeeRate = _feeRate;
    }

    function setAutoReleaseDelay(uint256 _delay) external onlyRole(ADMIN_ROLE) {
        require(
            _delay >= 1 days && _delay <= 30 days,
            "Delay must be between 1-30 days"
        );
        autoReleaseDelay = _delay;
    }

    function setFeeRecipient(
        address _feeRecipient
    ) external onlyRole(ADMIN_ROLE) {
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
