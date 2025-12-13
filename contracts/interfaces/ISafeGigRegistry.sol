// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ISafeGigRegistry {
    struct FreelancerStats {
        uint256 jobsCompleted;
        uint256 totalEarned;
        uint256 successRate;
        uint256 responseTime;
        uint256 hourlyRate;
    }

    struct ClientStats {
        uint256 jobsPosted;
        uint256 jobsCompleted;
        uint256 totalSpent;
        uint256 responseTime;
    }

    function isRegisteredUser(address user) external view returns (bool);
    function getUserType(address user) external view returns (uint8);
    function getUserProfile(address user) external view returns (string memory);

    function getClientStats(
        address client
    ) external view returns (ClientStats memory);

    function updateClientStats(
        address client,
        uint256 totalSpent,
        uint256 jobsPosted,
        uint256 jobsCompleted,
        uint256 responseTime
    ) external;

    function freelancerStats(
        address freelancer
    ) external view returns (FreelancerStats memory);

    function updateFreelancerStats(
        address freelancer,
        uint256 jobsCompleted,
        uint256 totalEarned,
        uint256 successRate,
        uint256 responseTime,
        uint256 hourlyRate
    ) external;
}
