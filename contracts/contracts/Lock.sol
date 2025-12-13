// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

error NotOwner();

contract Lock {
  uint public immutable unlockTime;
  address payable public immutable i_owner;

  event Withdrawal(uint amount, uint when);

  constructor() payable {
    unlockTime = block.timestamp + 60 days;
    i_owner = payable(msg.sender);
  }

  function withdraw() public {

    require(block.timestamp >= unlockTime, "You can't withdraw yet");
    if (msg.sender != i_owner) { revert NotOwner();}

    emit Withdrawal(address(this).balance, block.timestamp);

    i_owner.transfer(address(this).balance);
  }
}
