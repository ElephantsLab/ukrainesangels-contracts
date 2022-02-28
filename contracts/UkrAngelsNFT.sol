// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract UkrAngelsNFT is ERC721('UkrainesAngels NFT Collection', "UKRNFT"), Ownable { //TODO: change name and ticker
  string private baseURI;
  uint256 private totalSupply;

  uint256 BASE_PRICE = 0.5 ether;

  constructor (string memory baseURI_) {
    baseURI = baseURI_;
  }

  receive() external payable {}

  function buy() external payable {
    require(msg.value >= BASE_PRICE, "Invalid NFT buy price amount");

    _mint(msg.sender, totalSupply++);
  }

  function buyMore(uint8 amount) external payable {
    require(amount > 0 && amount <= 10, "Invalid amount");
    require(msg.value >= BASE_PRICE * uint256(amount), "Invalid NFT buy price amount");

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
