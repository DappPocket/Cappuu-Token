const { expect } = require("chai");
const { web3, accounts, contract } = require('@openzeppelin/test-environment');
const constants = require("./constants.js");

const DharmaUSDCImplementationV1 = contract.fromArtifact('DharmaUSDCImplementationV1');

describe("Test Cappuu USDC", () => {
    let dharmaUSDC;

    before(async () => {
        dharmaUSDC = await DharmaUSDCImplementationV1.new();
    });

    it('Get Cappuu USDC MetaData', async () => {
        const name = await dharmaUSDC.name();
        expect(name).to.be.equal("Cappuu USD Coin");
        const underlying = await dharmaUSDC.getUnderlying();
        expect(underlying).to.be.equal(constants.USDC_MAINNET_ADDRESS);
    });

    it('Get Cappuu USDC Exchange Rate', async () => {
        // TODO: update this
    });

});