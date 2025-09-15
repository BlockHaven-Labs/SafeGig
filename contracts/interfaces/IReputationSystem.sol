interface IReputationSystem {
    function updateRating(address user, uint256 rating, uint256 jobId) external;
    function getUserRating(address user) external view returns (uint256);
}