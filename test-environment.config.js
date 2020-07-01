module.exports = {
    accounts: {
        amount: 10, // Number of unlocked accounts
        ether: 1000000, // Initial balance of unlocked accounts (in ether)
      },
    contracts: {
        type: 'truffle', // Contract abstraction to use: 'truffle' for @truffle/contract or 'web3' for web3-eth-contract
        // defaultGas: 6e6, // Maximum gas for contract calls (when unspecified)
        // defaultGasPrice: 20e9, // Gas price for contract calls (when unspecified)
        // artifactsDir: 'build/contracts', // Directory where contract artifacts are stored
    },
    node: { // Options passed directly to Ganache client
        fork: 'https://mainnet.infura.io/v3/4c96c6bab18845dba07ad14cc0c18998', // An url to Ethereum node to use as a source for a fork
        gasLimit: 50000000, // Maximum gas per block
        unlocked_accounts: ['0xF977814e90dA44bFA03b6295A0616a897441aceC'],
    },
};