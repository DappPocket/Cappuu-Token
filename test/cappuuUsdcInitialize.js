const { expect } = require("chai");
const { web3, accounts, contract } = require('@openzeppelin/test-environment');

const DharmaUpgradeBeaconController = contract.fromArtifact('DharmaUpgradeBeaconController');
const UpgradeBeacon = contract.fromArtifact('UpgradeBeacon');
const DharmaUSDC = contract.fromArtifact('DharmaUSDC');
const DharmaUSDCInitializer = contract.fromArtifact('DharmaUSDCInitializer');
const DharmaUSDCImplementationV1 = contract.fromArtifact('DharmaUSDCImplementationV1');

describe("Initialize Cappuu USDC", () => {
    let upgradeBeacon;
    let dharmaUSDC;

    before(async function () {
        // Deploy contracts
        const dharmaUpgradeBeaconController= await DharmaUpgradeBeaconController.new();
        upgradeBeacon = await UpgradeBeacon.new(dharmaUpgradeBeaconController.address);
        dharmaUSDC = await DharmaUSDC.new(upgradeBeacon.address);
        const dharmaUSDCInitializer = await DharmaUSDCInitializer.new();
        const dharmaUSDCImplementationV1 = await DharmaUSDCImplementationV1.new();

        // Upgrade dharmaUSDCInitializer to the implementation
        await dharmaUpgradeBeaconController.upgrade(upgradeBeacon.address, dharmaUSDCInitializer.address);
        dharmaUSDC = await DharmaUSDCInitializer.at(dharmaUSDC.address);

        // Initialize
        await dharmaUSDC.initialize();

        // Upgrade DharmaUSDCImplementationV1 to the implementation
        await dharmaUpgradeBeaconController.upgrade(upgradeBeacon.address, dharmaUSDCImplementationV1.address);
        dharmaUSDC = await DharmaUSDCImplementationV1.at(dharmaUSDC.address);
    })

    it("Get Cappuu USDC Metadata", async () => {
        // TODO: fix this
        const name = await dharmaUSDC.name();
        expect(name).to.be.equal("Cappuu USD Coin");
    });

    it("Get Cappuu USDC Exchange Rate", async () => {
        // TODO: update this
    });

    it("Mint First Cappuu USDC", async () => {
        // TODO: update this
    });
});
