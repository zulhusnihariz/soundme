import 'styles/style.scss'
import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import { useRouter } from 'next/router'
import { useTheme } from 'next-themes'
import { app } from 'appConfig'
import { useState, useEffect } from 'react'
import HeadGlobal from 'components/HeadGlobal'
// Web3Wrapper deps:
import { connectorsForWallets, RainbowKitProvider, lightTheme, darkTheme } from '@rainbow-me/rainbowkit'
import {
  injectedWallet,
  metaMaskWallet,
  braveWallet,
  coinbaseWallet,
  walletConnectWallet,
  ledgerWallet,
  rainbowWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { Chain } from '@rainbow-me/rainbowkit'
import { mainnet, goerli, polygonMumbai } from 'wagmi/chains'
import { createClient, configureChains, WagmiConfig } from 'wagmi'
import { infuraProvider } from 'wagmi/providers/infura'
import { publicProvider } from 'wagmi/providers/public'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { FluenceProvider } from 'hooks/use-fluence'
import { IpfsProvider } from 'hooks/use-ipfs'
import MainLayout from 'layout/MainLayout'

function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  return (
    <ThemeProvider defaultTheme="system" attribute="class" forcedTheme="dark">
      <HeadGlobal />
      <Web3Wrapper>
        <MainLayout>
          <Component key={router.asPath} {...pageProps} />
        </MainLayout>
      </Web3Wrapper>
    </ThemeProvider>
  )
}
export default App

const currentChain = []
switch (process.env.NEXT_PUBLIC_CHAIN_ID) {
  case '80001':
    currentChain.push(polygonMumbai)
    break
  case 'goerli':
  default:
    currentChain.push(goerli)
}

// Web3 Configs
const { chains, provider } = configureChains(currentChain, [
  infuraProvider({ apiKey: process.env.NEXT_PUBLIC_INFURA_ID !== '' && process.env.NEXT_PUBLIC_INFURA_ID }),
  jsonRpcProvider({
    rpc: chain => {
      return {
        http: `${chain.rpcUrls.default}`,
      }
    },
  }),
  publicProvider(),
])

const otherWallets = [
  braveWallet({ chains }),
  ledgerWallet({ chains }),
  coinbaseWallet({ chains, appName: app.name }),
  rainbowWallet({ chains }),
]

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [injectedWallet({ chains }), metaMaskWallet({ chains }), walletConnectWallet({ chains })],
  },
  {
    groupName: 'Other Wallets',
    wallets: otherWallets,
  },
])

const wagmiClient = createClient({ autoConnect: true, connectors, provider })

// Web3Wrapper
export function Web3Wrapper({ children }) {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider
        appInfo={{
          appName: app.name,
          learnMoreUrl: app.url,
        }}
        chains={chains}
        initialChain={goerli} // Optional, initialChain={1}, initialChain={chain.mainnet}, initialChain={gnosisChain}
        showRecentTransactions={true}
        theme={resolvedTheme === 'dark' ? darkTheme() : lightTheme()}
      >
        <IpfsProvider>
          <FluenceProvider>{children}</FluenceProvider>
        </IpfsProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  )
}
