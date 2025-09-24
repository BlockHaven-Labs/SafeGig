// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IJobManager {
    function getJobDetails(
        uint256 jobId
    )
        external
        view
        returns (
            address client,
            address freelancer,
            uint256 budget,
            uint8 status
        );

    function getJobStatus(uint256 _jobId) external view returns (uint8);

    function isJobParty(
        uint256 _jobId,
        address _party
    ) external view returns (bool);
}
