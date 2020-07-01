const { expect } = require("chai");
const constants = require("./constants.js");
const IERC20Artifact = require("./contracts/ERC20Interface.json");
const DMMTokenArtifact = require("./contracts/DMMToken.json");
const { web3, accounts, contract, balance } = require('@openzeppelin/test-environment');
const CERC20 = contract.fromArtifact('CERC20');

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
});