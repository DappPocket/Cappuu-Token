const { expect } = require("chai");
const { BN, time } = require('@openzeppelin/test-helpers');
const constants = require('./constants');

const IdleRebalancerV3 = artifacts.require('IdleRebalancerV3');
const IdlePriceCalculator = artifacts.require('IdlePriceCalculator');
const IdleCompoundV2 = artifacts.require('IdleCompoundV2');
const IdleFulcrumV2 = artifacts.require('IdleFulcrumV2');
const IdleFactoryV3 = artifacts.require('IdleFactoryV3');
const IdleTokenV3 = artifacts.require('IdleTokenV3');
const IdleAave = artifacts.require('IdleAave');
const IdleDyDx = artifacts.require('IdleDyDx');
const ERC20 = artifacts.require('ERC20');
const CERC20 = artifacts.require('CERC20');

contract('Idle Token V3', (accounts) => {
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
        /**
         * @param {string} amount e.g. 1000 USDC
         * @param {string} from
         */
        this.mintIdleToken = async (amount, from) => {
            const actualAmount = amount + '000000';  // USDC decimals is 6

            // Transfer USDC to minter
            const USDC = await ERC20.at(constants.ADDRESSES.MAINNET.USDC);
            await USDC.transfer(minter, actualAmount, { from: usdcVault });

            // Approve Idle Token to spend USDC
            await USDC.approve(Token.address, actualAmount, { from });

            // Mint Idle Token
            await Token.mintIdleToken(actualAmount, true, { from });
            // If false, it will trigger rebalance.
            // If true, it will skip rebalacne. Therefore, you need to call rebalance before if the allocation is updated.
        }
        /**
         * @param {array} allocs 
         */
        this.setRebAllocations = async (allocs) => {
            await idleRebalancer.setAllocations(
                [allocs[0], allocs[1], allocs[2], allocs[3]],
                [constants.ADDRESSES.MAINNET.cUSDC, constants.ADDRESSES.MAINNET.iUSDC, constants.ADDRESSES.MAINNET.aUSDC, constants.ADDRESSES.MAINNET.yxUSDC],
                { from: manager }
            );
        }
        /**
         * @param {array} allocs 
         */
        this.testAllocations = async (allocs) => {
            for (let i = 0; i < allocs.length; i++) {
                const alloc = await Token.lastAllocations(i);
                expect(alloc.toString()).be.equal(allocs[i]);
            }
        };
    });

    context('Check config of Idle Token', () => {
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

    context('Check price & apr of Idle Token', () => {
        it('Get tokenPrice when IdleToken supply is 0', async () => {
            const price = (await Token.tokenPrice.call()).toString();
            expect(price).to.equal('1000000');
        });
        // it('Get current apr', async () => {
        // });
    });

    context('Mint & Redeem Idle Token', () => {
        it('Mint 1000 Idle Token', async () => {
            // Mint Idle Token
            const amount = '1000';
            await this.mintIdleToken(amount, minter);

            // Check Idle Token balance
            const balance = await Token.balanceOf.call(minter, { from: minter });
            expect(balance.toString()).to.equal(amount + '000000000000000000');
        });
        it('Get tokenPrice after mint token', async () => {
            const cUSDC20 = await ERC20.at(constants.ADDRESSES.MAINNET.cUSDC);

            // Get cTokenExangeRate
            const exchangeRate = await this.cUSDCWrapper.getPriceInToken();

            // Get cTokenBalance of Idle Token
            const cTokenBalance = await cUSDC20.balanceOf.call(Token.address);

            // Get totalSupply of Idle Token
            const totalSupply = await Token.totalSupply();

            // estTokenPrice = (cTokenBalance * cTokenPrice) / totalSupply
            const estTokenPrice = cTokenBalance.mul(exchangeRate).div(totalSupply);
            // estTokenPrice will be 999999
            
            // Get TokenPrice of Idle Token
            const tokenPrice = (await Token.tokenPrice.call());
            expect(tokenPrice.toString()).to.equal(estTokenPrice.toString());
        });
        it('Redeem 1000 Idle Token', async () => {
            const amount = '1000' + '000000000000000000'; // Idle USDC decimals is 18

            // Mine 5 blocks
            const latestBlock = await time.latestBlock();
            await time.advanceBlockTo(latestBlock.toNumber() + 5);

            // Redeem Idle Token
            await Token.redeemIdleToken(amount, false, [], { from: minter });

            // Check Idle Token balance
            const balance = await Token.balanceOf.call(minter, { from: minter });
            expect(balance.toString()).to.equal('0');

            // Check USDC balance
            const USDC = await ERC20.at(constants.ADDRESSES.MAINNET.USDC);
            const usdcBalance = await USDC.balanceOf.call(minter, { from: minter });
            // usdcBalance will be near 10001000179
            expect(usdcBalance.toNumber()).to.above(1000 * 1000000);
        });
    });

    context('Set Allocation', () => {
        // There is no value for initial last allocation
        // it('Check last allocation', async () => {
        //     // this.testAllocations(['100000', '0', '0', '0']);
        // });
        it('Set allocation to 50% Compound, 50% Fulcrum and mint 1000 Idle Token', async () => {
            const alloc = ['50000', '50000', '0', '0'];

            // Set allocation
            await this.setRebAllocations(alloc);

            // Get allocation from rebalancer
            const lastAlloc = await idleRebalancer.getAllocations.call();
            expect(lastAlloc.toString()).to.equal(alloc.toString());

            // Rebalance
            await Token.rebalance();

            // Check allocation
            await this.testAllocations(alloc);
            
            // Mint idle token
            const amount = '1000';
            await this.mintIdleToken(amount, minter);

            // Check idle token balance
            const balance = await Token.balanceOf.call(minter, { from: minter });
            expect(balance.toString()).to.equal(amount + '000000000000000000');

            // Get cToken and iToken balance
            const cUSDC20 = await ERC20.at(constants.ADDRESSES.MAINNET.cUSDC);
            const iUSDC20 = await ERC20.at(constants.ADDRESSES.MAINNET.iUSDC);
            const cTokenBalance = await cUSDC20.balanceOf.call(Token.address);
            const iTokenBalance = await iUSDC20.balanceOf.call(Token.address);

            // Get cToken and iToken price
            const cTokenExchangeRate = await this.cUSDCWrapper.getPriceInToken();
            const iTokenExchangeRate = await this.iUSDCWrapper.getPriceInToken();

            // Get totalSupply of Idle Token
            const totalSupply = await Token.totalSupply();

            // Get TokenPrice of Idle Token
            const tokenPrice = (await Token.tokenPrice.call());

            // Check token price
            // ((cTokenBalance * cTokenExchangeRate) + (aTokenBalance * aTokenExchnageRate)) / totalSupply = tokenPrice
            const estTokenPrice = cTokenBalance.mul(cTokenExchangeRate).add(iTokenBalance.mul(iTokenExchangeRate)).div(totalSupply);
            expect(tokenPrice.toString()).to.equal(estTokenPrice.toString());
        });
        it('Redeem 1000 Idle Token after rebalance', async () => {
            const amount = '1000' + '000000000000000000'; // Idle USDC decimals is 18

            // Mine 5 blocks
            const latestBlock = await time.latestBlock();
            await time.advanceBlockTo(latestBlock.toNumber() + 5);

            // Redeem Idle Token
            await Token.redeemIdleToken(amount, false, [], { from: minter });

            // Check Idle Token balance
            const balance = await Token.balanceOf.call(minter, { from: minter });
            expect(balance.toString()).to.equal('0');

            // Check USDC balance
            const USDC = await ERC20.at(constants.ADDRESSES.MAINNET.USDC);
            const usdcBalance = await USDC.balanceOf.call(minter, { from: minter });
            expect(usdcBalance.toNumber()).to.above(1000 * 1000000);
        });
    });

    context('Add Wrapper', () => {});
});
