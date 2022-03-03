const UkrAngelsNFT = artifacts.require("UkrAngelsNFT");
const ERC20 = artifacts.require("TestERC20");

module.exports = async function (deployer) {
  await deployer.deploy(UkrAngelsNFT, "");
  await deployer.deploy(ERC20);
};