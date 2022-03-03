const UKRAngelsNFT = artifacts.require("UkrAngelsNFT");
const Tokens = artifacts.require("TestERC20");

const {
    BN, 
    expectRevert
} = require('@openzeppelin/test-helpers');

contract("UkrAngelsNFT", async accounts => {
    const [deployer, accountOne, accountTwo] = accounts;

    let UkrAngelsNFT, UkrAngelsNFTAddress, ERC20, ERC20Address;
    let accTwoTokensAmount = new BN(200);

    let expectedTotalSupply = new BN(0);

    before(async () => {
        UkrAngelsNFT = await UKRAngelsNFT.deployed({from: deployer});
        UkrAngelsNFTAddress = UkrAngelsNFT.address;

        ERC20 = await Tokens.new({from: deployer});
        ERC20Address = ERC20.address;

        // mint tokens for accountTwo
        const tokenbits = (new BN(10)).pow(new BN(18));
        await ERC20.mint(accountTwo, accTwoTokensAmount.mul(tokenbits), { from: accountTwo });       
    });

    it("the buyer cannot buy cheaper than the cost", async () => {
        const tokenbits = (new BN(10)).pow(new BN(17));
        const lessCost = new BN(1).mul(tokenbits);

        await expectRevert( 
            UkrAngelsNFT.buy({from: accountOne, value: lessCost}),
            "Invalid NFT buy price amount"
        )
    });

    it("the buyer can buy NFT for its cost", async () => {
        const tokenbits = (new BN(10)).pow(new BN(18));
        let NFTcost = new BN(2).mul(tokenbits);
        let buyedNFTamount = new BN(1);

        let contractBalanceBefore = await web3.eth.getBalance(UkrAngelsNFTAddress);
        
        await UkrAngelsNFT.buy({from: accountOne, value: NFTcost});

        expectedTotalSupply = expectedTotalSupply.add(buyedNFTamount);
        let userNFTbalance = await UkrAngelsNFT.balanceOf(accountOne, {from: accountOne});
        
        assert.equal(String(userNFTbalance), buyedNFTamount, "user balance of buyed NFT is wrong");

        let contractBalanceAfter = await web3.eth.getBalance(UkrAngelsNFTAddress);
        assert.equal(String(new BN(contractBalanceBefore).add(NFTcost)), contractBalanceAfter, "contract balance of crypto is wrong");

        let totalDonatedAmount = await UkrAngelsNFT.totalDonated({from: deployer});
        assert.equal(totalDonatedAmount, contractBalanceAfter, "totalDonated param written incorrectly");


        let totalSupplyAmount = await UkrAngelsNFT.totalSupply({from: deployer});
        assert.equal(String(totalSupplyAmount), expectedTotalSupply, "totalSupply param written incorrectly");
    });

    it("expect revert if buyer tries to buy zero NFT", async () => {
        let amount = new BN(0);
        const tokenbits = (new BN(10)).pow(new BN(18));
        let NFTcost = new BN(1).mul(tokenbits);

        await expectRevert(
            UkrAngelsNFT.buyMore(amount, {from: accountOne, value: NFTcost}),
            "Invalid amount"
        )

        amount = new BN(11);
        NFTcost = new BN(amount).mul(tokenbits);

        await expectRevert(
            UkrAngelsNFT.buyMore(amount, {from: accountOne, value: NFTcost}),
            "Invalid amount"
        )
    });

    it("expect revert if buyer tries to buy for less than the default price", async () => {
        let amount = new BN(10);
        const tokenbits = (new BN(10)).pow(new BN(18));
        let NFTcost = new BN(1).mul(tokenbits);

        await expectRevert(
            UkrAngelsNFT.buyMore(amount, {from: accountOne, value: NFTcost}),
            "Invalid NFT buy price amount"
        )
    });

    it("user can send crypto to contract address", async () => {
        const tokenbits = (new BN(10)).pow(new BN(18));
        let userDonate = new BN(5).mul(tokenbits);

        let contractBalanceBefore = await web3.eth.getBalance(UkrAngelsNFTAddress);

        await web3.eth.sendTransaction({from: accountOne, to: UkrAngelsNFTAddress, value: userDonate});

        let contractBalanceAfter = await web3.eth.getBalance(UkrAngelsNFTAddress);
        let totalDonatedAmount = await UkrAngelsNFT.totalDonated({from: deployer});

        assert.equal(String(new BN(contractBalanceBefore).add(userDonate)), contractBalanceAfter, "contract balance of crypto is wrong");
        assert.equal(totalDonatedAmount, contractBalanceAfter, "totalDonated param written incorrectly");
    });

    it("the buyer can buy more than one NFT for its cost", async () => {
        let amount = new BN(9);
        const tokenbits = (new BN(10)).pow(new BN(18));
        let NFTcost = new BN(amount).mul(tokenbits);

        let accOneNFTbalanceBefore = await UkrAngelsNFT.balanceOf(accountOne, {from: accountOne});
        let contractBalanceBefore = await web3.eth.getBalance(UkrAngelsNFTAddress);

        await UkrAngelsNFT.buyMore(amount, {from: accountOne, value: NFTcost});

        expectedTotalSupply = expectedTotalSupply.add(amount);

        let accOneNFTbalanceAfter = await UkrAngelsNFT.balanceOf(accountOne, {from: accountOne});
        let contractBalanceAfter = await web3.eth.getBalance(UkrAngelsNFTAddress);

        assert.equal(String(accOneNFTbalanceBefore.add(amount)), accOneNFTbalanceAfter, "accountOne balance of NFTs is wrong");
        assert.equal(String(new BN(contractBalanceBefore).add(NFTcost)), contractBalanceAfter, "contract balance of crypto is wrong");

        let totalDonatedAmount = await UkrAngelsNFT.totalDonated({from: deployer});
        assert.equal(totalDonatedAmount, contractBalanceAfter, "totalDonated param written incorrectly");

        let totalSupplyAmount = await UkrAngelsNFT.totalSupply({from: deployer});
        assert.equal(String(totalSupplyAmount), expectedTotalSupply, "totalSupply param written incorrectly");

        amount = new BN(10);
        NFTcost = new BN(amount).mul(tokenbits);

        let accTwoNFTbalanceBefore = await UkrAngelsNFT.balanceOf(accountTwo, {from: accountTwo});
        contractBalanceBefore = await web3.eth.getBalance(UkrAngelsNFTAddress);

        await UkrAngelsNFT.buyMore(amount, {from: accountTwo, value: NFTcost});

        expectedTotalSupply = expectedTotalSupply.add(amount);

        let accTwoNFTbalanceAfter = await UkrAngelsNFT.balanceOf(accountTwo, {from: accountTwo});
        contractBalanceAfter = await web3.eth.getBalance(UkrAngelsNFTAddress);

        assert.equal(String(accTwoNFTbalanceBefore.add(amount)), accTwoNFTbalanceAfter, "accountTwo balance of NFTs is wrong");
        assert.equal(String(new BN(contractBalanceBefore).add(NFTcost)), contractBalanceAfter, "contract balance of crypto is wrong");

        totalDonatedAmount = await UkrAngelsNFT.totalDonated({from: deployer});
        assert.equal(totalDonatedAmount, contractBalanceAfter, "totalDonated param written incorrectly");

        totalSupplyAmount = await UkrAngelsNFT.totalSupply({from: deployer});
        assert.equal(String(totalSupplyAmount), expectedTotalSupply, "totalSupply param written incorrectly");
    });

    it("expect revert if MAX_SUPPLY param limit exceeded", async () => {
        const tokenbits = (new BN(10)).pow(new BN(18));
        let NFTcost = new BN(1).mul(tokenbits);
        
        await expectRevert(
            UkrAngelsNFT.buy({from: accountOne, value: NFTcost}),
            "Max supply exceeded"
        );

        let amount = new BN(1);
        await expectRevert(
            UkrAngelsNFT.buyMore(amount, {from: accountOne, value: NFTcost}),
            "Max supply exceeded"
        );
    });

    it("not owner cannot receive crypto for NFT", async () => {
        const tokenbits = (new BN(10)).pow(new BN(18));
        let contractCryptoBalance = await web3.eth.getBalance(UkrAngelsNFTAddress);

        await expectRevert( 
            UkrAngelsNFT.donate(deployer, contractCryptoBalance, {from: accountOne}),
            "Ownable: caller is not the owner"
        );
    });

    it("owner can receive crypto for NFTs", async () => {
        const tokenbits = (new BN(10)).pow(new BN(18));
        let balanceBefore = await web3.eth.getBalance(deployer);
        let contractCryptoBalance = await web3.eth.getBalance(UkrAngelsNFTAddress);

        let receipt = await UkrAngelsNFT.donate(deployer, contractCryptoBalance, {from: deployer});

        const gasUsed = receipt.receipt.gasUsed;

        const tx = await web3.eth.getTransaction(receipt.tx);
        const gasPrice = tx.gasPrice;

        let gasFee = (new BN(gasUsed)).mul(new BN(gasPrice));

        let balanceAfter = await web3.eth.getBalance(deployer);
        let expectedBalance = ((new BN(balanceBefore)).add(new BN(contractCryptoBalance))).sub(gasFee);
        let contractBalance = await web3.eth.getBalance(UkrAngelsNFTAddress);
        let expectedContractBalance = new BN(0);
        assert.equal(String(balanceAfter), expectedBalance, "wrong balance after donation received");
        assert.equal(String(contractBalance), expectedContractBalance, "wrong balance of contract");
    });

    it("user can transfer tokens to contract", async () => {
        const tokenbits = (new BN(10)).pow(new BN(18));
        let transferedTokens = accTwoTokensAmount.mul(tokenbits);

        let accTwoBalanceBefore = await ERC20.balanceOf.call(accountTwo, { from: accountTwo });
        let contractBalanceBefore = await ERC20.balanceOf.call(UkrAngelsNFTAddress, { from: accountTwo });

        await ERC20.approve(UkrAngelsNFTAddress, transferedTokens, { from: accountTwo });
        await ERC20.transfer(UkrAngelsNFTAddress, transferedTokens, { from: accountTwo });

        let accTwoBalanceAfter = await ERC20.balanceOf.call(accountTwo, { from: accountTwo });
        let contractBalanceAfter = await ERC20.balanceOf.call(UkrAngelsNFTAddress, { from: accountTwo });

        assert.equal(String(accTwoBalanceBefore.sub(transferedTokens)), accTwoBalanceAfter, "user balance of tokens is wrong");
        assert.equal(String(contractBalanceBefore.add(transferedTokens)), contractBalanceAfter, "contract balance of tokens is wrong");
    });

    it("not owner cannot retrieve tokens from contract", async () => {
        let contractBalance = await ERC20.balanceOf.call(UkrAngelsNFTAddress, { from: accountTwo });

        await expectRevert(
            UkrAngelsNFT.retrieveTokens(ERC20Address, contractBalance, { from: accountTwo }),
            "Ownable: caller is not the owner"
        )
    });

    it("owner can retrieve tokens from contract", async () => {
        let contractBalanceBefore = await ERC20.balanceOf.call(UkrAngelsNFTAddress, { from: deployer });
        let ownerBalanceBefore = await ERC20.balanceOf.call(deployer, { from: deployer });

        await UkrAngelsNFT.retrieveTokens(ERC20Address, contractBalanceBefore, { from: deployer });

        let contractBalanceAfter = await ERC20.balanceOf.call(UkrAngelsNFTAddress, { from: deployer });
        let ownerBalanceAfter = await ERC20.balanceOf.call(deployer, { from: deployer });

        assert.equal(String(contractBalanceBefore.sub(contractBalanceBefore)), contractBalanceAfter, "contract balance of tokens is wrong");
        assert.equal(String(ownerBalanceBefore.add(contractBalanceBefore)), ownerBalanceAfter, "owner balance of tokens is wrong");
    });
})