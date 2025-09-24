// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "../interfaces/IJobManager.sol";
import "../interfaces/ISafeGigRegistry.sol";

contract DisputeResolver is AccessControl, Pausable, ReentrancyGuard {
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ARBITRATOR_ROLE = keccak256("ARBITRATOR_ROLE");

    enum DisputeStatus {
        Created,     // 0 - Dispute created
        InReview,    // 1 - Under arbitrator review
        Resolved,    // 2 - Resolved by arbitrator
        Appealed,    // 3 - Appealed for higher review
        Closed       // 4 - Final resolution
    }

    enum Resolution {
        None,              // 0 - No resolution yet
        FavorFreelancer,   // 1 - Favor freelancer
        FavorClient,       // 2 - Favor client
        PartialRefund,     // 3 - Partial refund to both parties
        Mediation         // 4 - Requires mediation
    }

    struct Dispute {
        uint256 id;
        uint256 jobId;
        uint256 escrowId;
        address client;
        address freelancer;
        address initiator;
        string reason;
        string evidenceURI; // IPFS hash for evidence
        DisputeStatus status;
        Resolution resolution;
        address assignedArbitrator;
        uint256 createdAt;
        uint256 resolvedAt;
        uint256 refundPercentage; // For partial refunds (0-100)
        string resolutionNote;
    }

    struct Evidence {
        uint256 disputeId;
        address submitter;
        string evidenceURI;
        uint256 timestamp;
        string description;
    }

    IJobManager public jobManager;
    ISafeGigRegistry public registry;

    Counters.Counter private disputeCounter;
    Counters.Counter private evidenceCounter;

    mapping(uint256 => Dispute) public disputes;
    mapping(uint256 => uint256) public jobDisputes; // jobId => disputeId
    mapping(uint256 => uint256) public escrowDisputes; // escrowId => disputeId
    mapping(uint256 => Evidence[]) public disputeEvidences;
    mapping(address => uint256[]) public arbitratorDisputes;
    mapping(address => uint256) public arbitratorActiveDisputes;

    uint256 public maxActiveDisputesPerArbitrator = 5;
    uint256 public disputeTimeout = 14 days; // Auto-resolve timeout

    event DisputeCreated(
        uint256 indexed disputeId,
        uint256 indexed jobId,
        address indexed initiator,
        address other
    );
    event EvidenceSubmitted(
        uint256 indexed disputeId,
        address indexed submitter,
        string evidenceURI
    );
    event DisputeAssigned(uint256 indexed disputeId, address indexed arbitrator);
    event DisputeResolved(
        uint256 indexed disputeId,
        Resolution resolution,
        address indexed resolver
    );
    event DisputeAppealed(uint256 indexed disputeId, address indexed appellant);

    constructor(
        address _jobManagerAddress,
        address _registryAddress
    ) {
        jobManager = IJobManager(_jobManagerAddress);
        registry = ISafeGigRegistry(_registryAddress);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function createDispute(
        uint256 _jobId,
        uint256 _escrowId,
        string memory _reason,
        string memory _evidenceURI
    ) external whenNotPaused nonReentrant returns (uint256) {
        require(bytes(_reason).length > 0, "Reason required");
        require(jobDisputes[_jobId] == 0, "Dispute already exists for this job");

        (address client, address freelancer, , uint8 status) = jobManager.getJobDetails(_jobId);
        require(
            msg.sender == client || msg.sender == freelancer,
            "Not authorized to create dispute for this job"
        );
        require(status >= 2, "Job must be in progress or later"); // InProgress or later

        uint256 disputeId = disputeCounter.current();
        disputeCounter.increment();

        address other = (msg.sender == client) ? freelancer : client;

        disputes[disputeId] = Dispute({
            id: disputeId,
            jobId: _jobId,
            escrowId: _escrowId,
            client: client,
            freelancer: freelancer,
            initiator: msg.sender,
            reason: _reason,
            evidenceURI: _evidenceURI,
            status: DisputeStatus.Created,
            resolution: Resolution.None,
            assignedArbitrator: address(0),
            createdAt: block.timestamp,
            resolvedAt: 0,
            refundPercentage: 0,
            resolutionNote: ""
        });

        jobDisputes[_jobId] = disputeId;
        if (_escrowId > 0) {
            escrowDisputes[_escrowId] = disputeId;
        }

        // Add initial evidence
        if (bytes(_evidenceURI).length > 0) {
            _submitEvidence(disputeId, msg.sender, _evidenceURI, "Initial dispute evidence");
        }

        emit DisputeCreated(disputeId, _jobId, msg.sender, other);
        return disputeId;
    }

    function submitEvidence(
        uint256 _disputeId,
        string memory _evidenceURI,
        string memory _description
    ) external {
        Dispute memory dispute = disputes[_disputeId];
        require(dispute.id == _disputeId, "Dispute does not exist");
        require(
            msg.sender == dispute.client || 
            msg.sender == dispute.freelancer ||
            hasRole(ARBITRATOR_ROLE, msg.sender),
            "Not authorized to submit evidence"
        );
        require(
            dispute.status == DisputeStatus.Created || 
            dispute.status == DisputeStatus.InReview,
            "Cannot submit evidence at this stage"
        );

        _submitEvidence(_disputeId, msg.sender, _evidenceURI, _description);
    }

    function _submitEvidence(
        uint256 _disputeId,
        address _submitter,
        string memory _evidenceURI,
        string memory _description
    ) internal {
        Evidence memory evidence = Evidence({
            disputeId: _disputeId,
            submitter: _submitter,
            evidenceURI: _evidenceURI,
            timestamp: block.timestamp,
            description: _description
        });

        disputeEvidences[_disputeId].push(evidence);
        evidenceCounter.increment();

        emit EvidenceSubmitted(_disputeId, _submitter, _evidenceURI);
    }

    function assignArbitrator(uint256 _disputeId, address _arbitrator) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        require(hasRole(ARBITRATOR_ROLE, _arbitrator), "Address is not an arbitrator");
        require(
            arbitratorActiveDisputes[_arbitrator] < maxActiveDisputesPerArbitrator,
            "Arbitrator has too many active disputes"
        );
        require(disputes[_disputeId].status == DisputeStatus.Created, "Dispute not available for assignment");

        disputes[_disputeId].assignedArbitrator = _arbitrator;
        disputes[_disputeId].status = DisputeStatus.InReview;
        
        arbitratorDisputes[_arbitrator].push(_disputeId);
        arbitratorActiveDisputes[_arbitrator]++;

        emit DisputeAssigned(_disputeId, _arbitrator);
    }

    function resolveDispute(
        uint256 _disputeId,
        Resolution _resolution,
        uint256 _refundPercentage,
        string memory _resolutionNote
    ) external {
        Dispute storage dispute = disputes[_disputeId];
        
        require(
            dispute.assignedArbitrator == msg.sender || hasRole(ADMIN_ROLE, msg.sender),
            "Not authorized to resolve this dispute"
        );
        require(dispute.status == DisputeStatus.InReview, "Dispute not in review");
        require(_resolution != Resolution.None, "Must specify a resolution");
        
        if (_resolution == Resolution.PartialRefund) {
            require(_refundPercentage <= 100, "Refund percentage cannot exceed 100");
        }

        dispute.resolution = _resolution;
        dispute.status = DisputeStatus.Resolved;
        dispute.resolvedAt = block.timestamp;
        dispute.refundPercentage = _refundPercentage;
        dispute.resolutionNote = _resolutionNote;

        if (dispute.assignedArbitrator != address(0)) {
            arbitratorActiveDisputes[dispute.assignedArbitrator]--;
        }

        emit DisputeResolved(_disputeId, _resolution, msg.sender);
    }

    function appealDispute(uint256 _disputeId, string memory _appealReason) external {
        Dispute storage dispute = disputes[_disputeId];
        
        require(
            msg.sender == dispute.client || msg.sender == dispute.freelancer,
            "Not authorized to appeal this dispute"
        );
        require(dispute.status == DisputeStatus.Resolved, "Dispute not resolved yet");
        require(
            block.timestamp <= dispute.resolvedAt + 3 days,
            "Appeal period has expired"
        );

        dispute.status = DisputeStatus.Appealed;
        // Reset arbitrator for reassignment
        if (dispute.assignedArbitrator != address(0)) {
            arbitratorActiveDisputes[dispute.assignedArbitrator]++;
        }

        emit DisputeAppealed(_disputeId, msg.sender);
    }

    function closeDispute(uint256 _disputeId) external onlyRole(ADMIN_ROLE) {
        disputes[_disputeId].status = DisputeStatus.Closed;
    }

    // View functions
    function getDispute(uint256 _disputeId) external view returns (Dispute memory) {
        return disputes[_disputeId];
    }

    function getDisputeEvidence(uint256 _disputeId) external view returns (Evidence[] memory) {
        return disputeEvidences[_disputeId];
    }

    function getJobDispute(uint256 _jobId) external view returns (uint256) {
        return jobDisputes[_jobId];
    }

    function getArbitratorDisputes(address _arbitrator) external view returns (uint256[] memory) {
        return arbitratorDisputes[_arbitrator];
    }

    // Admin functions
    function addArbitrator(address _arbitrator) external onlyRole(ADMIN_ROLE) {
        grantRole(ARBITRATOR_ROLE, _arbitrator);
    }

    function removeArbitrator(address _arbitrator) external onlyRole(ADMIN_ROLE) {
        revokeRole(ARBITRATOR_ROLE, _arbitrator);
    }

    function setMaxActiveDisputes(uint256 _max) external onlyRole(ADMIN_ROLE) {
        maxActiveDisputesPerArbitrator = _max;
    }

    function setDisputeTimeout(uint256 _timeout) external onlyRole(ADMIN_ROLE) {
        require(_timeout >= 1 days && _timeout <= 30 days, "Invalid timeout");
        disputeTimeout = _timeout;
    }

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
}