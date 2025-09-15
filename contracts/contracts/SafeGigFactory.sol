// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SafeGigFactory is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct ContractAddresses {
        address registry;
        address jobManager;
        address escrowManager;
        address reputationSystem;
        address disputeResolver;
    }

    ContractAddresses public contracts;
    
    event SafeGigDeployed(ContractAddresses contractAddresses);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function deploySafeGig(address _feeRecipient) external onlyRole(ADMIN_ROLE) returns (ContractAddresses memory) {
        // Deploy Registry first
        SafeGigRegistry registry = new SafeGigRegistry();
        
        // Deploy JobManager
        JobManager jobManager = new JobManager(address(registry));
        
        // Deploy EscrowManager
        EscrowManager escrowManager = new EscrowManager(
            address(jobManager),
            address(registry),
            _feeRecipient
        );
        
        // Deploy ReputationSystem
        ReputationSystem reputationSystem = new ReputationSystem(
            address(registry),
            address(jobManager)
        );
        
        // Deploy DisputeResolver
        DisputeResolver disputeResolver = new DisputeResolver(
            address(jobManager),
            address(registry)
        );

        contracts = ContractAddresses({
            registry: address(registry),
            jobManager: address(jobManager),
            escrowManager: address(escrowManager),
            reputationSystem: address(reputationSystem),
            disputeResolver: address(disputeResolver)
        });

        emit SafeGigDeployed(contracts);
        return contracts;
    }

    function getContractAddresses() external view returns (ContractAddresses memory) {
        return contracts;
    }
}