// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract UkrAngelsNFT is ERC721('UkrainesAngels NFT Collection', "UKRNFT"), Ownable { //TODO: change name and ticker
  string private baseURI;
  uint256 public totalSupply;
  uint256 public totalDonated;

  mapping(address => bool) public nftOwners;
  uint256 public nftOwnersCount;

  uint256 BASE_PRICE = 1 ether;
  uint256 MAX_SUPPLY = 10000;

  constructor (string memory baseURI_) {
    baseURI = baseURI_;
  }

  receive() external payable {
    totalDonated+= msg.value;
  }

  function buy() external payable {
    require(totalSupply < MAX_SUPPLY, "Max supply exceeded");
    require(msg.value >= BASE_PRICE, "Invalid NFT buy price amount");

    totalDonated+= msg.value;
    if (!nftOwners[msg.sender]) {
      nftOwners[msg.sender] = true;
      nftOwnersCount++;
    }

    _mint(msg.sender, totalSupply++);
  }

  function buyMore(uint8 amount) external payable {
    require(amount > 0 && amount <= 10, "Invalid amount");
    require((totalSupply + amount) <= MAX_SUPPLY, "Max supply exceeded");
    require(msg.value >= BASE_PRICE * uint256(amount), "Invalid NFT buy price amount");

    totalDonated+= msg.value;
    if (!nftOwners[msg.sender]) {
      nftOwners[msg.sender] = true;
      nftOwnersCount++;
    }

    for (uint8 i = 0; i < amount; i++) {
      _mint(msg.sender, totalSupply++);
    }
  }

  function setBaseURI(string calldata uri) external onlyOwner {
    baseURI = uri;
  }

  function _baseURI() internal override view returns (string memory) {
    return baseURI;
  }

  function donate(address payable receiver, uint256 amount) external onlyOwner {
    receiver.transfer(amount);
  }

  function retrieveTokens(address tokenContractAddress, uint256 amount) public onlyOwner {
    IERC20(tokenContractAddress).transfer(msg.sender, amount);
  }

}
