const Migrations = artifacts.require("Migrations");
const IdleCompoundV2 = artifacts.require("IdleCompoundV2");
const IdleFulcrumV2 = artifacts.require("IdleFulcrumV2");
const IdleAave = artifacts.require("IdleAave");
const IdleDyDx = artifacts.require("IdleDyDx");
const IdleRebalancerV3 = artifacts.require("IdleRebalancerV3");
const IdlePriceCalculator = artifacts.require("IdlePriceCalculator");
const IdleTokenV3 = artifacts.require("IdleTokenV3");

const USDC = {
  'live': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  'fork': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  'ropsten': '',
  'kovan': '',
  'test': '',
};

const cUSDC = {
  'live': '0x39AA39c021dfbaE8faC545936693aC917d5E7563',
  'fork': '0x39AA39c021dfbaE8faC545936693aC917d5E7563',
  'ropsten': '0x8af93cae804cc220d1a608d4fa54d1b6ca5eb361',
  'kovan': '',
  'test': '',
};

const iUSDC = {
  'live': '0xF013406A0B1d544238083DF0B93ad0d2cBE0f65f',
  'fork': '0xF013406A0B1d544238083DF0B93ad0d2cBE0f65f',
  'ropsten': '0xb08123d3de290ce90549c2275983633aa97fbbaf',
  'kovan': '',
  'test': '',
};

const aUSDC = {
  'live': '0x9bA00D6856a4eDF4665BcA2C2309936572473B7E',
  'fork': '0x9bA00D6856a4eDF4665BcA2C2309936572473B7E',
  'ropsten': '',
  'kovan': '',
  'test': '',
};

const yxUSDC = {
  'live': '0xd2F45883627f26EC34825486ca4c25235A0da0C3',
  'fork': '0xd2F45883627f26EC34825486ca4c25235A0da0C3',
  'ropsten': '',
  'kovan': '',
  'test': '',
};

module.exports = async function(deployer, network, accounts) {
  if (network === 'test') {
    return;
  }
  console.log('Network: ', network);

  const decimals = 18;
  const [creator, manager, feeAddress] = accounts;

  // Deploy wrappers
  let compoundUSDCInstance, fulcrumUSDCInstance, aaveUSDCInstance, dydxUSDCInstance;
  await deployer.deploy(IdleCompoundV2, cUSDC[network], USDC[network], {from: creator})
    .then(i => compoundUSDCInstance = i);
  await deployer.deploy(IdleFulcrumV2, iUSDC[network], USDC[network], {from: creator})
    .then(i => fulcrumUSDCInstance = i);
  await deployer.deploy(IdleAave, aUSDC[network], USDC[network], {from: creator})
    .then(i => aaveUSDCInstance = i);
  await deployer.deploy(IdleDyDx, yxUSDC[network], USDC[network], 3, {from: creator})
    .then(i => dydxUSDCInstance = i);

  // Deploy rebalancer
  let rebalancerUSDCInstance;
  await deployer.deploy(
    IdleRebalancerV3,
    cUSDC[network],
    iUSDC[network],
    aUSDC[network],
    yxUSDC[network],
    manager,
    {from: creator}
  ).then(i => rebalancerUSDCInstance = i);
  

  // Deploy priceCalculator
  let priceCalculatorInstance;
  await deployer.deploy(IdlePriceCalculator, {from: creator})
    .then(i => priceCalculatorInstance = i);

  // Deploy IdleToken
  let idleTokenInstance;
  await deployer.deploy(IdleTokenV3,
    'IdleUSDC V3',
    'IdelUSDC',
    decimals,
    USDC[network],
    cUSDC[network],
    iUSDC[network],
    rebalancerUSDCInstance.address,
    priceCalculatorInstance.address,
    compoundUSDCInstance.address,
    fulcrumUSDCInstance.address,
    {from: creator}
  ).then(i => idleTokenInstance = i);
  const IdleUSDCAddress = idleTokenInstance.address;
  console.log('Idle Token Address: ',IdleUSDCAddress);

  // Config contracts
  (await IdleRebalancerV3.at(rebalancerUSDCInstance.address)).setIdleToken(IdleUSDCAddress);
  (await IdleCompoundV2.at(compoundUSDCInstance.address)).setIdleToken(IdleUSDCAddress);
  (await IdleFulcrumV2.at(fulcrumUSDCInstance.address)).setIdleToken(IdleUSDCAddress);
  (await IdleAave.at(aaveUSDCInstance.address)).setIdleToken(IdleUSDCAddress);
  (await IdleDyDx.at(dydxUSDCInstance.address)).setIdleToken(IdleUSDCAddress);
};
