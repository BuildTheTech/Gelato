//SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

/**
 * Standard SafeMath, stripped down to just add/sub/mul/div
 */
library SafeMath {
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");

        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return sub(a, b, "SafeMath: subtraction overflow");
    }

    function sub(
        uint256 a,
        uint256 b,
        string memory errorMessage
    ) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        uint256 c = a - b;

        return c;
    }

    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");

        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return div(a, b, "SafeMath: division by zero");
    }

    function div(
        uint256 a,
        uint256 b,
        string memory errorMessage
    ) internal pure returns (uint256) {
        // Solidity only automatically asserts when dividing by 0
        require(b > 0, errorMessage);
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }
}

/**
 * ERC20 standard interface.
 */
interface IERC20 {
    function totalSupply() external view returns (uint256);

    function decimals() external view returns (uint8);

    function symbol() external view returns (string memory);

    function name() external view returns (string memory);

    function getOwner() external view returns (address);

    function balanceOf(address account) external view returns (uint256);

    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);

    function allowance(
        address _owner,
        address spender
    ) external view returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

interface ISOLIDX {
    function burn(uint256 amount) external;
}

interface ISTACKED {
    function burn(uint256 amount) external;
}

interface IDEXFactory {
    function createPair(
        address tokenA,
        address tokenB
    ) external returns (address pair);
}

interface IDEXRouter {
    function factory() external pure returns (address);

    function WETH() external pure returns (address);

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity);

    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    )
        external
        payable
        returns (uint amountToken, uint amountETH, uint liquidity);

    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external;

    function swapExactTokensForTokensSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external;

    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable;

    function swapExactTokensForETHSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external;
}

enum Permission {
    ChangeFees,
    Buyback,
    AdjustContractVariables,
    Authorize,
    Unauthorize,
    PauseUnpauseContract,
    BypassPause,
    LockPermissions,
    ExcludeInclude
}

/**
 * Allows for contract ownership along with multi-address authorization for different permissions
 */
abstract contract MultiAuth {
    struct PermissionLock {
        bool isLocked;
        uint64 expiryTime;
    }

    address public owner;
    mapping(address => mapping(uint256 => bool)) private authorizations; // uint256 is permission index

    uint256 constant NUM_PERMISSIONS = 9; // always has to be adjusted when Permission element is added or removed
    mapping(string => uint256) permissionNameToIndex;
    mapping(uint256 => string) permissionIndexToName;

    mapping(uint256 => PermissionLock) lockedPermissions;

    constructor(address owner_) {
        owner = owner_;
        for (uint256 i; i < NUM_PERMISSIONS; i++) {
            authorizations[owner_][i] = true;
        }

        permissionNameToIndex["ChangeFees"] = uint256(Permission.ChangeFees);
        permissionNameToIndex["Buyback"] = uint256(Permission.Buyback);
        permissionNameToIndex["AdjustContractVariables"] = uint256(
            Permission.AdjustContractVariables
        );
        permissionNameToIndex["Authorize"] = uint256(Permission.Authorize);
        permissionNameToIndex["Unauthorize"] = uint256(Permission.Unauthorize);
        permissionNameToIndex["PauseUnpauseContract"] = uint256(
            Permission.PauseUnpauseContract
        );
        permissionNameToIndex["BypassPause"] = uint256(Permission.BypassPause);
        permissionNameToIndex["LockPermissions"] = uint256(
            Permission.LockPermissions
        );
        permissionNameToIndex["ExcludeInclude"] = uint256(
            Permission.ExcludeInclude
        );

        permissionIndexToName[uint256(Permission.ChangeFees)] = "ChangeFees";
        permissionIndexToName[uint256(Permission.Buyback)] = "Buyback";
        permissionIndexToName[
            uint256(Permission.AdjustContractVariables)
        ] = "AdjustContractVariables";
        permissionIndexToName[uint256(Permission.Authorize)] = "Authorize";
        permissionIndexToName[uint256(Permission.Unauthorize)] = "Unauthorize";
        permissionIndexToName[
            uint256(Permission.PauseUnpauseContract)
        ] = "PauseUnpauseContract";
        permissionIndexToName[uint256(Permission.BypassPause)] = "BypassPause";
        permissionIndexToName[
            uint256(Permission.LockPermissions)
        ] = "LockPermissions";
        permissionIndexToName[
            uint256(Permission.ExcludeInclude)
        ] = "ExcludeInclude";
    }

    /**
     * Function modifier to require caller to be contract owner
     */
    modifier onlyOwner() {
        require(isOwner(msg.sender), "Ownership required.");
        _;
    }

    /**
     * Function modifier to require caller to be authorized
     */
    modifier authorizedFor(Permission permission) {
        require(
            !lockedPermissions[uint256(permission)].isLocked,
            "Permission is locked."
        );
        require(
            isAuthorizedFor(msg.sender, permission),
            string(
                abi.encodePacked(
                    "Not authorized. You need the permission ",
                    permissionIndexToName[uint256(permission)]
                )
            )
        );
        _;
    }

    /**
     * Authorize address for one permission
     */
    function authorizeFor(
        address adr,
        string memory permissionName
    ) public authorizedFor(Permission.Authorize) {
        uint256 permIndex = permissionNameToIndex[permissionName];
        authorizations[adr][permIndex] = true;
        emit AuthorizedFor(adr, permissionName, permIndex);
    }

    /**
     * Authorize address for multiple permissions
     */
    function authorizeForMultiplePermissions(
        address adr,
        string[] calldata permissionNames
    ) public authorizedFor(Permission.Authorize) {
        for (uint256 i; i < permissionNames.length; i++) {
            uint256 permIndex = permissionNameToIndex[permissionNames[i]];
            authorizations[adr][permIndex] = true;
            emit AuthorizedFor(adr, permissionNames[i], permIndex);
        }
    }

    /**
     * Remove address' authorization
     */
    function unauthorizeFor(
        address adr,
        string memory permissionName
    ) public authorizedFor(Permission.Unauthorize) {
        require(adr != owner, "Can't unauthorize owner");

        uint256 permIndex = permissionNameToIndex[permissionName];
        authorizations[adr][permIndex] = false;
        emit UnauthorizedFor(adr, permissionName, permIndex);
    }

    /**
     * Unauthorize address for multiple permissions
     */
    function unauthorizeForMultiplePermissions(
        address adr,
        string[] calldata permissionNames
    ) public authorizedFor(Permission.Unauthorize) {
        require(adr != owner, "Can't unauthorize owner");

        for (uint256 i; i < permissionNames.length; i++) {
            uint256 permIndex = permissionNameToIndex[permissionNames[i]];
            authorizations[adr][permIndex] = false;
            emit UnauthorizedFor(adr, permissionNames[i], permIndex);
        }
    }

    /**
     * Check if address is owner
     */
    function isOwner(address account) public view returns (bool) {
        return account == owner;
    }

    /**
     * Return address' authorization status
     */
    function isAuthorizedFor(
        address adr,
        string memory permissionName
    ) public view returns (bool) {
        return authorizations[adr][permissionNameToIndex[permissionName]];
    }

    /**
     * Return address' authorization status
     */
    function isAuthorizedFor(
        address adr,
        Permission permission
    ) public view returns (bool) {
        return authorizations[adr][uint256(permission)];
    }

    /**
     * Transfer ownership to new address. Caller must be owner.
     */
    function transferOwnership(address payable adr) public onlyOwner {
        address oldOwner = owner;
        owner = adr;
        for (uint256 i; i < NUM_PERMISSIONS; i++) {
            authorizations[oldOwner][i] = false;
            authorizations[owner][i] = true;
        }
        emit OwnershipTransferred(oldOwner, owner);
    }

    /**
     * Get the index of the permission by its name
     */
    function getPermissionNameToIndex(
        string memory permissionName
    ) public view returns (uint256) {
        return permissionNameToIndex[permissionName];
    }

    /**
     * Get the time the timelock expires
     */
    function getPermissionUnlockTime(
        string memory permissionName
    ) public view returns (uint256) {
        return
            lockedPermissions[permissionNameToIndex[permissionName]].expiryTime;
    }

    /**
     * Check if the permission is locked
     */
    function isLocked(string memory permissionName) public view returns (bool) {
        return
            lockedPermissions[permissionNameToIndex[permissionName]].isLocked;
    }

    /*
     *Locks the permission from being used for the amount of time provided
     */
    function lockPermission(
        string memory permissionName,
        uint64 time
    ) public virtual authorizedFor(Permission.LockPermissions) {
        uint256 permIndex = permissionNameToIndex[permissionName];
        uint64 expiryTime = uint64(block.timestamp) + time;
        lockedPermissions[permIndex] = PermissionLock(true, expiryTime);
        emit PermissionLocked(permissionName, permIndex, expiryTime);
    }

    /*
     * Unlocks the permission if the lock has expired
     */
    function unlockPermission(string memory permissionName) public virtual {
        require(
            block.timestamp > getPermissionUnlockTime(permissionName),
            "Permission is locked until the expiry time."
        );
        uint256 permIndex = permissionNameToIndex[permissionName];
        lockedPermissions[permIndex].isLocked = false;
        emit PermissionUnlocked(permissionName, permIndex);
    }

    event PermissionLocked(
        string permissionName,
        uint256 permissionIndex,
        uint64 expiryTime
    );
    event PermissionUnlocked(string permissionName, uint256 permissionIndex);
    event OwnershipTransferred(address from, address to);
    event AuthorizedFor(
        address adr,
        string permissionName,
        uint256 permissionIndex
    );
    event UnauthorizedFor(
        address adr,
        string permissionName,
        uint256 permissionIndex
    );
}

interface IDividendDistributor {
    function setDistributionCriteria(
        uint256 _minSolidXPeriod,
        uint256 _minSolidXDistribution,
        uint256 _minHexPeriod,
        uint256 _minHexDistribution
    ) external;

    function setShare(address shareholder, uint256 amount) external;

    function depositForSolidXBurn(uint256 amount) external;

    function depositForStackedBurn(uint256 amount) external;

    function depositForSolidXReflection(uint256 amount) external;

    function depositForHexReflection(uint256 amount) external;

    function processSolidX(uint256 gas) external;

    function processHex(uint256 gas) external;

    function claimDividend() external;
}

contract DividendDistributor is IDividendDistributor {
    using SafeMath for uint256;

    address _token;

    struct Share {
        uint256 amount;
        uint256 solidXTotalExcluded;
        uint256 solidXTotalRealised;
        uint256 hexTotalExcluded;
        uint256 hexTotalRealised;
    }

    IERC20 SOLIDX = IERC20(0x8Da17Db850315A34532108f0f5458fc0401525f6);
    IERC20 HEX = IERC20(0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39);
    IERC20 STACKED = IERC20(0x67d8954C2B7386c8Dbf6936Cc2355bA2227F0a8f);
    IERC20 WPLS = IERC20(0xA1077a294dDE1B09bB078844df40758a5D0f9a27);
    address ZERO = 0x0000000000000000000000000000000000000000;
    IDEXRouter public pulseRouter;
    IDEXRouter public nineinchRouter;

    address[] shareholders;
    mapping(address => uint256) shareholderSolidXIndexes;
    mapping(address => uint256) shareholderSolidXClaims;
    mapping(address => uint256) shareholderHexIndexes;
    mapping(address => uint256) shareholderHexClaims;

    mapping(address => Share) public shares;
    uint256 public totalShares;

    // SolidX Dividend Trackers
    uint256 currentSolidXIndex;
    uint256 public totalSolidXDividends;
    uint256 public totalSolidXDistributed;
    uint256 public solidXDividendsPerShare;
    uint256 public solidXDividendsPerShareAccuracyFactor = 10 ** 36;
    uint256 public minSolidXPeriod = 1 hours; // min 1 hour delay
    uint256 public minSolidXDistribution = (1 * (10 ** 18)) / 10; // 0.1 SOLIDX minimum auto send

    // HEX Dividend Trackers
    uint256 currentHexIndex;
    uint256 public totalHexDividends;
    uint256 public totalHexDistributed;
    uint256 public hexDividendsPerShare;
    uint256 public hexDividendsPerShareAccuracyFactor = 10 ** 36;
    uint256 public minHexPeriod = 1 hours; // min 1 hour delay
    uint256 public minHexDistribution = 50 * (10 ** 8); // 50 HEX minimum auto send

    bool initialized;
    modifier initialization() {
        require(!initialized);
        _;
        initialized = true;
    }

    modifier onlyToken() {
        require(msg.sender == _token);
        _;
    }

    constructor(address _pulseRouter, address _nineinchRouter) {
        pulseRouter = _pulseRouter != address(0)
            ? IDEXRouter(_pulseRouter)
            : IDEXRouter(0x98bf93ebf5c380C0e6Ae8e192A7e2AE08edAcc02);
        nineinchRouter = _nineinchRouter != address(0)
            ? IDEXRouter(_nineinchRouter)
            : IDEXRouter(0xeB45a3c4aedd0F47F345fB4c8A1802BB5740d725);
        _token = msg.sender;
        WPLS.approve(address(pulseRouter), type(uint256).max);
        WPLS.approve(address(nineinchRouter), type(uint256).max);
    }

    function setDistributionCriteria(
        uint256 _minSolidXPeriod,
        uint256 _minSolidXDistribution,
        uint256 _minHexPeriod,
        uint256 _minHexDistribution
    ) external override onlyToken {
        minSolidXPeriod = _minSolidXPeriod;
        minSolidXDistribution = _minSolidXDistribution;
        minHexPeriod = _minHexPeriod;
        minHexDistribution = _minHexDistribution;
    }

    function setShare(
        address shareholder,
        uint256 amount
    ) external override onlyToken {
        if (shares[shareholder].amount > 0) {
            distributeSolidXDividend(shareholder);
            distributeHexDividend(shareholder);
        }

        if (amount > 0 && shares[shareholder].amount == 0) {
            addShareholder(shareholder);
        } else if (amount == 0 && shares[shareholder].amount > 0) {
            removeShareholder(shareholder);
        }

        totalShares = totalShares.sub(shares[shareholder].amount).add(amount);
        shares[shareholder].amount = amount;
        
        shares[shareholder].solidXTotalExcluded = getCumulativeSolidXDividends(
            shares[shareholder].amount
        );

        shares[shareholder].hexTotalExcluded = getCumulativeHexDividends(
            shares[shareholder].amount
        );
    }

    function depositForSolidXBurn(uint256 _amount) external override onlyToken {
        WPLS.transferFrom(msg.sender, address(this), _amount);

        uint256 solidXBefore = SOLIDX.balanceOf(address(this));
        
        address[] memory path = new address[](2);
        path[0] = address(WPLS);
        path[1] = address(SOLIDX);
            
        nineinchRouter.swapExactTokensForTokens(
            _amount,
            0,
            path,
            address(this),
            block.timestamp
        );

        uint256 solidXGained = SOLIDX.balanceOf(address(this)).sub(solidXBefore);

        ISOLIDX(address(SOLIDX)).burn(solidXGained); 
    }

    function depositForStackedBurn(uint256 _amount) external override onlyToken {
        WPLS.transferFrom(msg.sender, address(this), _amount);
        uint256 stackedBalanceBefore = STACKED.balanceOf(address(this));

        address[] memory path = new address[](2);
        path[0] = address(WPLS);
        path[1] = address(STACKED);

        nineinchRouter.swapExactTokensForTokens(
            _amount,
            0,
            path,
            address(this),
            block.timestamp
        );

        uint256 stackedAmount = STACKED.balanceOf(address(this)).sub(
            stackedBalanceBefore
        );

        ISTACKED(address(STACKED)).burn(stackedAmount);
    }

    function depositForSolidXReflection(uint256 _amount) external override onlyToken {
        WPLS.transferFrom(msg.sender, address(this), _amount);

        uint256 solidXBalanceBefore = SOLIDX.balanceOf(address(this));

        address[] memory path = new address[](2);
        path[0] = address(WPLS);
        path[1] = address(SOLIDX);

        nineinchRouter.swapExactTokensForTokens(
            _amount,
            0,
            path,
            address(this),
            block.timestamp
        );

        uint256 solidXGained = SOLIDX.balanceOf(address(this)).sub(solidXBalanceBefore);

        totalSolidXDividends = totalSolidXDividends.add(solidXGained);
        solidXDividendsPerShare = solidXDividendsPerShare.add(
        solidXDividendsPerShareAccuracyFactor.mul(solidXGained).div(totalShares)
        );
    }

    function depositForHexReflection(uint256 _amount) external override onlyToken {
        WPLS.transferFrom(msg.sender, address(this), _amount);
        uint256 hexBalanceBefore = HEX.balanceOf(address(this));

        address[] memory path = new address[](2);
        path[0] = address(WPLS);
        path[1] = address(HEX);

        pulseRouter.swapExactTokensForTokens(
            _amount,
            0,
            path,
            address(this),
            block.timestamp
        );

        uint256 hexGained = HEX.balanceOf(address(this)).sub(hexBalanceBefore);

        totalHexDividends = totalHexDividends.add(hexGained);
        hexDividendsPerShare = hexDividendsPerShare.add(
        hexDividendsPerShareAccuracyFactor.mul(hexGained).div(totalShares)
        );
    }

    function distributeSolidXDividend(address shareholder) internal {
        if (shares[shareholder].amount == 0) {
            return;
        }

        uint256 amount = getUnpaidSolidXEarnings(shareholder);
        if (amount > 0) {
            totalSolidXDistributed = totalSolidXDistributed.add(amount);
            SOLIDX.transfer(shareholder, amount);
            shareholderSolidXClaims[shareholder] = block.timestamp;
            shares[shareholder].solidXTotalRealised = shares[shareholder]
                .solidXTotalRealised
                .add(amount);
            shares[shareholder]
                .solidXTotalExcluded = getCumulativeSolidXDividends(
                shares[shareholder].amount
            );
        }
    }

    function distributeHexDividend(address shareholder) internal {
        if (shares[shareholder].amount == 0) {
            return;
        }

        uint256 amount = getUnpaidHexEarnings(shareholder);
        if (amount > 0) {
            totalHexDistributed = totalHexDistributed.add(amount);
            HEX.transfer(shareholder, amount);
            shareholderHexClaims[shareholder] = block.timestamp;
            shares[shareholder].hexTotalRealised = shares[shareholder]
                .hexTotalRealised
                .add(amount);
            shares[shareholder].hexTotalExcluded = getCumulativeHexDividends(
                shares[shareholder].amount
            );
        }
    }

    function processSolidX(uint256 gas) external override onlyToken {
        uint256 shareholderCount = shareholders.length;

        if (shareholderCount == 0) {
            return;
        }

        uint256 gasUsed = 0;
        uint256 gasLeft = gasleft();

        uint256 iterations = 0;

        while (gasUsed < gas && iterations < shareholderCount) {
            if (currentSolidXIndex >= shareholderCount) {
                currentSolidXIndex = 0;
            }

            if (shouldSolidXDistribute(shareholders[currentSolidXIndex])) {
                distributeSolidXDividend(shareholders[currentSolidXIndex]);
            }

            gasUsed = gasUsed.add(gasLeft.sub(gasleft()));
            gasLeft = gasleft();
            currentSolidXIndex++;
            iterations++;
        }
    }

    function processHex(uint256 gas) external override onlyToken {
        uint256 shareholderCount = shareholders.length;

        if (shareholderCount == 0) {
            return;
        }

        uint256 gasUsed = 0;
        uint256 gasLeft = gasleft();

        uint256 iterations = 0;

        while (gasUsed < gas && iterations < shareholderCount) {
            if (currentHexIndex >= shareholderCount) {
                currentHexIndex = 0;
            }

            if (shouldHexDistribute(shareholders[currentHexIndex])) {
                distributeHexDividend(shareholders[currentHexIndex]);
            }

            gasUsed = gasUsed.add(gasLeft.sub(gasleft()));
            gasLeft = gasleft();
            currentHexIndex++;
            iterations++;
        }
    }

    function shouldSolidXDistribute(
        address shareholder
    ) internal view returns (bool) {
        return
            shareholderSolidXClaims[shareholder] + minSolidXPeriod <
            block.timestamp &&
            getUnpaidSolidXEarnings(shareholder) > minSolidXDistribution;
    }

    function shouldHexDistribute(
        address shareholder
    ) internal view returns (bool) {
        return
            shareholderHexClaims[shareholder] + minHexPeriod <
            block.timestamp &&
            getUnpaidHexEarnings(shareholder) > minHexDistribution;
    }

    function claimDividend() external override {
        distributeSolidXDividend(msg.sender);
        distributeHexDividend(msg.sender);
    }

    function getUnpaidSolidXEarnings(
        address shareholder
    ) public view returns (uint256) {
        if (shares[shareholder].amount == 0) {
            return 0;
        }

        uint256 shareholderTotalDividends = getCumulativeSolidXDividends(
            shares[shareholder].amount
        );
        uint256 shareholderTotalExcluded = shares[shareholder]
            .solidXTotalExcluded;

        if (shareholderTotalDividends <= shareholderTotalExcluded) {
            return 0;
        }

        return shareholderTotalDividends.sub(shareholderTotalExcluded);
    }

    function getUnpaidHexEarnings(
        address shareholder
    ) public view returns (uint256) {
        if (shares[shareholder].amount == 0) {
            return 0;
        }

        uint256 shareholderTotalDividends = getCumulativeHexDividends(
            shares[shareholder].amount
        );
        uint256 shareholderTotalExcluded = shares[shareholder].hexTotalExcluded;

        if (shareholderTotalDividends <= shareholderTotalExcluded) {
            return 0;
        }

        return shareholderTotalDividends.sub(shareholderTotalExcluded);
    }

    function getCumulativeSolidXDividends(
        uint256 share
    ) internal view returns (uint256) {
        return
            share.mul(solidXDividendsPerShare).div(
                solidXDividendsPerShareAccuracyFactor
            );
    }

    function getCumulativeHexDividends(
        uint256 share
    ) internal view returns (uint256) {
        return
            share.mul(hexDividendsPerShare).div(
                hexDividendsPerShareAccuracyFactor
            );
    }

    function addShareholder(address shareholder) internal {
        shareholderSolidXIndexes[shareholder] = shareholders.length;
        shareholderHexIndexes[shareholder] = shareholders.length;

        shareholders.push(shareholder);
    }

    function removeShareholder(address shareholder) internal {
        shareholders[shareholderSolidXIndexes[shareholder]] = shareholders[
            shareholders.length - 1
        ];
        shareholderSolidXIndexes[
            shareholders[shareholders.length - 1]
        ] = shareholderSolidXIndexes[shareholder];

        shareholders[shareholderHexIndexes[shareholder]] = shareholders[
            shareholders.length - 1
        ];
        shareholderHexIndexes[
            shareholders[shareholders.length - 1]
        ] = shareholderHexIndexes[shareholder];

        shareholders.pop();
    }
}

contract Gelato is IERC20, MultiAuth {
    using SafeMath for uint256;

    address WPLS = 0xA1077a294dDE1B09bB078844df40758a5D0f9a27;
    address SOLIDX = 0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56;
    address HEX = 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c;
    address STACKED = 0x67d8954C2B7386c8Dbf6936Cc2355bA2227F0a8f;
    address DEAD = 0x000000000000000000000000000000000000dEaD;
    address ZERO = 0x0000000000000000000000000000000000000000;

    string constant _name = "Gelato";
    string constant _symbol = "GEL";
    uint8 constant _decimals = 18;

    uint256 _totalSupply = 8888888888000000000000000000; // 8,888,888,888
    uint256 public _maxTxAmount = _totalSupply / 100; // 1%

    mapping(address => uint256) _balances;
    mapping(address => mapping(address => uint256)) _allowances;

    mapping(address => bool) isFeeExempt;
    mapping(address => bool) isTxLimitExempt;
    mapping(address => bool) isDividendExempt;

    uint256 solidXBurnFee = 500;
    uint256 stackedBurnFee = 100;
    uint256 gelatoBurnFee = 100;
    uint256 solidXReflectionFee = 100;
    uint256 hexReflectionFee = 100;
    uint256 liquidityFee = 100;
    uint256 totalBuyFee = 400;
    uint256 totalSellFee = 400;
    uint256 feeDenominator = 10000;
    bool public feesOnNormalTransfers = true;

    address public autoLiquidityReceiver;

    IDEXRouter public pulseRouter;
    
    address pulseV2Pair;
    address[] public pairs;

    uint256 public launchedAt;

    DividendDistributor public distributor;
    uint256 distributorSolidXGas = 500000;
    uint256 distributorHexGas = 500000;

    bool public swapEnabled = true;
    uint256 public swapThreshold = _totalSupply / 5000; // 0.02%
    bool inSwap;
    modifier swapping() {
        inSwap = true;
        _;
        inSwap = false;
    }

    mapping(address => bool) private airdropped;

    constructor(address _nineinchRouter) MultiAuth(msg.sender) {
        pulseRouter = IDEXRouter(0x98bf93ebf5c380C0e6Ae8e192A7e2AE08edAcc02);
        pulseV2Pair = IDEXFactory(pulseRouter.factory()).createPair(
            WPLS,
            address(this)
        );
        _allowances[address(this)][address(pulseRouter)] = ~uint256(0);

        pairs.push(pulseV2Pair);
        distributor = new DividendDistributor(address(pulseRouter), _nineinchRouter);

        IERC20(WPLS).approve(address(distributor), type(uint256).max);

        address owner_ = msg.sender;

        isFeeExempt[owner_] = true;
        isTxLimitExempt[owner_] = true;
        isDividendExempt[pulseV2Pair] = true;
        isDividendExempt[address(this)] = true;
        isFeeExempt[address(this)] = true;
        isTxLimitExempt[address(this)] = true;
        isDividendExempt[DEAD] = true;

        autoLiquidityReceiver = owner_;

        _balances[owner_] = _totalSupply;
        emit Transfer(address(0), owner_, _totalSupply);
    }

    receive() external payable {}

    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }

    function decimals() external pure override returns (uint8) {
        return _decimals;
    }

    function symbol() external pure override returns (string memory) {
        return _symbol;
    }

    function name() external pure override returns (string memory) {
        return _name;
    }

    function getOwner() external view override returns (address) {
        return owner;
    }

    function balanceOf(address account) public view override returns (uint256) {
        return _balances[account];
    }

    function allowance(
        address holder,
        address spender
    ) external view override returns (uint256) {
        return _allowances[holder][spender];
    }

    function approve(
        address spender,
        uint256 amount
    ) public override returns (bool) {
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transfer(
        address recipient,
        uint256 amount
    ) external override returns (bool) {
        return _transferFrom(msg.sender, recipient, amount);
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external override returns (bool) {
        if (_allowances[sender][msg.sender] != ~uint256(0)) {
            _allowances[sender][msg.sender] = _allowances[sender][msg.sender]
                .sub(amount, "Insufficient Allowance");
        }

        return _transferFrom(sender, recipient, amount);
    }

    function _transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) internal returns (bool) {
        if (inSwap) {
            return _basicTransfer(sender, recipient, amount);
        }

        checkTxLimit(sender, amount);

        if (shouldSwapBack()) {
            swapBack();
        }

        if (!launched() && recipient == pulseV2Pair) {
            require(_balances[sender] > 0);
            launch();
        }

        _balances[sender] = _balances[sender].sub(
            amount,
            "Insufficient Balance"
        );

        uint256 amountReceived = shouldTakeFee(sender, recipient)
            ? takeFee(sender, recipient, amount)
            : amount;
        _balances[recipient] = _balances[recipient].add(amountReceived);

        if (!isDividendExempt[sender]) {
            try 
                distributor.setShare(sender, _balances[sender]) 
            {} catch {}
        }
        if (!isDividendExempt[recipient]) {
            try
                distributor.setShare(recipient, _balances[recipient])
            {} catch {}
        }

        try 
            distributor.processSolidX(distributorSolidXGas) 
        {} catch {}
        
        try 
            distributor.processHex(distributorHexGas) 
        {} catch {}

        emit Transfer(sender, recipient, amountReceived);
        return true;
    }

    function _basicTransfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal returns (bool) {
        _balances[sender] = _balances[sender].sub(
            amount,
            "Insufficient Balance"
        );
        _balances[recipient] = _balances[recipient].add(amount);
        emit Transfer(sender, recipient, amount);
        return true;
    }

    function checkTxLimit(address sender, uint256 amount) internal view {
        require(
            amount <= _maxTxAmount || isTxLimitExempt[sender],
            "TX Limit Exceeded"
        );
    }

    function shouldTakeFee(
        address sender,
        address recipient
    ) internal view returns (bool) {
        if (isFeeExempt[sender] || isFeeExempt[recipient] || !launched())
            return false;

        address[] memory liqPairs = pairs;

        for (uint256 i = 0; i < liqPairs.length; i++) {
            if (sender == liqPairs[i] || recipient == liqPairs[i]) return true;
        }

        return feesOnNormalTransfers;
    }

    function getTotalFee(bool selling) public view returns (uint256) {
        if (launchedAt + 1 >= block.number) {
            return feeDenominator.sub(1);
        }
        return selling ? totalSellFee : totalBuyFee;
    }

    function takeFee(
        address sender,
        address recipient,
        uint256 amount
    ) internal returns (uint256) {
        uint256 feeAmount = amount.mul(getTotalFee(isSell(recipient))).div(
            feeDenominator
        );

        _balances[address(this)] = _balances[address(this)].add(feeAmount);
        emit Transfer(sender, address(this), feeAmount);

        return amount.sub(feeAmount);
    }

    function isSell(address recipient) internal view returns (bool) {
        address[] memory liqPairs = pairs;
        for (uint256 i = 0; i < liqPairs.length; i++) {
            if (recipient == liqPairs[i]) return true;
        }
        return false;
    }

    function shouldSwapBack() internal view returns (bool) {
        return
            msg.sender != pulseV2Pair &&
            !inSwap &&
            swapEnabled &&
            _balances[address(this)] >= swapThreshold;
    }

    function swapBack() internal swapping {
        uint256 denominator = 1000;
        uint256 amountToLiquify = swapThreshold
            .mul(liquidityFee)
            .div(denominator)
            .div(2);
        uint256 amountToBurn = swapThreshold
            .mul(gelatoBurnFee)
            .div(denominator);
        uint256 amountToSwap = swapThreshold.sub(amountToLiquify).sub(amountToBurn);

        address[] memory path = new address[](2);
        path[0] = address(this);
        path[1] = WPLS;

        uint256 balanceBefore = IERC20(WPLS).balanceOf(address(this));

        try
            pulseRouter.swapExactTokensForTokensSupportingFeeOnTransferTokens(
                amountToSwap,
                0,
                path,
                address(this),
                block.timestamp
            )
        {
            uint256 amountSolidX = IERC20(WPLS).balanceOf(address(this)).sub(
                balanceBefore
            );

            uint256 totalWPLSFee = denominator.sub(liquidityFee.div(2));

            uint256 amountSolidXBurn = amountSolidX
                .mul(solidXBurnFee)
                .div(totalWPLSFee);

            uint256 amountStackedBurn = amountSolidX
                .mul(stackedBurnFee)
                .div(totalWPLSFee);

            uint256 amountGelatoBurn = amountSolidX
                .mul(gelatoBurnFee)
                .div(totalWPLSFee);

            uint256 amountSolidXReflection = amountSolidX
                .mul(solidXReflectionFee)
                .div(totalWPLSFee);

            uint256 amountHexReflection = amountSolidX
                .mul(hexReflectionFee)
                .div(totalWPLSFee);
                
            uint256 amountLiquidity = amountSolidX
                .mul(liquidityFee)
                .div(totalWPLSFee)
                .div(2);

            if (amountSolidXBurn > 0) {
                try
                    distributor.depositForSolidXBurn(amountSolidXBurn)
                {} catch {}
            }
            if (amountStackedBurn > 0) {
                try
                    distributor.depositForStackedBurn(amountStackedBurn)
                {} catch {}
            }
            if (amountGelatoBurn > 0) {
                try 
                    IERC20(address(this)).transfer(ZERO, amountGelatoBurn)
                {} catch {}
            }
            if (amountSolidXReflection > 0) {
                try
                    distributor.depositForSolidXReflection(amountSolidXReflection)
                {} catch {}
            }
            if (amountHexReflection > 0) {
                try 
                    distributor.depositForHexReflection(amountHexReflection)
                {} catch {}
            }
            if (amountToLiquify > 0) {
                    addLiquidity(amountToLiquify, amountLiquidity);
            }

            emit SwapBackSuccess(amountToSwap);
        } catch Error(string memory e) {
            emit SwapBackFailed(
                string(abi.encodePacked("SwapBack failed with error ", e))
            );
        } catch {
            emit SwapBackFailed(
                "SwapBack failed without an error message from PulseX"
            );
        }
    }

    function launched() internal view returns (bool) {
        return launchedAt != 0;
    }

    function launch() internal {
        launchedAt = block.number;
        emit Launched(block.number, block.timestamp);
    }

    function addLiquidity(uint256 amountGel, uint256 amountWPLS) internal {
        try
            pulseRouter.addLiquidity(
                address(this),
                WPLS,
                amountGel,
                amountWPLS,
                0,
                0,
                autoLiquidityReceiver,
                block.timestamp
            )
        {
            emit AutoLiquify(amountGel, amountWPLS);
        } catch {
            emit AutoLiquify(0, 0);
        }
    }

    function setTxLimit(
        uint256 amount
    ) external authorizedFor(Permission.AdjustContractVariables) {
        require(amount >= _totalSupply / 2000);
        _maxTxAmount = amount;
    }

    function setIsDividendExempt(
        address holder,
        bool exempt
    ) external authorizedFor(Permission.ExcludeInclude) {
        require(holder != address(this) && holder != pulseV2Pair);
        isDividendExempt[holder] = exempt;
        if (exempt) {
            distributor.setShare(holder, 0);
        } else {
            distributor.setShare(holder, _balances[holder]);
        }
    }

    function setIsFeeExempt(
        address holder,
        bool exempt
    ) external authorizedFor(Permission.ExcludeInclude) {
        isFeeExempt[holder] = exempt;
    }

    function setIsTxLimitExempt(
        address holder,
        bool exempt
    ) external authorizedFor(Permission.ExcludeInclude) {
        isTxLimitExempt[holder] = exempt;
    }

    function setFees(
        uint256 _solidXBurnFee,
        uint256 _stackedBurnFee,
        uint256 _gelatoBurnFee,
        uint256 _solidXReflectionFee,
        uint256 _hexReflectionFee,
        uint256 _liquidityFee,
        uint256 _totalBuyFee,
        uint256 _totalSellFee,
        bool _feesOnNormalTransfers
    ) external authorizedFor(Permission.AdjustContractVariables) {
        solidXBurnFee = _solidXBurnFee;
        stackedBurnFee = _stackedBurnFee;
        gelatoBurnFee = _gelatoBurnFee;
        solidXReflectionFee = _solidXReflectionFee;
        hexReflectionFee = _hexReflectionFee;
        liquidityFee = _liquidityFee;
        totalBuyFee = _totalBuyFee;
        totalSellFee = _totalSellFee;
        require(solidXBurnFee
            .add(stackedBurnFee)
            .add(gelatoBurnFee)
            .add(solidXReflectionFee)
            .add(hexReflectionFee)
            .add(liquidityFee) <= 1000, "The total of all combined fees must be 1000 for 100 percent.");
        require(totalBuyFee <= feeDenominator / 10, "Buy fee too high");
        require(totalSellFee <= feeDenominator / 10, "Sell fee too high");

        feesOnNormalTransfers = _feesOnNormalTransfers;
    }

    function setLiquidityFeeReceiver(
        address _autoLiquidityReceiver
    ) external authorizedFor(Permission.AdjustContractVariables) {
        autoLiquidityReceiver = _autoLiquidityReceiver;
    }

    function setSwapBackSettings(
        bool _enabled,
        uint256 _amount
    ) external authorizedFor(Permission.AdjustContractVariables) {
        swapEnabled = _enabled;
        swapThreshold = _amount;
    }

    function setDistributionCriteria(
        uint256 _minSolidXPeriod,
        uint256 _minSolidXDistribution,
        uint256 _minHexPeriod,
        uint256 _minHexDistribution
    ) external authorizedFor(Permission.AdjustContractVariables) {
        distributor.setDistributionCriteria(
            _minSolidXPeriod,
            _minSolidXDistribution,
            _minHexPeriod,
            _minHexDistribution
        );
    }

    function setDistributorSettings(
        uint256 solidXGas,
        uint256 hexGas
    ) external authorizedFor(Permission.AdjustContractVariables) {
        distributorSolidXGas = solidXGas;
        distributorHexGas = hexGas;
        require(
            distributorSolidXGas <= 1000000 &&
                distributorHexGas <= 1000000,
            "Max gas is 1000000"
        );
    }

    function getCirculatingSupply() public view returns (uint256) {
        return _totalSupply.sub(balanceOf(DEAD)).sub(balanceOf(ZERO));
    }

    function claimDividend() external {
        distributor.claimDividend();
    }

    function addPair(
        address pair
    ) external authorizedFor(Permission.AdjustContractVariables) {
        pairs.push(pair);
    }

    function removeLastPair()
        external
        authorizedFor(Permission.AdjustContractVariables)
    {
        pairs.pop();
    }

    event AutoLiquify(uint256 amountWPLS, uint256 amountGEL);
    event Launched(uint256 blockNumber, uint256 timestamp);
    event SwapBackSuccess(uint256 amount);
    event SwapBackFailed(string message);
}
