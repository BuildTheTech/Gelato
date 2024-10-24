//SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


interface IDEXRouter {
    function factory() external pure returns (address);

    function WETH() external pure returns (address);
    function WPLS() external pure returns (address);

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    )
        external
        returns (
            uint256 amountA,
            uint256 amountB,
            uint256 liquidity
        );

    function addLiquidityETH(
        address token,
        uint256 amountTokenDesired,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    )
        external
        payable
        returns (
            uint256 amountToken,
            uint256 amountETH,
            uint256 liquidity
        );

    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountA, uint256 amountB);

    function removeLiquidityETH(
        address token,
        uint256 liquidity,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountToken, uint256 amountETH);

    function removeLiquidityWithPermit(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline,
        bool approveMax,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (uint256 amountA, uint256 amountB);

    function removeLiquidityETHWithPermit(
        address token,
        uint256 liquidity,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline,
        bool approveMax,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (uint256 amountToken, uint256 amountETH);

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    function swapTokensForExactTokens(
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    function swapExactETHForTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable returns (uint256[] memory amounts);

    function swapTokensForExactETH(
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    function swapExactTokensForETH(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    function swapETHForExactTokens(
        uint256 amountOut,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable returns (uint256[] memory amounts);

    function quote(
        uint256 amountA,
        uint256 reserveA,
        uint256 reserveB
    ) external pure returns (uint256 amountB);

    function getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) external pure returns (uint256 amountOut);

    function getAmountIn(
        uint256 amountOut,
        uint256 reserveIn,
        uint256 reserveOut
    ) external pure returns (uint256 amountIn);

    function getAmountsOut(uint256 amountIn, address[] calldata path)
        external
        view
        returns (uint256[] memory amounts);

    function getAmountsIn(uint256 amountOut, address[] calldata path)
        external
        view
        returns (uint256[] memory amounts);

    function removeLiquidityETHSupportingFeeOnTransferTokens(
        address token,
        uint256 liquidity,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountETH);

    function removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(
        address token,
        uint256 liquidity,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline,
        bool approveMax,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (uint256 amountETH);

    function swapExactTokensForTokensSupportingFeeOnTransferTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external;

    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable;

    function swapExactTokensForETHSupportingFeeOnTransferTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external;
}

interface IDEXFactory {
    function getPair(address tokenA, address tokenB) external view returns (address pair);
}

interface IDEXPair {
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
    event Transfer(address indexed from, address indexed to, uint256 value);

    function name() external pure returns (string memory);

    function symbol() external pure returns (string memory);

    function decimals() external pure returns (uint8);

    function totalSupply() external view returns (uint256);

    function balanceOf(address owner) external view returns (uint256);

    function allowance(address owner, address spender)
        external
        view
        returns (uint256);

    function approve(address spender, uint256 value) external returns (bool);

    function transfer(address to, uint256 value) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external returns (bool);

    function DOMAIN_SEPARATOR() external view returns (bytes32);

    function PERMIT_TYPEHASH() external pure returns (bytes32);

    function nonces(address owner) external view returns (uint256);

    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    event Mint(address indexed sender, uint256 amount0, uint256 amount1);
    event Burn(
        address indexed sender,
        uint256 amount0,
        uint256 amount1,
        address indexed to
    );
    event Swap(
        address indexed sender,
        uint256 amount0In,
        uint256 amount1In,
        uint256 amount0Out,
        uint256 amount1Out,
        address indexed to
    );
    event Sync(uint112 reserve0, uint112 reserve1);

    function MINIMUM_LIQUIDITY() external pure returns (uint256);

    function factory() external view returns (address);

    function token0() external view returns (address);

    function token1() external view returns (address);

    function getReserves()
        external
        view
        returns (
            uint112 reserve0,
            uint112 reserve1,
            uint32 blockTimestampLast
        );

    function price0CumulativeLast() external view returns (uint256);

    function price1CumulativeLast() external view returns (uint256);

    function kLast() external view returns (uint256);

    function mint(address to) external returns (uint256 liquidity);

    function burn(address to)
        external
        returns (uint256 amount0, uint256 amount1);

    function swap(
        uint256 amount0Out,
        uint256 amount1Out,
        address to,
        bytes calldata data
    ) external;

    function skim(address to) external;

    function sync() external;

    function initialize(address, address) external;
}

contract GelatoLocker is Ownable {
    IDEXRouter private pulseRouterV1;
    IDEXRouter private pulseRouterV2;
    IDEXRouter private nineinchRouter;
    IERC20 private pulseV1LpToken;
    IERC20 private pulseV2LpToken;
    IERC20 private nineinchLpToken;

    IERC20 public gelatoToken;
    uint256 public lockTime;
    bool public lockEnded;

    event LockEnded();
    event ParameterUpdated();

    constructor(
        address _pulseRouterV1,
        address _pulseRouterV2,
        address _nineinchRouter,
        address _gelatoToken,
        uint256 _lockTime
    ) Ownable() {
        pulseRouterV1 = IDEXRouter(_pulseRouterV1);
        pulseRouterV2 = IDEXRouter(_pulseRouterV2);
        nineinchRouter = IDEXRouter(_nineinchRouter);
        gelatoToken = IERC20(_gelatoToken);

        require(_lockTime - block.timestamp <= 31536000, "Only 1 year can be initially set.");
        lockTime = _lockTime;
    }

    /*******************************************************************************************************/
    /************************************* Admin Functions *************************************************/
    /*******************************************************************************************************/
    function endLock() public onlyOwner {
        require(block.timestamp >= lockTime, "LP tokens are still locked.");


        address lpPair1;
        try IDEXFactory(pulseRouterV1.factory()).getPair(pulseRouterV1.WPLS(), address(gelatoToken)) returns (address _lpPair1) {
            lpPair1 = _lpPair1;
            IDEXPair lpToken1 = IDEXPair(lpPair1);
            lpToken1.transfer(owner(), lpToken1.balanceOf(address(this)));
        } catch {}

        address lpPair2;
        try IDEXFactory(pulseRouterV2.factory()).getPair(pulseRouterV2.WPLS(), address(gelatoToken)) returns (address _lpPair2) {
            lpPair2 = _lpPair2;
            IDEXPair lpToken2 = IDEXPair(lpPair2);
            lpToken2.transfer(owner(), lpToken2.balanceOf(address(this)));
        } catch {}

        address lpPair3;
        try IDEXFactory(nineinchRouter.factory()).getPair(nineinchRouter.WETH(), address(gelatoToken)) returns (address _lpPair3) {
            lpPair3 = _lpPair3;
            IDEXPair lpToken3 = IDEXPair(lpPair3);
            lpToken3.transfer(owner(), lpToken3.balanceOf(address(this)));
        } catch {}

        lockEnded = true;
        emit LockEnded();
    }

    function extendLockTime(uint256 _extraLockTime) public onlyOwner {
        require(_extraLockTime > 0 && _extraLockTime <= 31536000, "Lock time can only be extended up to one year per call.");

        lockTime += _extraLockTime;
        emit ParameterUpdated();
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }

    function withdrawTokens(address _token) public onlyOwner {
        require(_token != address(0), "Invalid parameter is provided.");

        IDEXPair lpToken1 = IDEXPair(IDEXFactory(pulseRouterV1.factory()).getPair(pulseRouterV1.WPLS(), address(gelatoToken)));
        IDEXPair lpToken2 = IDEXPair(IDEXFactory(pulseRouterV2.factory()).getPair(pulseRouterV2.WPLS(), address(gelatoToken)));
        IDEXPair lpToken3 = IDEXPair(IDEXFactory(nineinchRouter.factory()).getPair(nineinchRouter.WETH(), address(gelatoToken)));
        if (block.timestamp >= lockTime) {
            require(_token != address(lpToken1) || _token != address(lpToken2) || _token != address(lpToken3), "You can not withdraw LP token.");
        }

        IERC20 token = IERC20(_token);
        uint256 amount = token.balanceOf(address(this));
        token.transfer(address(msg.sender), amount);
    }

    function getLockTime() public view returns (uint256) {
        return lockTime;
    }

    receive() external payable {}
    fallback() external payable {}
}