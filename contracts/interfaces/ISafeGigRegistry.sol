interface ISafeGigRegistry {
    function isRegisteredUser(address user) external view returns (bool);
    function getUserType(address user) external view returns (uint8);
    function getUserProfile(address user) external view returns (string memory);
}