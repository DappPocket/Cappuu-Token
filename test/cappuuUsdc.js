const { expect } = require("chai");
const { web3, accounts, contract } = require('@openzeppelin/test-environment');
const {
    // BN,           // Big Number support
    // constants,    // Common constants, like the zero address and largest integers
    // expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');
const constants = require("./constants.js");

const DharmaUSDCImplementationV1 = contract.fromArtifact('DharmaUSDCImplementationV1');

describe("Test Cappuu USDC", () => {
    let cappuuUSDC;
    // const testAccount = '0x33b8287511ac7F003902e83D642Be4603afCd876';

    before(async () => {
        cappuuUSDC = await DharmaUSDCImplementationV1.new();
    });

    it('Get Cappuu USDC MetaData', async () => {
        // Check token name
        const name = await cappuuUSDC.name();
        expect(name).to.be.equal("Cappuu USD Coin");

        // Check underlying token address
        const underlying = await cappuuUSDC.getUnderlying();
        expect(underlying).to.be.equal(constants.USDC_MAINNET_ADDRESS);

        // Check version
        const version = await cappuuUSDC.getVersion();
        expect(parseInt(version)).to.be.equal(constants.VERSION);

        // Check balance of underlying
        // const balanceUnderlying = await cappuuUSDC.balanceOfUnderlying(testAccount);
        // expect(parseInt(balanceUnderlying)).to.be.equal(0);

        // Check total supply of underlying
        // const totalSupplyUnderlying = await cappuuUSDC.totalSupplyUnderlying();
        // expect(parseInt(totalSupplyUnderlying)).to.be.equal(0);
    });                 

    // it('Get DMM USDC Rates', async () => {
    //     const result = await cappuuUSDC._getCurrentMTokenRates();
    //     console.log(result);
    // });

    it('Get Cappuu USDC Interest Rate (Supply Rate)', async () => {
        const interestRate = await cappuuUSDC.supplyRatePerBlock();
        expect(parseInt(interestRate)).to.be.above(0);
        // console.log(interestRate.toString());
    });

    it('Get Cappuu USDC Exchange Rate', async () => {
        const exchangeRate = await cappuuUSDC.exchangeRateCurrent();
        expect(parseInt(exchangeRate)).to.be.equal(10000000000000000);
        // console.log(parseInt(exchangeRate));
    });

    it('Accure Interest', async () => {
        const exchangeRate = await cappuuUSDC.exchangeRateCurrent();
        expect(parseInt(exchangeRate)).to.be.equal(10000000000000000);
        // console.log(parseInt(exchangeRate));

        // Accure interest
        const blockNumber = await web3.eth.getBlockNumber();
        await cappuuUSDC.accrueInterest();

        const exchangeRate2 = await cappuuUSDC.exchangeRateCurrent();
        expect(parseInt(exchangeRate2)).to.be.above(parseInt(exchangeRate));
        // console.log(parseInt(exchangeRate2));

        // Check accural block number
        const accuralBlock = await cappuuUSDC.accrualBlockNumber();
        expect(parseInt(accuralBlock)).to.be.above(blockNumber);
    });

});