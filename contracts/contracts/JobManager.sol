// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "../interfaces/ISafeGigRegistry.sol";

contract JobManager is AccessControl, Pausable, ReentrancyGuard {
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    enum JobStatus { 
        Open,        // 0 - Job is posted and accepting applications
        Assigned,    // 1 - Job assigned to freelancer
        InProgress,  // 2 - Work in progress
        Submitted,   // 3 - Work submitted by freelancer
        Completed,   // 4 - Job completed and paid
        Cancelled,   // 5 - Job cancelled
        Disputed     // 6 - Job in dispute
    }

    enum ApplicationStatus {
        Pending,   // 0 - Application submitted
        Accepted,  // 1 - Application accepted
        Rejected   // 2 - Application rejected
    }

    struct Job {
        uint256 id;
        address client;
        address assignedFreelancer;
        string title;
        string description;
        string metadataURI; // IPFS hash for detailed job info
        uint256 budget;
        uint256 deadline;
        uint256 createdAt;
        JobStatus status;
        string[] requiredSkills;
        string[] tags;
        bool isUrgent;
    }

    struct JobApplication {
        uint256 jobId;
        address freelancer;
        string proposalURI; // IPFS hash for proposal details
        uint256 proposedBudget;
        uint256 proposedDeadline;
        uint256 appliedAt;
        ApplicationStatus status;
    }

    ISafeGigRegistry public registry;
    
    Counters.Counter private jobCounter;
    Counters.Counter private applicationCounter;

    mapping(uint256 => Job) public jobs;
    mapping(uint256 => JobApplication) public applications;
    mapping(uint256 => uint256[]) public jobApplications; // jobId => applicationIds
    mapping(address => uint256[]) public freelancerApplications;
    mapping(address => uint256[]) public clientJobs;
    mapping(address => uint256[]) public freelancerJobs;

    event JobPosted(uint256 indexed jobId, address indexed client, uint256 budget);
    event JobApplicationSubmitted(uint256 indexed applicationId, uint256 indexed jobId, address indexed freelancer);
    event ApplicationStatusUpdated(uint256 indexed applicationId, ApplicationStatus status);
    event JobAssigned(uint256 indexed jobId, address indexed freelancer);
    event JobStatusUpdated(uint256 indexed jobId, JobStatus status);
    event JobCompleted(uint256 indexed jobId, address indexed freelancer, uint256 amount);

    modifier onlyRegisteredUser() {
        require(registry.isRegisteredUser(msg.sender), "User not registered");
        _;
    }

    modifier onlyClient() {
        uint8 userType = registry.getUserType(msg.sender);
        require(userType == 2 || userType == 3, "Only clients can perform this action");
        _;
    }

    modifier onlyFreelancer() {
        uint8 userType = registry.getUserType(msg.sender);
        require(userType == 1 || userType == 3, "Only freelancers can perform this action");
        _;
    }

    modifier onlyJobParticipant(uint256 _jobId) {
        require(
            jobs[_jobId].client == msg.sender || 
            jobs[_jobId].assignedFreelancer == msg.sender,
            "Not authorized for this job"
        );
        _;
    }

    constructor(address _registryAddress) {
        registry = ISafeGigRegistry(_registryAddress);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function postJob(
        string memory _title,
        string memory _description,
        string memory _metadataURI,
        uint256 _budget,
        uint256 _deadline,
        string[] memory _requiredSkills,
        string[] memory _tags,
        bool _isUrgent
    ) external onlyRegisteredUser onlyClient whenNotPaused nonReentrant returns (uint256) {
        require(bytes(_title).length > 0, "Title required");
        require(_budget > 0, "Budget must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");

        uint256 jobId = jobCounter.current();
        jobCounter.increment();

        jobs[jobId] = Job({
            id: jobId,
            client: msg.sender,
            assignedFreelancer: address(0),
            title: _title,
            description: _description,
            metadataURI: _metadataURI,
            budget: _budget,
            deadline: _deadline,
            createdAt: block.timestamp,
            status: JobStatus.Open,
            requiredSkills: _requiredSkills,
            tags: _tags,
            isUrgent: _isUrgent
        });

        clientJobs[msg.sender].push(jobId);

        emit JobPosted(jobId, msg.sender, _budget);
        return jobId;
    }

    function applyForJob(
        uint256 _jobId,
        string memory _proposalURI,
        uint256 _proposedBudget,
        uint256 _proposedDeadline
    ) external onlyRegisteredUser onlyFreelancer whenNotPaused nonReentrant returns (uint256) {
        require(jobs[_jobId].status == JobStatus.Open, "Job not available");
        require(jobs[_jobId].client != msg.sender, "Cannot apply to own job");
        require(_proposedBudget > 0, "Proposed budget must be greater than 0");

        uint256 applicationId = applicationCounter.current();
        applicationCounter.increment();

        applications[applicationId] = JobApplication({
            jobId: _jobId,
            freelancer: msg.sender,
            proposalURI: _proposalURI,
            proposedBudget: _proposedBudget,
            proposedDeadline: _proposedDeadline,
            appliedAt: block.timestamp,
            status: ApplicationStatus.Pending
        });

        jobApplications[_jobId].push(applicationId);
        freelancerApplications[msg.sender].push(applicationId);

        emit JobApplicationSubmitted(applicationId, _jobId, msg.sender);
        return applicationId;
    }

    function acceptApplication(uint256 _applicationId) external whenNotPaused nonReentrant {
        JobApplication storage application = applications[_applicationId];
        Job storage job = jobs[application.jobId];

        require(job.client == msg.sender, "Only job owner can accept applications");
        require(job.status == JobStatus.Open, "Job not available");
        require(application.status == ApplicationStatus.Pending, "Application not pending");

        // Update application status
        application.status = ApplicationStatus.Accepted;

        // Update job
        job.assignedFreelancer = application.freelancer;
        job.status = JobStatus.Assigned;
        job.budget = application.proposedBudget;
        job.deadline = application.proposedDeadline;

        // Add to freelancer's jobs
        freelancerJobs[application.freelancer].push(application.jobId);

        // Reject all other pending applications
        uint256[] memory jobApps = jobApplications[application.jobId];
        for (uint256 i = 0; i < jobApps.length; i++) {
            if (jobApps[i] != _applicationId && applications[jobApps[i]].status == ApplicationStatus.Pending) {
                applications[jobApps[i]].status = ApplicationStatus.Rejected;
                emit ApplicationStatusUpdated(jobApps[i], ApplicationStatus.Rejected);
            }
        }

        emit ApplicationStatusUpdated(_applicationId, ApplicationStatus.Accepted);
        emit JobAssigned(application.jobId, application.freelancer);
    }

    function startWork(uint256 _jobId) external onlyJobParticipant(_jobId) {
        require(jobs[_jobId].status == JobStatus.Assigned, "Job not assigned");
        require(jobs[_jobId].assignedFreelancer == msg.sender, "Only assigned freelancer can start work");

        jobs[_jobId].status = JobStatus.InProgress;
        emit JobStatusUpdated(_jobId, JobStatus.InProgress);
    }

    function submitWork(uint256 _jobId, string memory _deliveryURI) external onlyJobParticipant(_jobId) {
        require(jobs[_jobId].status == JobStatus.InProgress, "Job not in progress");
        require(jobs[_jobId].assignedFreelancer == msg.sender, "Only assigned freelancer can submit work");

        jobs[_jobId].status = JobStatus.Submitted;
        // Store delivery URI in metadata or emit in event
        emit JobStatusUpdated(_jobId, JobStatus.Submitted);
    }

    function updateJobStatus(uint256 _jobId, JobStatus _status) external onlyRole(ADMIN_ROLE) {
        jobs[_jobId].status = _status;
        emit JobStatusUpdated(_jobId, _status);
    }

    // View functions
    function getJob(uint256 _jobId) external view returns (Job memory) {
        return jobs[_jobId];
    }

    function getJobApplications(uint256 _jobId) external view returns (uint256[] memory) {
        return jobApplications[_jobId];
    }

    function getClientJobs(address _client) external view returns (uint256[] memory) {
        return clientJobs[_client];
    }

    function getFreelancerJobs(address _freelancer) external view returns (uint256[] memory) {
        return freelancerJobs[_freelancer];
    }

    function getJobDetails(uint256 jobId) external view returns (
        address client,
        address freelancer,
        uint256 budget,
        uint8 status
    ) {
        Job memory job = jobs[jobId];
        return (job.client, job.assignedFreelancer, job.budget, uint8(job.status));
    }

    function getTotalJobs() external view returns (uint256) {
        return jobCounter.current();
    }
}