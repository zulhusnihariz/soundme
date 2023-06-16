import 'styles/style.scss';
import type { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import { app } from 'appConfig';
import { useState, useEffect } from 'react';
import HeadGlobal from 'components/HeadGlobal';
// Web3Wrapper deps:
import { metaMaskWallet, walletConnectWallet } from '@rainbow-me/rainbowkit/wallets';
import { connectorsForWallets, RainbowKitProvider, lightTheme, darkTheme } from '@rainbow-me/rainbowkit';
import { goerli, polygonMumbai } from 'wagmi/chains';
import { createConfig, configureChains, WagmiConfig } from 'wagmi';
import { infuraProvider } from 'wagmi/providers/infura';
import { publicProvider } from 'wagmi/providers/public';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { FluenceProvider } from 'hooks/use-fluence';
import { IpfsProvider } from 'hooks/use-ipfs';
import MainLayout from 'layout/MainLayout';
import { AlertMessageProvider } from 'hooks/use-alert-message';
import { rainbowWeb3AuthConnector } from 'hooks/rainbow-web3auth-connector';

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  return (
    <ThemeProvider defaultTheme="system" attribute="class" forcedTheme="dark">
      <HeadGlobal />
      <Web3Wrapper>
        <MainLayout>
          <Component key={router.asPath} {...pageProps} />
        </MainLayout>
      </Web3Wrapper>
    </ThemeProvider>
  );
}
export default App;

const currentChain = [];
switch (process.env.NEXT_PUBLIC_CHAIN_ID) {
  case '80001':
    currentChain.push(polygonMumbai);
    break;
  case 'goerli':
  default:
    currentChain.push(goerli);
}

// Web3 Configs
const { chains, publicClient } = configureChains(currentChain, [
  infuraProvider({ apiKey: String(process.env.NEXT_PUBLIC_INFURA_ID) }),
  jsonRpcProvider({
    rpc: chain => {
      return {
        http: `${chain.rpcUrls.default}`,
      };
    },
  }),
  publicProvider(),
]);

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      rainbowWeb3AuthConnector({ chains }),
      metaMaskWallet({
        chains,
        projectId: 'some_string',
      }),
      walletConnectWallet({ chains, projectId: 'some_string', version: '1' }),
    ],
  },
]);

const wagmiConfig = createConfig({ autoConnect: true, connectors, publicClient });

// Web3Wrapper
export function Web3Wrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        appInfo={{
          appName: app.name,
          learnMoreUrl: app.url,
        }}
        chains={chains}
        initialChain={polygonMumbai} // Optional, initialChain={1}, initialChain={chain.mainnet}, initialChain={gnosisChain}
        showRecentTransactions={true}
        theme={resolvedTheme === 'dark' ? darkTheme() : lightTheme()}
      >
        <IpfsProvider>
          <FluenceProvider>
            <AlertMessageProvider>{children}</AlertMessageProvider>
          </FluenceProvider>
        </IpfsProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
