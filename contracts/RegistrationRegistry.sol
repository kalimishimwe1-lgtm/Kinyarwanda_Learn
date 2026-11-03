// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract RegistrationRegistry {
    mapping(bytes32 => bool) public usedRegistrationHashes;

    event RegistrationRecorded(
        address indexed account,
        bytes32 indexed registrationHash,
        uint256 timestamp
    );

    function recordRegistration(bytes32 registrationHash) external {
        require(registrationHash != bytes32(0), "Registration hash is required");
        require(!usedRegistrationHashes[registrationHash], "Registration hash already used");

        usedRegistrationHashes[registrationHash] = true;
        emit RegistrationRecorded(msg.sender, registrationHash, block.timestamp);
    }
}
