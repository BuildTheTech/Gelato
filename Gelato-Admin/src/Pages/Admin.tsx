import { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import CustomNav from "../Components/JackpotNav";
import { gelatoToken, gelatoDistributor } from "../Utilities/constants";
import TokenABI from "../abi/TokenABI.json";
import DistributorABI from "../abi/DistributorABI.json";
import { shortenDecimal } from "../Utilities/helper";
import {
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "wagmi/actions";
import { wagmiConfig } from "../main";
import { myToast } from "../Components/Toast";

const Admin = () => {
  const [solidXBurnFee, setSolidXBurnFee] = useState("");
  const [stackedBurnFee, setStackedBurnFee] = useState("");
  const [gelatoBurnFee, setGelatoBurnFee] = useState("");
  const [solidXReflectionFee, setSolidXReflectionFee] = useState("");
  const [hexReflectionFee, setHexReflectionFee] = useState("");
  const [liquidityFee, setLiquidityFee] = useState("");
  const [totalBuyFee, setTotalBuyFee] = useState("");
  const [totalSellFee, setTotalSellFee] = useState("");

  const [gelatoBurned, setGelatoBurned] = useState("");
  const [solidXBurned, setSolidXBurned] = useState("");
  const [stackedBurned, setStackedBurned] = useState("");
  const [plsLpAdded, setPlsLpAdded] = useState("");
  const [gelLpAdded, setGelLpAdded] = useState("");
  const [solidXDistributed, setSolidXDistributed] = useState("");
  const [hexDistributed, setHexDistributed] = useState("");
  const [txLimit, setTxLimit] = useState("");
  const [swapThreshold, setSwapThreshold] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const account = useAccount();

  // staking contract
  const solidXBurnFeeResult = useReadContract({
    abi: TokenABI,
    address: gelatoToken,
    functionName: "solidXBurnFee",
  });
  const stackedBurnFeeResult = useReadContract({
    abi: TokenABI,
    address: gelatoToken,
    functionName: "stackedBurnFee",
  });
  const gelatoBurnFeeResult = useReadContract({
    abi: TokenABI,
    address: gelatoToken,
    functionName: "gelatoBurnFee",
  });
  const solidXReflectionFeeResult = useReadContract({
    abi: TokenABI,
    address: gelatoToken,
    functionName: "solidXReflectionFee",
  });
  const hexReflectionFeeResult = useReadContract({
    abi: TokenABI,
    address: gelatoToken,
    functionName: "hexReflectionFee",
  });
  const liquidityFeeResult = useReadContract({
    abi: TokenABI,
    address: gelatoToken,
    functionName: "liquidityFee",
  });
  const totalBuyFeeResult = useReadContract({
    abi: TokenABI,
    address: gelatoToken,
    functionName: "totalBuyFee",
  });
  const totalSellFeeResult = useReadContract({
    abi: TokenABI,
    address: gelatoToken,
    functionName: "totalSellFee",
  });
  const totalGelBurnedResult = useReadContract({
    abi: TokenABI,
    address: gelatoToken,
    functionName: "totalGelBurned",
  });
  const totalPlsLpAddedResult = useReadContract({
    abi: TokenABI,
    address: gelatoToken,
    functionName: "totalPlsLpAdded",
  });
  const totalGelLpAddedResult = useReadContract({
    abi: TokenABI,
    address: gelatoToken,
    functionName: "totalGelLpAdded",
  });
  const totalStackedBurnedResult = useReadContract({
    abi: DistributorABI,
    address: gelatoDistributor,
    functionName: "totalStackedBurned",
  });
  const totalSolidXBurnedResult = useReadContract({
    abi: DistributorABI,
    address: gelatoDistributor,
    functionName: "totalSolidXBurned",
  });
  const totalHexDistributedResult = useReadContract({
    abi: DistributorABI,
    address: gelatoDistributor,
    functionName: "totalHexDistributed",
  });
  const totalSolidXDistributedResult = useReadContract({
    abi: DistributorABI,
    address: gelatoDistributor,
    functionName: "totalSolidXDistributed",
  });
  const txLimitResult = useReadContract({
    abi: TokenABI,
    address: gelatoToken,
    functionName: "_maxTxAmount",
  });
  const swapThresholdResult = useReadContract({
    abi: TokenABI,
    address: gelatoToken,
    functionName: "swapThreshold",
  });

  // Initialize form with contract data only once after fetching
  useEffect(() => {
    if (solidXBurnFeeResult.data) {
      setSolidXBurnFee(shortenDecimal(Number(solidXBurnFeeResult.data) / 10));
    }
    if (stackedBurnFeeResult.data) {
      setStackedBurnFee(shortenDecimal(Number(stackedBurnFeeResult.data) / 10));
    }
    if (gelatoBurnFeeResult.data) {
      setGelatoBurnFee(shortenDecimal(Number(gelatoBurnFeeResult.data) / 10));
    }
    if (solidXReflectionFeeResult.data) {
      setSolidXReflectionFee(
        shortenDecimal(Number(solidXReflectionFeeResult.data) / 10)
      );
    }
    if (hexReflectionFeeResult.data) {
      setHexReflectionFee(
        shortenDecimal(Number(hexReflectionFeeResult.data) / 10)
      );
    }
    if (liquidityFeeResult.data) {
      setLiquidityFee(shortenDecimal(Number(liquidityFeeResult.data) / 10));
    }
    if (totalBuyFeeResult.data) {
      setTotalBuyFee(shortenDecimal(Number(totalBuyFeeResult.data) / 100));
    }
    if (totalSellFeeResult.data) {
      setTotalSellFee(shortenDecimal(Number(totalSellFeeResult.data) / 100));
    }
    if (totalGelBurnedResult.data) {
      setGelatoBurned(shortenDecimal(Number(totalGelBurnedResult.data) / 1e18));
    }
    if (totalPlsLpAddedResult.data) {
      setPlsLpAdded(shortenDecimal(Number(totalPlsLpAddedResult.data) / 1e18));
    }
    if (totalGelLpAddedResult.data) {
      setGelLpAdded(shortenDecimal(Number(totalGelLpAddedResult.data) / 1e18));
    }
    if (totalStackedBurnedResult.data) {
      setStackedBurned(
        shortenDecimal(Number(totalStackedBurnedResult.data) / 1e18)
      );
    }
    if (totalSolidXBurnedResult.data) {
      setSolidXBurned(
        shortenDecimal(Number(totalSolidXBurnedResult.data) / 1e18)
      );
    }
    if (totalHexDistributedResult.data) {
      setHexDistributed(
        shortenDecimal(Number(totalHexDistributedResult.data) / 1e8)
      );
    }
    if (totalSolidXDistributedResult.data) {
      setSolidXDistributed(
        shortenDecimal(Number(totalSolidXDistributedResult.data) / 1e18)
      );
    }
    if (txLimitResult.data) {
      setTxLimit(shortenDecimal(Number(txLimitResult.data) / 1e18));
    }
    if (swapThresholdResult.data) {
      setSwapThreshold(shortenDecimal(Number(swapThresholdResult.data) / 1e18));
    }
  }, [
    solidXBurnFeeResult.data,
    stackedBurnFeeResult.data,
    gelatoBurnFeeResult.data,
    solidXReflectionFeeResult.data,
    hexReflectionFeeResult.data,
    liquidityFeeResult.data,
    totalBuyFeeResult.data,
    totalSellFeeResult.data,
    totalGelBurnedResult.data,
    totalPlsLpAddedResult.data,
    totalGelLpAddedResult.data,
    totalStackedBurnedResult.data,
    totalSolidXBurnedResult.data,
    totalHexDistributedResult.data,
    totalSolidXDistributedResult.data,
    txLimitResult.data,
    swapThresholdResult.data,
  ]);

  const handleSetFees = async () => {
    setIsLoading(true);
    try {
      const result = await simulateContract(wagmiConfig, {
        abi: TokenABI,
        address: gelatoToken,
        functionName: "setFees",
        args: [
          parseFloat(solidXBurnFee) * 10,
          parseFloat(stackedBurnFee) * 10,
          parseFloat(gelatoBurnFee) * 10,
          parseFloat(solidXReflectionFee) * 10,
          parseFloat(hexReflectionFee) * 10,
          parseFloat(liquidityFee) * 10,
          parseFloat(totalBuyFee) * 100,
          parseFloat(totalSellFee) * 100,
          true,
        ],
        account: account.address,
      });

      const writeResult = await writeContract(wagmiConfig, result.request);
      await waitForTransactionReceipt(wagmiConfig, {
        hash: writeResult,
      });

      myToast({
        title: <span className="green">Set Fees</span>,
        content: <>Fees are set successfully.</>,
        autoClose: 5000,
      });
    } catch (e) {
      console.log(e);
    }
    setIsLoading(false);
  };

  const handleSetTxLimit = async () => {
    setIsLoading(true);
    try {
      const result = await simulateContract(wagmiConfig, {
        abi: TokenABI,
        address: gelatoToken,
        functionName: "setTxLimit",
        args: [parseFloat(txLimit) * 1e18],
        account: account.address,
      });

      const writeResult = await writeContract(wagmiConfig, result.request);
      await waitForTransactionReceipt(wagmiConfig, {
        hash: writeResult,
      });
      txLimitResult.refetch();
      myToast({
        title: <span className="green">Set TX Limit</span>,
        content: <>TX Limit set successfully.</>,
        autoClose: 5000,
      });
    } catch (e) {
      console.log(e);
    }
    setIsLoading(false);
  };

  const handleSetSwapSettings = async () => {
    setIsLoading(true);
    try {
      const result = await simulateContract(wagmiConfig, {
        abi: TokenABI,
        address: gelatoToken,
        functionName: "setSwapBackSettings",
        args: [true, parseFloat(swapThreshold) * 1e18],
        account: account.address,
      });

      const writeResult = await writeContract(wagmiConfig, result.request);
      await waitForTransactionReceipt(wagmiConfig, {
        hash: writeResult,
      });
      swapThresholdResult.refetch();
      myToast({
        title: <span className="green">Set Swapback Settings</span>,
        content: <>Swapback Settings set successfully.</>,
        autoClose: 5000,
      });
    } catch (e) {
      console.log(e);
    }
    setIsLoading(false);
  };

  return (
    <div className="admin-wrapper">
      <CustomNav />
      <h1>Gelato Administration Panel </h1>
      <div className="fee-settings-box">
        <div className="fee-column">
          <h3>Statistics</h3>
          <label>
            Total SolidX Reflected
            <input
              type="number"
              value={solidXDistributed}
              name="solidXDistributed"
              disabled
            />
          </label>
          <label>
            Total HEX Reflected
            <input
              type="number"
              value={hexDistributed}
              name="totalHexDistributed"
              disabled
            />
          </label>
          <label>
            Total SolidX Burned
            <input
              type="number"
              value={solidXBurned}
              name="solidXBurned"
              disabled
            />
          </label>
          <label>
            Total Gelato Burned
            <input
              type="number"
              value={gelatoBurned}
              name="gelatoBurned"
              disabled
            />
          </label>
          <label>
            Total Stacked Italian Burned
            <input
              type="number"
              value={stackedBurned}
              name="stackedBurned"
              disabled
            />
          </label>
          <label>
            Total PLS LP Added
            <input
              type="number"
              value={plsLpAdded}
              name="plsLpAdded"
              disabled
            />
          </label>
          <label>
            Total Gelato LP Added
            <input
              type="number"
              value={gelLpAdded}
              name="gelLpAdded"
              disabled
            />
          </label>
        </div>
      </div>
      <div className="fee-settings-box">
        <h2>Settings</h2>
        <div className="fee-settings-grid">
          <div className="fee-column">
            <h3>Fee Settings</h3>
            <label>
              SolidX Burn Fee ( % )
              <input
                type="number"
                value={solidXBurnFee}
                onChange={(e) => setSolidXBurnFee(e.target.value)}
                name="solidXBurnFee"
              />
            </label>
            <label>
              Stacked Burn Fee ( % )
              <input
                type="number"
                value={stackedBurnFee}
                onChange={(e) => setStackedBurnFee(e.target.value)}
                name="stackedBurnFee"
              />
            </label>
            <label>
              Gelato Burn Fee ( % )
              <input
                type="number"
                value={gelatoBurnFee}
                onChange={(e) => setGelatoBurnFee(e.target.value)}
                name="gelatoBurnFee"
              />
            </label>
            <label>
              SolidX Reflection Fee ( % )
              <input
                type="number"
                value={solidXReflectionFee}
                onChange={(e) => setSolidXReflectionFee(e.target.value)}
                name="solidXReflectionFee"
              />
            </label>
            <label>
              HEX Reflection Fee ( % )
              <input
                type="number"
                value={hexReflectionFee}
                onChange={(e) => setHexReflectionFee(e.target.value)}
                name="hexReflectionFee"
              />
            </label>
            <label>
              Liquidity Fee ( % )
              <input
                type="number"
                value={liquidityFee}
                onChange={(e) => setLiquidityFee(e.target.value)}
                name="liquidityFee"
              />
            </label>
            <label>
              Total Buy Fee ( % )
              <input
                type="number"
                value={totalBuyFee}
                onChange={(e) => setTotalBuyFee(e.target.value)}
                name="totalBuyFee"
              />
            </label>
            <label>
              Total Sell Fee ( % )
              <input
                type="number"
                value={totalSellFee}
                onChange={(e) => setTotalSellFee(e.target.value)}
                name="totalSellFee"
              />
            </label>
            <div className="button-container">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={isLoading || !account.isConnected}
                onClick={handleSetFees}>
                Set Fees
              </button>
            </div>
          </div>
          <div className="fee-column">
            <h3>Tx Limit Settings</h3>
            <label>
              TX Limit ( # )
              <input
                type="number"
                value={txLimit}
                onChange={(e) => setTxLimit(e.target.value)}
                name="txLimit"
              />
            </label>
            <div className="button-container">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={isLoading || !account.isConnected}
                onClick={handleSetTxLimit}>
                Set TX Limit
              </button>
            </div>
          </div>
          <div className="fee-column">
            <h3>Swapback Settings</h3>
            <label>
              Swap Threshold
              <input
                type="number"
                value={swapThreshold}
                onChange={(e) => setSwapThreshold(e.target.value)}
                name="swapThreshold"
              />
            </label>
            <div className="button-container">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={isLoading || !account.isConnected}
                onClick={handleSetSwapSettings}>
                Set Swapback Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
