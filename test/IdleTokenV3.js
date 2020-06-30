const { expect } = require("chai");
const { web3, accounts, contract } = require('@openzeppelin/test-environment');
const { BN } = require('@openzeppelin/test-helpers');

const constants = require('./constants');
const IdleRebalancerV3 = contract.fromArtifact('IdleRebalancerV3');
const IdlePriceCalculator = contract.fromArtifact('IdlePriceCalculator');
const IdleCompoundV2 = contract.fromArtifact('IdleCompoundV2');
const IdleFulcrumV2 = contract.fromArtifact('IdleFulcrumV2');
const IdleFactoryV3 = contract.fromArtifact('IdleFactoryV3');
const IdleTokenV3 = contract.fromArtifact('IdleTokenV3');
const ERC20Token = contract.fromArtifact('ERC20');

describe('Idle Token V3', () => {
    let Token;
    let idleRebalancer;
    let idlePriceCalculator;

    before(async () => {
        const [ creator, manager, minter ] = accounts;
        // console.log(creator);

        // Deploy wrappers
        this.cUSDCWrapper = await IdleCompoundV2.new(
            constants.ADDRESSES.MAINNET.cUSDC,
            constants.ADDRESSES.MAINNET.USDC,
            {from: creator}
        );
        this.iUSDCWrapper = await IdleFulcrumV2.new(
            constants.ADDRESSES.MAINNET.cUSDC,
            constants.ADDRESSES.MAINNET.USDC,
            {from: creator}
        );

        // Deploy Idle Rebalancer
        idleRebalancer = await IdleRebalancerV3.new(
            constants.ADDRESSES.MAINNET.cUSDC,
            constants.ADDRESSES.MAINNET.USDC,
            this.cUSDCWrapper.address,
            this.iUSDCWrapper.address,
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

        // Config the contracts
        await this.cUSDCWrapper.setIdleToken(Token.address, {from: creator});
        await this.iUSDCWrapper.setIdleToken(Token.address, {from: creator});
        await idleRebalancer.setIdleToken(Token.address, {from: creator});
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

    // Mint
    // it('Mint', () => {
    //     // Give USDC to minter
    //     const USDC = ERC20.at(constants.ADDRESSES.MAINNET.USDC);
    //     await USDC.transfer(minter, amount, { from: vault });
    //     await USDC.approve(this.token.address, amount, { from: minter });
    //     await this.token.mintIdleToken(amount, skipRebalance, { from: who });
    // });

    // Redeem
    it('Redeem', () => {});

    // Rebalance
    it('Rebalance', () => {});

    // Add Wrapper
    it('Add Wrapper', () => {});
});
