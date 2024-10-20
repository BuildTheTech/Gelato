import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import "./index.scss";

import { createWeb3Modal } from "@web3modal/wagmi/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { pulsechain } from "viem/chains";
import { injected, walletConnect } from "wagmi/connectors";
import { http, createConfig, WagmiProvider } from "wagmi";
import { walletConnectProjectId } from "./Utilities/constants";
import { ErrorBoundary } from "./Error.ts";

const queryClient = new QueryClient();

const metadata = {
  name: "Gelato",
  description: "Gelato Administrative Panel",
  url: "https://gelato.io",
  icons: [""],
};

const chains = [pulsechain] as const;

export const wagmiConfig = createConfig({
  chains,
  transports: {
    [pulsechain.id]: http(),
  },
  connectors: [
    injected({ shimDisconnect: false }),
    walletConnect({
      projectId: walletConnectProjectId,
      metadata,
      showQrModal: false,
    }),
  ],
});

createWeb3Modal({
  wagmiConfig,
  projectId: walletConnectProjectId,
  featuredWalletIds: [
    "18388be9ac2d02726dbac9777c96efaac06d744b2f6d580fccdd4127a6d01fd1", // Rabby
    "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96", // MetaMask
    "e7c4d26541a7fd84dbdfa9922d3ad21e936e13a7a0e44385d44f006139e44d3b", // WalletConnect
    "dd43441a6368ec9046540c46c5fdc58f79926d17ce61a176444568ca7c970dcd", // Internet Money Wallet
    "19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927", // Ledger
    "0b415a746fb9ee99cce155c2ceca0c6f6061b1dbca2d722b3ba16381d0562150", // SafePal
  ],
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  </StrictMode>
);
