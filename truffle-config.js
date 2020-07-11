const { projectId, mnemonic } = require('./secrets.json');
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    'test': {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
      skipDryRun: true,
    },
    'fork': {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
      skipDryRun: true,
    },
    ropsten: {
      provider: () => new HDWalletProvider(mnemonic, `https://ropsten.infura.io/v3/${projectId}`),
      network_id: 3,         // Ropsten's id
      gas: 5500000,          // Gas limit used for deploys. Default is 6721975. Ropsten has a lower block limit than mainnet
      gasPrice: 5000000000,  // Gas price used for deploys. Default is 100000000000
    },
    kovan: {
      provider: () => new HDWalletProvider(mnemonic, `https://kovan.infura.io/v3/${projectId}`),
      network_id: 4,
      gasPrice: 5000000000,
    },
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    timeout: 500000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.5.16",
      settings: {
        optimizer: {
          enabled: true,
          runs: 45000 // 1 for tests, 45000 for deploy
        }
      }
    }
  },

  // Set contract folders, these 2 need to be set at same time!
  // contracts_directory: "./test/contracts",
  // contracts_build_directory: "./build/contracts",

}
