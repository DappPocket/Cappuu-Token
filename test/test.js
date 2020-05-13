const { expect } = require("chai");
const constants = require("./constants.js");
const IERC20Artifact = require("./contracts/ERC20Interface.json");
const DMMTokenArtifact = require("./contracts/DMMToken.json");
const { web3 } = require('@openzeppelin/test-environment');

const USDC = new web3.eth.Contract(
    IERC20Artifact.abi,
    constants.USDC_MAINNET_ADDRESS
);

const MUSDC = new web3.eth.Contract(
    DMMTokenArtifact.abi,
    constants.MUSDC_MAINNET_ADDRESS
);

/**
 * Test mainnet USDC
 */
describe("USDC", () => {
    it("Get total supply", async () => {
        const totalSupply = await USDC.methods.totalSupply().call();
        expect(parseInt(totalSupply)).to.be.above(0);
        // console.log("SDC totalSupply:", totalSupply);
    });
});

/**
 * Test mainnet DMM USDC
 */
describe("DMM USDC", () => {
    it("Get total supply", async () => {
        const totalSupply = await MUSDC.methods.totalSupply().call();
        expect(parseInt(totalSupply)).to.be.above(0);
        // console.log("DMM USDC totalSupply:", totalSupply);
    });
    it("Get DMM USDC exchange rate", async () => {
        const exchangeRate = await MUSDC.methods
            .getCurrentExchangeRate()
            .call();
        expect(parseInt(exchangeRate)).to.be.above(0);
        // console.log("DMM USDC exchangeRate:", exchangeRate);
    });
});
