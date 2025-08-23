// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SafeGig {
    // Events
    event GigCreated(uint256 indexed gigId, address indexed client, address freelancer, uint256 amount);
    event PaymentReleased(uint256 indexed gigId, address indexed freelancer, uint256 amount);

    // Struct
    struct Gig {
        address client;
        address freelancer;
        uint256 amount;
        bool paid;
    }

    // Storage
    uint256 public gigCounter;
    mapping(uint256 => Gig) public gigs;

    // Functions
    function createGig(address _freelancer) external payable {
        require(msg.value > 0, "Payment required");

        gigCounter++;
        gigs[gigCounter] = Gig(msg.sender, _freelancer, msg.value, false);

        emit GigCreated(gigCounter, msg.sender, _freelancer, msg.value);
    }

    function releasePayment(uint256 _gigId) external {
        Gig storage gig = gigs[_gigId];
        require(msg.sender == gig.client, "Only client can release");
        require(!gig.paid, "Already paid");

        gig.paid = true;
        payable(gig.freelancer).transfer(gig.amount);

        emit PaymentReleased(_gigId, gig.freelancer, gig.amount);
    }
}