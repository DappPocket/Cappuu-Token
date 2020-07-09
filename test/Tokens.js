const { expect } = require("chai");
const constants = require("./constants.js");
const IERC20Artifact = require("./contracts/ERC20Interface.json");
const DMMTokenArtifact = require("./contracts/DMMToken.json");
const { web3, accounts, contract, balance } = require('@openzeppelin/test-environment');
const CERC20 = contract.fromArtifact('CERC20');
const ERC20 = contract.fromArtifact('ERC20');
const AaveLendingPoolProvider = contract.fromArtifact('AaveLendingPoolProvider');
const AaveLendingPool = contract.fromArtifact('AaveLendingPool');

describe('Tokens', () => {
    /**
     * Test mainnet USDC
     */
    describe("USDC", () => {
        const USDC = new web3.eth.Contract(
            IERC20Artifact.abi,
            constants.ADDRESSES.MAINNET.USDC
        );
        
        it("Get total supply", async () => {
            const totalSupply = await USDC.methods.totalSupply().call();
            expect(parseInt(totalSupply)).to.be.above(0);
        });
    });
    
    /**
     * Test mainnet DMM USDC
     */
    describe("DMM USDC", () => {
        const MUSDC = new web3.eth.Contract(
            DMMTokenArtifact.abi,
            constants.ADDRESSES.MAINNET.MUSDC
        );
    
        it("Get total supply", async () => {
            const totalSupply = await MUSDC.methods.totalSupply().call();
            expect(parseInt(totalSupply)).to.be.above(0);
        });
        it("Get DMM USDC exchange rate", async () => {
            const exchangeRate = await MUSDC.methods
                .getCurrentExchangeRate()
                .call();
            expect(parseInt(exchangeRate)).to.be.above(1);
        });
    });
    
    /**
     * Test mainnet cUSDC
     */
    describe("Compound USDC", () => {
        before(async () => {
            this.cUSDC = await CERC20.at(constants.ADDRESSES.MAINNET.cUSDC);
        });
    
        it("Get cUSDC exchange rate", async () => {
            const exchangeRate = parseInt(await this.cUSDC.exchangeRateStored());
            expect(exchangeRate).to.be.above(1);
        })
    });

    /**
     * Test mainnet aUSDC
     */
    describe("Aave USDC", () => {
        before(async () => {
            this.aUSDC = await ERC20.at(constants.ADDRESSES.MAINNET.aUSDC);
            this.USDC = await ERC20.at(constants.ADDRESSES.MAINNET.USDC);
        });
    
        it("Mint aUSDC", async () => {
            const [ minter ] = accounts;
            const amount = '100';

            // Get Aave lending pool address and create contracts
            const provider = await AaveLendingPoolProvider.at(constants.ADDRESSES.MAINNET.AAVE_LENDING_ADDRESSES_PROVIDER);
            const aaveLendingPoolCoreAddress = await provider.getLendingPoolCore.call();
            const aaveLendingPoolAddress = await provider.getLendingPool.call();
            const aavelendingPool = await AaveLendingPool.at(aaveLendingPoolAddress);

            // Transfer USDC to minter
            const actualAmount = amount + '000000';  // USDC decimals is 6
            const usdcVault = constants.ADDRESSES.MAINNET.USDC_VAULT;
            await this.USDC.transfer(minter, actualAmount, { from: usdcVault });

            // Approve Aave to spend USDC
            await this.USDC.approve(aaveLendingPoolCoreAddress, actualAmount, { from: minter });
            
            // Deposit 1000 USDC
            await aavelendingPool.deposit(constants.ADDRESSES.MAINNET.USDC, actualAmount, 0, { from: minter });
        
            // Get aUSDC balance
            const aUsdcBalance = await this.aUSDC.balanceOf.call(minter, { from: minter });
            expect(parseInt(aUsdcBalance)).to.be.equal(100000000);
        })
    });
});