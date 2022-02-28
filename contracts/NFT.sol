pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC721_prod is ERC721('NFT Token Name', "NFT"), Ownable { //TODO: change name and ticker
  string private baseURI;
  uint256 private totalSupply;

  constructor (string memory baseURI_) {
    baseURI = baseURI_;
  }

  function mint(address _address) external payable onlyOwner {
    require(msg.value > 0.01 ether, "Invalid NFT buy price amount");

    _mint(_address, totalSupply++);
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
