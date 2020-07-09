module.exports = {
    ADDRESSES: {
        MAINNET: {
            USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            MUSDC: "0x3564ad35b9e95340e5ace2d6251dbfc76098669b",
            cUSDC: "0x39AA39c021dfbaE8faC545936693aC917d5E7563",
            iUSDC: "0xF013406A0B1d544238083DF0B93ad0d2cBE0f65f",
            aUSDC: "0x9bA00D6856a4eDF4665BcA2C2309936572473B7E",
            yxUSDC: "0xd2F45883627f26EC34825486ca4c25235A0da0C3",
            USDC_VAULT: "0xF977814e90dA44bFA03b6295A0616a897441aceC", // Binance
            AAVE_LENDING_ADDRESSES_PROVIDER: "0x24a42fD28C976A61Df5D00D0599C34c4f90748c8",
        },
    },
    DMM_TOKENFACTORY_ABI: [
        {
            inputs: [],
            payable: false,
            stateMutability: "nonpayable",
            type: "constructor"
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "address",
                    name: "previousOwner",
                    type: "address"
                },
                {
                    indexed: true,
                    internalType: "address",
                    name: "newOwner",
                    type: "address"
                }
            ],
            name: "OwnershipTransferred",
            type: "event"
        },
        {
            constant: false,
            inputs: [
                { internalType: "string", name: "symbol", type: "string" },
                { internalType: "string", name: "name", type: "string" },
                { internalType: "uint8", name: "decimals", type: "uint8" },
                {
                    internalType: "uint256",
                    name: "minMintAmount",
                    type: "uint256"
                },
                {
                    internalType: "uint256",
                    name: "minRedeemAmount",
                    type: "uint256"
                },
                {
                    internalType: "uint256",
                    name: "totalSupply",
                    type: "uint256"
                },
                { internalType: "address", name: "controller", type: "address" }
            ],
            name: "deployToken",
            outputs: [
                {
                    internalType: "contract IDmmToken",
                    name: "",
                    type: "address"
                }
            ],
            payable: false,
            stateMutability: "nonpayable",
            type: "function"
        },
        {
            constant: true,
            inputs: [],
            name: "isOwner",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
            payable: false,
            stateMutability: "view",
            type: "function"
        },
        {
            constant: true,
            inputs: [],
            name: "owner",
            outputs: [{ internalType: "address", name: "", type: "address" }],
            payable: false,
            stateMutability: "view",
            type: "function"
        },
        {
            constant: false,
            inputs: [],
            name: "renounceOwnership",
            outputs: [],
            payable: false,
            stateMutability: "nonpayable",
            type: "function"
        },
        {
            constant: false,
            inputs: [
                { internalType: "address", name: "newOwner", type: "address" }
            ],
            name: "transferOwnership",
            outputs: [],
            payable: false,
            stateMutability: "nonpayable",
            type: "function"
        }
    ]
};
