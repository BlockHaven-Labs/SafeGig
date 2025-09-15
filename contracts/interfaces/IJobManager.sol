interface IJobManager {
    function getJobDetails(uint256 jobId) external view returns (
        address client,
        address freelancer,
        uint256 budget,
        uint8 status
    );
}