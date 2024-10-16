const { ethers, network } = require("hardhat");
const { expect } = require("chai");

async function forkPulseChainMainnet() {
  console.log("Forking PulseChain Mainnet...");

  await network.provider.request({
    method: "hardhat_reset",
    params: [
      {
        forking: {
          jsonRpcUrl: "https://rpc.pulsechain.com",
          blockNumber: 21611116,
        },
      },
    ],
  });
}

async function deployGelato(richSigner) {
  console.log("Deploying Gelato contract from Rich Account...");

  const Gelato = await ethers.getContractFactory("Gelato", richSigner);
  const gelato = await Gelato.deploy();

  const distributorAddress = await gelato.distributor();
  const gelatoAddress = gelato.target;

  console.log(`Gelato deployed at: ${gelatoAddress}`);
  console.log(`DividendDistributor deployed at: ${distributorAddress}`);

  return { gelato, distributorAddress };
}

async function buySolidXWithPLS(richSigner, plsAmount) {
  console.log("Buying SolidX from nineinchRouter...");

  const nineinchRouterAddress = "0xeB45a3c4aedd0F47F345fB4c8A1802BB5740d725";
  const solidxAddress = "0x8Da17Db850315A34532108f0f5458fc0401525f6";
  const wplsAddress = "0xA1077a294dDE1B09bB078844df40758a5D0f9a27";

  const nineinchRouter = await ethers.getContractAt("IUniswapV2Router02", nineinchRouterAddress, richSigner);

  const path = [wplsAddress, solidxAddress];

  const solidx = await ethers.getContractAt("IERC20", solidxAddress, richSigner);
  const solidxBalanceBefore = await solidx.balanceOf(richSigner.address);

  await nineinchRouter.swapExactETHForTokens(
    0,
    path,
    richSigner.address,
    Math.floor(Date.now() / 1000) + 60 * 10,
    { value: plsAmount }
  );

  const solidxBalanceAfter = await solidx.balanceOf(richSigner.address);

  const solidxPurchased = solidxBalanceAfter - solidxBalanceBefore;

  console.log(`Successfully bought ${ethers.formatUnits(solidxPurchased)} SolidX using ${ethers.formatUnits(plsAmount)} PLS.`);
  return solidxPurchased;
}

async function addLiquidityToRouter(gelato, solidxAmount, richSigner) {
  console.log("Adding liquidity to the PulseRouter from Rich Account...");

  const pulseRouterAddress = "0x98bf93ebf5c380C0e6Ae8e192A7e2AE08edAcc02";
  const solidxAddress = "0x8Da17Db850315A34532108f0f5458fc0401525f6";

  const pulseRouter = await ethers.getContractAt("IUniswapV2Router02", pulseRouterAddress, richSigner);
  const solidx = await ethers.getContractAt("IERC20", solidxAddress, richSigner);
  const gelatoToken = await ethers.getContractAt("Gelato", gelato, richSigner);

  const liquidityTokenAmount = ethers.parseUnits("6666666666", 18);

  await gelatoToken.approve(pulseRouterAddress, liquidityTokenAmount);
  await solidx.approve(pulseRouterAddress, solidxAmount);

  const tx = await pulseRouter.addLiquidity(
    solidxAddress,
    gelato,
    solidxAmount,
    liquidityTokenAmount,
    0,
    0,
    richSigner.address,
    Math.floor(Date.now() / 1000) + 60 * 10
  );

  await gelatoToken.setLaunched();

  console.log(`Liquidity added successfully: ${ethers.formatUnits(liquidityTokenAmount)} Gelato and ${ethers.formatUnits(solidxAmount)} SolidX.`);
}

async function fundWallets(wallets, plsAmount, gelatoAmount, richSigner, gelato) {
  console.log("Funding wallets...");

  for (const wallet of wallets) {
    const hexBalance = ethers.toBeHex(plsAmount);
    console.log(`Funding wallet ${wallet.address} with PLS...`);
    await network.provider.send("hardhat_setBalance", [wallet.address, hexBalance]);

    console.log(`Transferring ${ethers.formatUnits(gelatoAmount)} Gelato to wallet ${wallet.address}...`);
    await gelato.connect(richSigner).transfer(wallet.address, gelatoAmount);
  }
}

async function sellTokens(wallet, gelato, pulseRouter, sellAmount, distributorAddress) {
  console.log(`Wallet ${wallet.address} selling ${ethers.formatUnits(sellAmount)} Gelato for SolidX...`);

  if (!gelato || !gelato.target) {
    console.error("Invalid Gelato contract instance or address:", gelato);
    throw new Error("Gelato contract instance is not valid.");
  }

  const solidxAddress = "0x8Da17Db850315A34532108f0f5458fc0401525f6";
  const gelatoToken = await ethers.getContractAt("Gelato", gelato, wallet);
  const solidx = await ethers.getContractAt("IERC20", solidxAddress, wallet);

  await gelatoToken.approve(pulseRouter.target, sellAmount);
  console.log(`Approved PulseRouter to spend ${ethers.formatUnits(sellAmount)} Gelato for Wallet ${wallet.address}`);

  const path = [gelato.target, solidxAddress];
  console.log(`Using swap path: ${path}`);

  const router = pulseRouter.connect(wallet);

  await router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
    sellAmount,
    0,
    path,
    wallet.address,
    Math.floor(Date.now() / 1000) + 60 * 10
  );

  // Get updated Gelato and SolidX balances after the sell transaction
  const updatedGelatoBalance = await gelato.balanceOf(wallet.address);
  const updatedSolidXBalance = await solidx.balanceOf(wallet.address);

  console.log(`Wallet ${wallet.address} has ${ethers.formatUnits(updatedGelatoBalance)} Gelato and ${ethers.formatUnits(updatedSolidXBalance)} SolidX after selling.`);
  return { updatedGelatoBalance, updatedSolidXBalance };
}

async function buyTokens(wallet, gelato, pulseRouter, buyAmount) {
  console.log(`Wallet ${wallet.address} buying Gelato using ${ethers.formatUnits(buyAmount)} SolidX...`);

  if (!gelato || !gelato.target) {
    console.error("Invalid Gelato contract instance or address:", gelato);
    throw new Error("Gelato contract instance is not valid.");
  }

  const solidxAddress = "0x8Da17Db850315A34532108f0f5458fc0401525f6";
  const solidx = await ethers.getContractAt("IERC20", solidxAddress, wallet);

  await solidx.approve(pulseRouter.target, buyAmount);
  console.log(`Approved PulseRouter to spend ${ethers.formatUnits(buyAmount)} SolidX for Wallet ${wallet.address}`);

  const path = [solidxAddress, gelato.target];
  console.log(`Using swap path: ${path}`);

  const router = pulseRouter.connect(wallet);

  await router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
    buyAmount,
    0,
    path,
    wallet.address,
    Math.floor(Date.now() / 1000) + 60 * 10
  );

  const updatedGelatoBalance = await gelato.balanceOf(wallet.address);
  const updatedSolidXBalance = await solidx.balanceOf(wallet.address);

  console.log(`Wallet ${wallet.address} has ${ethers.formatUnits(updatedGelatoBalance)} Gelato and ${ethers.formatUnits(updatedSolidXBalance)} SolidX after buying.`);

  return { updatedGelatoBalance, updatedSolidXBalance };
}

describe("PulseChain Fork Test with Gelato and Reflection Fees", function () {
  this.timeout(100000000);

  let wallets, gelato, distributor, distributorAddress, pulseRouter, hex, solidx, stacked;
  const plsAmount = ethers.parseUnits("100000000", 18);
  const gelatoAmount = ethers.parseUnits("2000000", 18);
  const richAccount = "0xbE740c0c8b3C13b2B1Af763aC17a83797A948fe4";
  const swapThreshold = ethers.parseUnits("1777777.7776", 18);

  before(async function () {
    await forkPulseChainMainnet();

    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [richAccount],
    });

    const richSigner = await ethers.provider.getSigner(richAccount);

    // Deploy Gelato and capture distributorAddress
    const contracts = await deployGelato(richSigner);
    gelato = contracts.gelato;
    distributorAddress = contracts.distributorAddress;

    // Create an instance of the distributor contract
    distributor = await ethers.getContractAt("DividendDistributor", distributorAddress, richSigner);

    const solidxAmount = await buySolidXWithPLS(richSigner, ethers.parseUnits("100000000", 18));
    pulseRouter = await ethers.getContractAt("IUniswapV2Router02", "0x98bf93ebf5c380C0e6Ae8e192A7e2AE08edAcc02", richSigner);
    await addLiquidityToRouter(gelato, solidxAmount, richSigner);

    // Initialize wallets for testing
    wallets = Array.from({ length: 1 }, () => ethers.Wallet.createRandom().connect(ethers.provider));
    await fundWallets(wallets, plsAmount, gelatoAmount, richSigner, gelato);

    // Initialize token contracts for checking balances later
    hex = await ethers.getContractAt("IERC20", "0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39", richSigner);
    solidx = await ethers.getContractAt("IERC20", "0x8Da17Db850315A34532108f0f5458fc0401525f6", richSigner);
    stacked = await ethers.getContractAt("IERC20", "0x67d8954C2B7386c8Dbf6936Cc2355bA2227F0a8f", richSigner);

    await network.provider.request({
      method: "hardhat_stopImpersonatingAccount",
      params: [richAccount],
    });
  });

  it("Should cycle through sell and buy transactions until swapThreshold is reached", async function () {
    let feeBalance = await gelato.balanceOf(gelato.target);

    while (feeBalance < swapThreshold) {
      // Perform a sell cycle for all wallets
      for (const wallet of wallets) {
        const gelatoBalance = await gelato.balanceOf(wallet.address);
        if (gelatoBalance > 0) {
          console.log(`Wallet ${wallet.address} is selling ${ethers.formatUnits(gelatoBalance, 18)} Gelato.`);
          await sellTokens(wallet, gelato, pulseRouter, gelatoBalance, distributorAddress);
        }
      }

      feeBalance = await gelato.balanceOf(gelato.target);
      console.log(`Current Fee Balance: ${ethers.formatUnits(feeBalance, 18)} Gelato`);

      // Break if the swapThreshold is reached or exceeded
      if (feeBalance >= swapThreshold) {
        console.log(`Swap Threshold of ${ethers.formatUnits(swapThreshold, 18)} Gelato reached.`);
        break;
      }

      // Perform a buy cycle for all wallets to distribute tokens back
      for (const wallet of wallets) {
        const solidxBalance = await solidx.balanceOf(wallet.address);
        if (solidxBalance > 0) {
          console.log(`Wallet ${wallet.address} is buying Gelato using ${ethers.formatUnits(solidxBalance)} SolidX.`);
          await buyTokens(wallet, gelato, pulseRouter, solidxBalance);
        }
      }
    }

    // Final buy cycle to ensure wallets have Gelato tokens again
    for (const wallet of wallets) {
      const solidxBalance = await solidx.balanceOf(wallet.address);
      if (solidxBalance > 0) {
        console.log(`Wallet ${wallet.address} is buying Gelato using ${ethers.formatUnits(solidxBalance)} SolidX.`);
        await buyTokens(wallet, gelato, pulseRouter, solidxBalance);
      }
    }

    // Check Distributor Balances
    const hexBalance = await hex.balanceOf(distributorAddress);
    const solidxBalance = await solidx.balanceOf(distributorAddress);
    const stackedBalance = await stacked.balanceOf(distributorAddress);

    console.log(`HEX Balance in Distributor: ${ethers.formatUnits(hexBalance)} HEX`);
    console.log(`SolidX Balance in Distributor: ${ethers.formatUnits(solidxBalance)} SolidX`);
    console.log(`Stacked Balance in Distributor: ${ethers.formatUnits(stackedBalance)} Stacked`);

    // Check unpaid earnings for each wallet
    for (const wallet of wallets) {
      const hexEarnings = await distributor.getUnpaidHexEarnings(wallet.address);
      const solidxEarnings = await distributor.getUnpaidSolidXEarnings(wallet.address);
      const stackedEarnings = await distributor.getUnpaidStackedEarnings(wallet.address);

      console.log(`Wallet ${wallet.address} unpaid HEX earnings: ${ethers.formatUnits(hexEarnings)} HEX`);
      console.log(`Wallet ${wallet.address} unpaid SolidX earnings: ${ethers.formatUnits(solidxEarnings)} SolidX`);
      console.log(`Wallet ${wallet.address} unpaid Stacked earnings: ${ethers.formatUnits(stackedEarnings)} Stacked`);
    }
  });
});
