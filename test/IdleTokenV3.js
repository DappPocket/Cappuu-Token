const { expect } = require("chai");
const { web3, accounts, contract, balance } = require('@openzeppelin/test-environment');
const { BN,  } = require('@openzeppelin/test-helpers');

const constants = require('./constants');
const IdleRebalancerV3 = contract.fromArtifact('IdleRebalancerV3');
const IdlePriceCalculator = contract.fromArtifact('IdlePriceCalculator');
const IdleCompoundV2 = contract.fromArtifact('IdleCompoundV2');
const IdleFulcrumV2 = contract.fromArtifact('IdleFulcrumV2');
const IdleFactoryV3 = contract.fromArtifact('IdleFactoryV3');
const IdleTokenV3 = contract.fromArtifact('IdleTokenV3');
const IdleAave = contract.fromArtifact('IdleAave');
const IdleDyDx = contract.fromArtifact('IdleDyDx');
const ERC20 = contract.fromArtifact('ERC20');

describe('Idle Token V3', () => {
    let Token;
    let idleRebalancer;
    let idlePriceCalculator;
    const [ creator, manager, minter ] = accounts;
    const usdcVault = constants.ADDRESSES.MAINNET.USDC_VAULT;

    before(async () => {
        // Deploy wrappers
        this.cUSDCWrapper = await IdleCompoundV2.new(
            constants.ADDRESSES.MAINNET.cUSDC,
            constants.ADDRESSES.MAINNET.USDC,
            {from: creator}
        );
        this.iUSDCWrapper = await IdleFulcrumV2.new(
            constants.ADDRESSES.MAINNET.iUSDC,
            constants.ADDRESSES.MAINNET.USDC,
            {from: creator}
        );
        this.aUSDCWrapper = await IdleAave.new(
            constants.ADDRESSES.MAINNET.aUSDC,
            constants.ADDRESSES.MAINNET.USDC,
            {from: creator}
        );
        this.yxUSDCWrapper = await IdleDyDx.new(
            constants.ADDRESSES.MAINNET.yxUSDC,
            constants.ADDRESSES.MAINNET.USDC,
            3,
            {from: creator}
        );

        // Deploy Idle Rebalancer
        idleRebalancer = await IdleRebalancerV3.new(
            constants.ADDRESSES.MAINNET.cUSDC,
            constants.ADDRESSES.MAINNET.iUSDC,
            constants.ADDRESSES.MAINNET.aUSDC,
            constants.ADDRESSES.MAINNET.yxUSDC,
            manager,
            { from: creator }
        );

        // Deploy Idle PriceCalculator
        idlePriceCalculator = await IdlePriceCalculator.new({ from: creator });

        // Deploy Idle Factory
        // this.Factory = await IdleFactoryV3.new({ from: creator  });

        // Deploy Idle Token (USDC)
        this.params = [
            'IdleUSDC',
            'IDLEUSDC',
            18,
            constants.ADDRESSES.MAINNET.USDC,
            constants.ADDRESSES.MAINNET.cUSDC,
            constants.ADDRESSES.MAINNET.iUSDC,
            idleRebalancer.address,
            idlePriceCalculator.address,
            this.cUSDCWrapper.address,
            this.iUSDCWrapper.address
        ];
        Token = await IdleTokenV3.new(...this.params, { from: creator });

        // Set config of wrappers
        await this.cUSDCWrapper.setIdleToken(Token.address, { from: creator });
        await this.iUSDCWrapper.setIdleToken(Token.address, { from: creator });
        await this.aUSDCWrapper.setIdleToken(Token.address, { from: creator });
        await this.yxUSDCWrapper.setIdleToken(Token.address, { from: creator });

        // Set config of idleRebalancer
        await idleRebalancer.setIdleToken(Token.address, { from: creator });

        // Set wrappers of idleToken
        await Token.setProtocolWrapper(
            constants.ADDRESSES.MAINNET.aUSDC,
            this.aUSDCWrapper.address,
            { from: creator }
        );
        await Token.setProtocolWrapper(
            constants.ADDRESSES.MAINNET.yxUSDC,
            this.yxUSDCWrapper.address,
            { from: creator }
        );

        // Helper functions
        this.setRebAllocations = async (allocs) => {
            await idleRebalancer.setAllocations(
                [allocs[0], allocs[1], allocs[2], allocs[3]],
                [constants.ADDRESSES.MAINNET.cUSDC, constants.ADDRESSES.MAINNET.iUSDC, constants.ADDRESSES.MAINNET.aUSDC, constants.ADDRESSES.MAINNET.yxUSDC],
                { from: manager }
            );
        }
    });

    describe('Check config of Idle Token', () => {
        it('constructor set a name', async function () {
            expect(await Token.name()).to.equal('IdleUSDC');
        });
        it('constructor set a symbol', async function () {
            expect(await Token.symbol()).to.equal('IDLEUSDC');
        });
        it('constructor set a decimals', async function () {
            const decimals = (await Token.decimals()).toString();
            expect(decimals).to.equal('18');
        });
        it('constructor set a token (USDC) address', async function () {
            expect(await Token.token()).to.equal(constants.ADDRESSES.MAINNET.USDC);
        });
        it('constructor set a iToken (iUSDC)) address', async function () {
            expect(await Token.iToken()).to.equal(constants.ADDRESSES.MAINNET.iUSDC);
        });
        it('constructor set a tokenDecimals', async function () {
            const tokenDecimals = (await Token.tokenDecimals()).toString();
            expect(tokenDecimals).to.equal('6');
        });
        it('constructor set a rebalancer address', async function () {
            expect(await Token.rebalancer()).to.equal(idleRebalancer.address);
        });
        it('constructor set a priceCalculator address', async function () {
            expect(await Token.priceCalculator()).to.equal(idlePriceCalculator.address);
        });
    });

    describe('Check allocation, price & apr of Idle Token', () => {
        it('Calculate current tokenPrice when IdleToken supply is 0', async () => {
            const price = (await Token.tokenPrice.call()).toString();
            expect(price).to.equal('1000000');
        });
        // it('Check current allocation', async () => {
        //     const resGetParams = await Token.getCurrentAllocations.call();
        //     console.log(resGetParams);
        // });
        // TODO: Check apr
    });

    describe('Mint & Redeem Idle Token', () => {
        it('Mint 100 Idle USDC', async () => {
            const amount = '100000000'; // USDC decimals is 6

            // Transfer USDC to minter
            // await web3.eth.sendTransaction({ from: ethVault, to: usdcVault, value: '200000000000000000'});
            const USDC = await ERC20.at(constants.ADDRESSES.MAINNET.USDC);
            await USDC.transfer(minter, amount, { from: usdcVault });

            // Approve Idle Token to spend USDC
            await USDC.approve(Token.address, amount, { from: minter });

            // Mint Idle Token
            await Token.mintIdleToken(amount, false, { from: minter });

            // Check Idle Token balance
            const balance = await Token.balanceOf.call(minter, { from: minter });
            expect(balance.toString()).to.equal('100000000000000000000');
        });
        it('Redeem 10 Idle USDC', async () => {

        });
    });

    // Set Allocation
    describe('Set Allocation', () => {
        // it('Set allocation', async () => {
        //     this.setRebAllocations(['30000', '30000', '20000', '20000']);
        // });
    });

    // Add Wrapper
    describe('Add Wrapper', () => {});
});
