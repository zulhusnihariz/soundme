import styles from 'styles/Home.module.scss'
import { ThemeToggleButton, ThemeToggleList } from 'components/Theme'
import { useState } from 'react'
import { useNetwork, useSwitchNetwork, useAccount, useBalance } from 'wagmi'
import ConnectWallet from 'components/Connect/ConnectWallet'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useConnectModal, useAccountModal, useChainModal } from '@rainbow-me/rainbowkit'
import { useSignMessage } from 'wagmi'

export default function Home() {
  return (
    <div className="container mx-auto">
      <Header />
      <Main />
      {/* <Footer /> */}
    </div>
  )
}

function Header() {
  return (
    <header className={styles.header}>
      <div>SOUNDME</div>
      <div className="flex items-center">{/* <ThemeToggleButton /> header <ThemeToggleList /> */}</div>

      <div className="flex items-center">
        <ThemeToggleButton />
        <ConnectWallet />
      </div>
    </header>
  )
}

function Main() {
  return (
    <main className={styles.main + ' space-y-6'}>
      <div className="text-center">
        {/* <p className="font-medium">Dapp Starter Boilerplate by arisac.eth</p>
        <p>
          <a
            href="https://github.com/arisac/dapp-starter"
            target="_blank"
            className="text-sm underline"
            rel="noreferrer"
          >
            https://github.com/arisac/dapp-starter
          </a>
        </p> */}
      </div>

      <div className="w-full max-w-xl rounded-xl p-6 text-center"></div>
    </main>
  )
}

function SignMsg() {
  const [msg, setMsg] = useState('Dapp Starter')
  const { data, isError, isLoading, isSuccess, signMessage } = useSignMessage({
    message: msg,
  })
  const signMsg = () => {
    if (msg) {
      signMessage()
    }
  }

  return (
    <>
      <p>
        <input value={msg} onChange={e => setMsg(e.target.value)} className="rounded-lg p-1" />
        <button
          disabled={isLoading}
          onClick={() => signMsg()}
          className="ml-1 rounded-lg bg-blue-500 py-1 px-2 text-white transition-all duration-150 hover:scale-105"
        >
          Sign
        </button>
      </p>
      <p>
        {isSuccess && <span>Signature: {data}</span>}
        {isError && <span>Error signing message</span>}
      </p>
    </>
  )
}

function Footer() {
  return (
    <footer className={styles.footer}>
      <div>
        <ThemeToggleList />
      </div>
      <div className="flex items-center">
        <ThemeToggleButton /> footer <ThemeToggleList />
      </div>

      <div className="flex items-center">
        <ThemeToggleButton />
        <ThemeToggleList />
      </div>
    </footer>
  )
}
