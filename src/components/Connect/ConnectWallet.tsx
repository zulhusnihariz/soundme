import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useBoundStore } from 'store';
import { CURRENT_CHAIN } from 'store/slices/wallet.slice';
import { useEffect } from 'react';

export default function ConnectWallet() {
  const { wallet, currentChain, setCurrentChain } = useBoundStore();
  const { phantom } = wallet;
  const { isConnected, isDisconnected } = useAccount();

  useEffect(() => {
    if (isConnected) setCurrentChain(CURRENT_CHAIN.EVM);
    if (isDisconnected) setCurrentChain(null);
  }, [isConnected]);

  return (currentChain === null || currentChain === CURRENT_CHAIN.EVM) && <ConnectButton />;
}
