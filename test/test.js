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
  const pulseRouterV1 = "0x98bf93ebf5c380C0e6Ae8e192A7e2AE08edAcc02";
  const pulseRouterV2 = "0x165C3410fC91EF562C50559f7d2289fEbed552d9";
  const nineinchRouter = "0xeB45a3c4aedd0F47F345fB4c8A1802BB5740d725"
  const gelato = await Gelato.deploy(pulseRouterV1, pulseRouterV2, nineinchRouter);

  const distributorAddress = await gelato.distributor();
  const gelatoAddress = gelato.target;

  console.log(`Gelato deployed at: ${gelatoAddress}`);
  console.log(`DividendDistributor deployed at: ${distributorAddress}`);

  return { gelato, distributorAddress };
}

async function addLiquidityToRouter(gelato, wplsAmount, richSigner) {
  console.log("Adding liquidity to the PulseRouter from Rich Account...");

  const pulseRouterAddress = "0x165C3410fC91EF562C50559f7d2289fEbed552d9";
  const wplsAddress = "0xA1077a294dDE1B09bB078844df40758a5D0f9a27";

  const pulseRouter = await ethers.getContractAt("IUniswapV2Router02", pulseRouterAddress, richSigner);
  const wpls = await ethers.getContractAt("IERC20", wplsAddress, richSigner);
  const gelatoToken = await ethers.getContractAt("Gelato", gelato, richSigner);

  const liquidityTokenAmount = ethers.parseUnits("6666666666", 18);

  await gelatoToken.approve(pulseRouterAddress, liquidityTokenAmount);

  const tx = await pulseRouter.addLiquidityETH(
    gelato,
    liquidityTokenAmount,
    0,
    0,
    richSigner.address,
    Math.floor(Date.now() / 1000) + 60 * 10,
    {
      value: wplsAmount
    }
);

  console.log(`Liquidity added successfully: ${ethers.formatUnits(liquidityTokenAmount)} Gelato and ${ethers.formatUnits(wplsAmount)} PLS.`);
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

async function buyTokens(wallet, gelato, pulseRouter, buyAmount, distributor, hex, solidx) {
  console.log(`Wallet ${wallet.address} buying ${ethers.formatUnits(buyAmount)} Gelato for PLS...`);

  const hexEarnings = await distributor.getUnpaidHexEarnings(wallet.address);
  const solidxEarnings = await distributor.getUnpaidSolidXEarnings(wallet.address);

  console.log(`Wallet ${wallet.address} unpaid HEX earnings: ${ethers.formatUnits(hexEarnings, 8)} HEX`);
  console.log(`Wallet ${wallet.address} unpaid SolidX earnings: ${ethers.formatUnits(solidxEarnings)} SolidX`);
  console.log(`Wallet ${wallet.address} buying Gelato using ${ethers.formatUnits(buyAmount)} PLS...`);

  const wplsAddress = "0xA1077a294dDE1B09bB078844df40758a5D0f9a27";

  const path = [wplsAddress, gelato.target];

  const router = pulseRouter.connect(wallet);

  const block = await ethers.provider.getBlock("latest");
  const currentBlockTimestamp = block.timestamp;

  await router.swapExactETHForTokensSupportingFeeOnTransferTokens(
    0,
    path,
    wallet.address,
    currentBlockTimestamp + 120,
    {
      value: buyAmount
    }
  );

  const updatedGelatoBalance = await gelato.balanceOf(wallet.address);
  const updatedPlsBalance = await ethers.provider.getBalance(wallet.address);

  console.log(`Wallet ${wallet.address} has ${ethers.formatUnits(updatedGelatoBalance)} Gelato and ${ethers.formatUnits(updatedPlsBalance)} PLS after buying.`);

  await network.provider.send("evm_increaseTime", [3600]);
  await network.provider.send("evm_mine");

  const hexBalance = await hex.balanceOf(distributor);
  const solidxBalance = await solidx.balanceOf(distributor);
  const plsBalance = await ethers.provider.getBalance(gelato);

  console.log(`HEX Balance in Distributor: ${ethers.formatUnits(hexBalance, 8)} HEX`);
  console.log(`SolidX Balance in Distributor: ${ethers.formatUnits(solidxBalance)} SolidX`);
  console.log(`PLS Balance in Gelato Contract: ${ethers.formatUnits(plsBalance)} PLS`);
  const feeBalance = await gelato.balanceOf(gelato.target);
  console.log(`Current Gelato Fee Balance: ${ethers.formatUnits(feeBalance, 18)} Gelato`);
  const totalSolidXBurned = await distributor.totalSolidXBurned();
  console.log(`Total SolidX Burned: ${ethers.formatUnits(totalSolidXBurned, 18)} SOLIDX`);
  const totalStackedBurned = await distributor.totalStackedBurned();
  console.log(`Total Stacked Burned: ${ethers.formatUnits(totalStackedBurned, 18)} Stacked Italian`);
  const totalGelBurned = await gelato.totalGelBurned();
  console.log(`Total Gelato Burned: ${ethers.formatUnits(totalGelBurned, 18)} Gelato`);
  const totalPlsLpAdded = await gelato.totalPlsLpAdded();
  console.log(`Total PLS Added to LP: ${ethers.formatUnits(totalPlsLpAdded, 18)} PLS`);
  const totalGelLpAdded = await gelato.totalGelLpAdded();
  console.log(`Total Gelato Added to LP: ${ethers.formatUnits(totalGelLpAdded, 18)} Gelato`);

  const share = await distributor.shares(wallet.address);
  
  console.log(`Wallet ${wallet.address} total HEX realised: ${ethers.formatUnits(share.hexTotalRealised, 8)} HEX`);
  console.log(`Wallet ${wallet.address} total SolidX realised: ${ethers.formatUnits(share.solidXTotalRealised)} SolidX`);

  return { updatedGelatoBalance, updatedPlsBalance };
}

async function sellTokens(wallet, gelato, pulseRouter, sellAmount, distributor, hex, solidx) {
  console.log(`Wallet ${wallet.address} selling ${ethers.formatUnits(sellAmount)} Gelato for PLS...`);

  const hexEarnings = await distributor.getUnpaidHexEarnings(wallet.address);
  const solidxEarnings = await distributor.getUnpaidSolidXEarnings(wallet.address);

  console.log(`Wallet ${wallet.address} unpaid HEX earnings: ${ethers.formatUnits(hexEarnings, 8)} HEX`);
  console.log(`Wallet ${wallet.address} unpaid SolidX earnings: ${ethers.formatUnits(solidxEarnings)} SolidX`);
  console.log(`Wallet ${wallet.address} buying Gelato using ${ethers.formatUnits(sellAmount)} PLS...`);

  const wplsAddress = "0xA1077a294dDE1B09bB078844df40758a5D0f9a27";
  const gelatoToken = await ethers.getContractAt("Gelato", gelato, wallet);

  await gelatoToken.approve(pulseRouter.target, sellAmount);

  const path = [gelato.target, wplsAddress];

  const router = pulseRouter.connect(wallet);

  const block = await ethers.provider.getBlock("latest");
  const currentBlockTimestamp = block.timestamp;

  await router.swapExactTokensForETHSupportingFeeOnTransferTokens(
    sellAmount,
    0,
    path,
    wallet.address,
    currentBlockTimestamp + 120
  );

  const updatedGelatoBalance = await gelato.balanceOf(wallet.address);
  const updatedPlsBalance = await ethers.provider.getBalance(wallet.address);

  console.log(`Wallet ${wallet.address} has ${ethers.formatUnits(updatedGelatoBalance)} Gelato and ${ethers.formatUnits(updatedPlsBalance)} PLS after selling.`);

  await network.provider.send("evm_increaseTime", [3600]);
  await network.provider.send("evm_mine");

  const hexBalance = await hex.balanceOf(distributor);
  const solidxBalance = await solidx.balanceOf(distributor);
  const plsBalance = await ethers.provider.getBalance(gelato);

  console.log(`HEX Balance in Distributor: ${ethers.formatUnits(hexBalance, 8)} HEX`);
  console.log(`SolidX Balance in Distributor: ${ethers.formatUnits(solidxBalance)} SolidX`);
  console.log(`PLS Balance in Gelato Contract: ${ethers.formatUnits(plsBalance)} PLS`);
  const feeBalance = await gelato.balanceOf(gelato.target);
  console.log(`Current Gelato Fee Balance: ${ethers.formatUnits(feeBalance, 18)} Gelato`);
  const totalSolidXBurned = await distributor.totalSolidXBurned();
  console.log(`Total SolidX Burned: ${ethers.formatUnits(totalSolidXBurned, 18)} SOLIDX`);
  const totalStackedBurned = await distributor.totalStackedBurned();
  console.log(`Total Stacked Burned: ${ethers.formatUnits(totalStackedBurned, 18)} Stacked Italian`);
  const totalGelBurned = await gelato.totalGelBurned();
  console.log(`Total Gelato Burned: ${ethers.formatUnits(totalGelBurned, 18)} Gelato`);
  const totalPlsLpAdded = await gelato.totalPlsLpAdded();
  console.log(`Total PLS Added to LP: ${ethers.formatUnits(totalPlsLpAdded, 18)} PLS`);
  const totalGelLpAdded = await gelato.totalGelLpAdded();
  console.log(`Total Gelato Added to LP: ${ethers.formatUnits(totalGelLpAdded, 18)} Gelato`);

  const share = await distributor.shares(wallet.address);
  
  console.log(`Wallet ${wallet.address} total HEX realised: ${ethers.formatUnits(share.hexTotalRealised, 8)} HEX`);
  console.log(`Wallet ${wallet.address} total SolidX realised: ${ethers.formatUnits(share.solidXTotalRealised)} SolidX`);

  return { updatedGelatoBalance, updatedPlsBalance };
}

describe("PulseChain Fork Test with Gelato and Reflection Fees", function () {
  this.timeout(100000000);

  let wallets, gelato, distributor, distributorAddress, pulseRouter, hex, wpls, stacked;
  const plsAmount = ethers.parseUnits("100000000", 18);
  const gelatoAmount = ethers.parseUnits("80000000", 18);
  const richAccount = "0xbE740c0c8b3C13b2B1Af763aC17a83797A948fe4";

  before(async function () {
    await forkPulseChainMainnet();

    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [richAccount],
    });

    const richSigner = await ethers.provider.getSigner(richAccount);

    const contracts = await deployGelato(richSigner);
    gelato = contracts.gelato;
    distributorAddress = contracts.distributorAddress;

    distributor = await ethers.getContractAt("DividendDistributor", distributorAddress, richSigner);

    const wplsAmount = ethers.parseUnits("10000000000", 18);
    pulseRouter = await ethers.getContractAt("IUniswapV2Router02", "0x165C3410fC91EF562C50559f7d2289fEbed552d9", richSigner);
    await addLiquidityToRouter(gelato, wplsAmount, richSigner);

    wallets = Array.from({ length: 25 }, () => ethers.Wallet.createRandom().connect(ethers.provider));
    await fundWallets(wallets, plsAmount, gelatoAmount, richSigner, gelato);

    hex = await ethers.getContractAt("IERC20", "0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39", richSigner);
    wpls = await ethers.getContractAt("IERC20", "0xA1077a294dDE1B09bB078844df40758a5D0f9a27", richSigner);
    stacked = await ethers.getContractAt("IERC20", "0x67d8954C2B7386c8Dbf6936Cc2355bA2227F0a8f", richSigner);
    solidx = await ethers.getContractAt("IERC20", "0x8Da17Db850315A34532108f0f5458fc0401525f6", richSigner);

    await network.provider.request({
      method: "hardhat_stopImpersonatingAccount",
      params: [richAccount],
    });
  });

  it("Should continuously cycle through sell and buy transactions in perpetuity", async function () {
  while (true) { // Infinite loop to cycle indefinitely
    console.log("Starting new buy/sell cycle...");

    // Perform a sell cycle for all wallets
    for (const wallet of wallets) {
      const gelatoBalance = await gelato.balanceOf(wallet.address);
      if (gelatoBalance > 0) {
        await sellTokens(wallet, gelato, pulseRouter, gelatoBalance, distributor, hex, solidx);
      }
    }

    // Perform a buy cycle for all wallets
    for (const wallet of wallets) {
      const plsBalance = await ethers.provider.getBalance(wallet.address);
      if (plsBalance > 0) {
        await buyTokens(wallet, gelato, pulseRouter, ethers.parseUnits("1000000", 18), distributor, hex, solidx);
      }
    }

    console.log("Buy/sell cycle completed. Starting next cycle...");
  }
});
});
