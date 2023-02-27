import { ThemeToggleButton, ThemeToggleList } from 'components/Theme'
import ConnectWallet from 'components/Connect/ConnectWallet'
import styles from '../../styles/Home.module.scss'

export default function Header() {
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
