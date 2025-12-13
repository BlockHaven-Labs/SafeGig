// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IDisputeResolver {
    function getDispute(uint256 _disputeId) external view returns (
        uint256 id,
        uint256 jobId,
        uint256 escrowId,
        address client,
        address freelancer,
        address initiator,
        string memory reason,
        string memory evidenceURI,
        uint8 status,
        uint8 resolution,
        address assignedArbitrator,
        uint256 createdAt,
        uint256 resolvedAt,
        uint256 refundPercentage,
        string memory resolutionNote
    );

    function getJobDispute(uint256 _jobId) external view returns (uint256);
}