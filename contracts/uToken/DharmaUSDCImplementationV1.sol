pragma solidity 0.5.11;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "./DharmaTokenV1.sol";
import "../../interfaces/CTokenInterface.sol";
import "../../interfaces/ERC20Interface.sol";
import "../../interfaces/CUSDCInterestRateModelInterface.sol";
import "../../interfaces/DMM/IDmmToken.sol";
import "../../interfaces/DMM/IDmmController.sol";

/**
 * @title DharmaUSDCImplementationV1
 * @author 0age (dToken mechanics derived from Compound cTokens, ERC20 methods
 * derived from Open Zeppelin's ERC20 contract)
 * @notice This contract provides the V1 implementation of Dharma USD Coin (or
 * dUSDC), an upgradeable, interest-bearing ERC20 token with cUSDC as the
 * backing token and USD Coin as the underlying token. The V1 dUSDC exchange
 * rate will grow at 90% the rate of the backing cUSDC exchange rate. Dharma
 * USD Coin also supports meta-transactions originating from externally-owned
 * accounts, as well as from contract accounts via ERC-1271.
 */
contract DharmaUSDCImplementationV1 is DharmaTokenV1 {
  string internal constant _NAME = "Cappuu USD Coin";
  string internal constant _SYMBOL = "uUSDC";
  string internal constant _UNDERLYING_NAME = "USD Coin";
  string internal constant _MTOKEN_SYMBOL = "mUSDC";

  IDmmToken internal constant _MUSDC = IDmmToken(
    0x3564ad35b9E95340E5Ace2D6251dbfC76098669B // mainnet
  );

  IDmmController internal constant _DMM_CONTROLLER = IDmmController(
    0x4CB120Dd1D33C9A3De8Bc15620C7Cd43418d77E2 // mainnet
  );

  ERC20Interface internal constant _USDC = ERC20Interface(
    0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 // mainnet
  );

  // TODO: change this
  address internal constant _VAULT = 0x7e4A8391C728fEd9069B2962699AB416628B19Fa;

  uint256 internal constant _SCALING_FACTOR_SQUARED = 1e36;

  // Set block number and dToken + cToken exchange rate in slot zero on accrual.

  /**
   * @notice constructor
  // TODO: Test only!!!
   */
  constructor() public {
    // Initial dToken exchange rate is 1-to-1 (dTokens have 8 decimals).
    uint256 dTokenExchangeRate = 1e16;

    // Accrue cToken interest and retrieve the current cToken exchange rate.
    uint256 mTokenExchangeRate = _MUSDC.getCurrentExchangeRate();

    // Initialize accrual index with current block number and exchange rates.
    AccrualIndex storage accrualIndex = _accrualIndex;
    accrualIndex.dTokenExchangeRate = uint112(dTokenExchangeRate);
    accrualIndex.mTokenExchangeRate = _safeUint112(mTokenExchangeRate);
    accrualIndex.block = uint32(block.number);
  }

  /**
   * @notice Internal view function to get the current cUSDC exchange rate and
   * supply rate per block.
   * @return The current cUSDC exchange rate, or amount of USDC that is
   * redeemable for each cUSDC, and the cUSDC supply rate per block (with 18
   * decimal places added to each returned rate).
   * Exchange rate: underlying / cToken
   * Supply rate: cToken's interest rate
   */
  // TODO: Change this
  function _getCurrentMTokenRates() internal view returns (
    uint256 exchangeRate, uint256 supplyRate
  ) {
    exchangeRate = _MUSDC.getCurrentExchangeRate();
    supplyRate = _DMM_CONTROLLER.getInterestRateByUnderlyingTokenAddress(address(_USDC));

    /*
    // Determine number of blocks that have elapsed since last cUSDC accrual.
    uint256 blockDelta = block.number.sub(_CUSDC.accrualBlockNumber());

    // Return stored values if accrual has already been performed this block.
    if (blockDelta == 0) return (
      _CUSDC.exchangeRateStored(), _CUSDC.supplyRatePerBlock()
    );

    // Determine total "cash" held by cUSDC contract.
    uint256 cash = _USDC.balanceOf(address(_CUSDC));

    // Get the latest interest rate model from the cUSDC contract.
    CUSDCInterestRateModelInterface interestRateModel = (
      CUSDCInterestRateModelInterface(_CUSDC.interestRateModel())
    );

    // Get the current stored total borrows, reserves, and reserve factor.
    uint256 borrows = _CUSDC.totalBorrows();
    uint256 reserves = _CUSDC.totalReserves();
    uint256 reserveFactor = _CUSDC.reserveFactorMantissa();

    // Get the current borrow rate from the latest cUSDC interest rate model.
    (uint256 err, uint256 borrowRate) = interestRateModel.getBorrowRate(
      cash, borrows, reserves
    );
    require(
      err == _COMPOUND_SUCCESS, "Interest Rate Model borrow rate check failed."
    );

    // Get accumulated borrow interest via borrows, borrow rate, & block delta.
    uint256 interest = borrowRate.mul(blockDelta).mul(borrows) / _SCALING_FACTOR;

    // Update total borrows and reserves using calculated accumulated interest.
    borrows = borrows.add(interest);
    reserves = reserves.add(reserveFactor.mul(interest) / _SCALING_FACTOR);

    // Get "underlying" via (cash + borrows - reserves).
    uint256 underlying = (cash.add(borrows)).sub(reserves);

    // Determine cUSDC exchange rate via underlying / total supply.
    exchangeRate = (underlying.mul(_SCALING_FACTOR)).div(_CUSDC.totalSupply());

    // Get "borrows per" by dividing total borrows by underlying and scaling up.
    uint256 borrowsPer = (borrows.mul(_SCALING_FACTOR)).div(underlying);

    // Supply rate is borrow rate * (1 - reserveFactor) * borrowsPer.
    supplyRate = (
      borrowRate.mul(_SCALING_FACTOR.sub(reserveFactor)).mul(borrowsPer)
    ) / _SCALING_FACTOR_SQUARED;
    */
  }

  /**
   * @notice Internal pure function to supply the name of the underlying token.
   * @return The name of the underlying token.
   */
  function _getUnderlyingName() internal pure returns (string memory underlyingName) {
    underlyingName = _UNDERLYING_NAME;
  }

  /**
   * @notice Internal pure function to supply the address of the underlying
   * token.
   * @return The address of the underlying token.
   */
  function _getUnderlying() internal pure returns (address underlying) {
    underlying = address(_USDC);
  }

  /**
   * @notice Internal pure function to supply the symbol of the backing cToken.
   * @return The symbol of the backing cToken.
   */
  function _getMTokenSymbol() internal pure returns (string memory mTokenSymbol) {
    mTokenSymbol = _MTOKEN_SYMBOL;
  }

  /**
   * @notice Internal pure function to supply the address of the backing cToken.
   * @return The address of the backing cToken.
   */
  function _getMToken() internal pure returns (address mToken) {
    mToken = address(_MUSDC);
  }

  /**
   * @notice Internal pure function to supply the name of the dToken.
   * @return The name of the dToken.
   */
  function _getDTokenName() internal pure returns (string memory dTokenName) {
    dTokenName = _NAME;
  }

  /**
   * @notice Internal pure function to supply the symbol of the dToken.
   * @return The symbol of the dToken.
   */
  function _getDTokenSymbol() internal pure returns (string memory dTokenSymbol) {
    dTokenSymbol = _SYMBOL;
  }

  /**
   * @notice Internal pure function to supply the address of the vault that
   * receives surplus cTokens whenever the surplus is pulled.
   * @return The address of the vault.
   */
  function _getVault() internal pure returns (address vault) {
    vault = _VAULT;
  }
}