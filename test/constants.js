module.exports = {
    VERSION: 1,
    USDC_MAINNET_ADDRESS: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    MUSDC_MAINNET_ADDRESS: "0x3564ad35b9e95340e5ace2d6251dbfc76098669b",
    DMM_CONTROLLER_ADDRESS: "0x4CB120Dd1D33C9A3De8Bc15620C7Cd43418d77E2",
    DMM_CONTROLLER_ABI: [
        {"constant":true,"inputs":[{"internalType":"address","name":"underlyingToken","type":"address"}],"name":"getInterestRateByUnderlyingTokenAddress","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},
    ],
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
