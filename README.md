# Cappuu Token

Cappuu Token is a wrapped token of Stablecoin that can earn interest from different lending protocols.

## Test using OZ

```
yarn test
```

### Run certain test
```
yarn test -g 'Test Name'
```

## Test using Truffle

### Need to start a local chain first
```
yarn start-fork-chain

```

### Run test

```
yarn test-truffle

or

yarn truffle test
```

### Run certain test file
```
yarn truffle test ./test/IdleTokenV3-truffle.js
```
