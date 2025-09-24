// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";

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
    event ContractRegistered(string contractName, address contractAddress);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    // Register already deployed contracts
    function registerContracts(
        address _registry,
        address _jobManager,
        address _escrowManager,
        address _reputationSystem,
        address _disputeResolver
    ) external onlyRole(ADMIN_ROLE) {
        require(_registry != address(0), "Invalid registry address");
        require(_jobManager != address(0), "Invalid jobManager address");
        require(_escrowManager != address(0), "Invalid escrowManager address");
        require(_reputationSystem != address(0), "Invalid reputationSystem address");
        require(_disputeResolver != address(0), "Invalid disputeResolver address");

        contracts = ContractAddresses({
            registry: _registry,
            jobManager: _jobManager,
            escrowManager: _escrowManager,
            reputationSystem: _reputationSystem,
            disputeResolver: _disputeResolver
        });

        emit SafeGigDeployed(contracts);
        
        emit ContractRegistered("SafeGigRegistry", _registry);
        emit ContractRegistered("JobManager", _jobManager);
        emit ContractRegistered("EscrowManager", _escrowManager);
        emit ContractRegistered("ReputationSystem", _reputationSystem);
        emit ContractRegistered("DisputeResolver", _disputeResolver);
    }

    function getContractAddresses() external view returns (ContractAddresses memory) {
        return contracts;
    }

    function isSystemDeployed() external view returns (bool) {
        return contracts.registry != address(0) && 
               contracts.jobManager != address(0) && 
               contracts.escrowManager != address(0) && 
               contracts.reputationSystem != address(0) && 
               contracts.disputeResolver != address(0);
    }
}