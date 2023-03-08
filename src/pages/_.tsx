import styles from 'styles/Home.module.scss'
import { ThemeToggleButton, ThemeToggleList } from 'components/Theme'
import { useEffect, useState } from 'react'
import { useNetwork, useSwitchNetwork, useAccount, useBalance } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useConnectModal, useAccountModal, useChainModal } from '@rainbow-me/rainbowkit'
import { useSignMessage } from 'wagmi'

import Header from '../components/Header'
import MusicCollection from '.'
import { Fluence } from '@fluencelabs/fluence'

export default function Home() {
  return (
    <div className="container mx-auto">
      <Header />
    </div>
  )
}
