import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useBoundStore } from 'store';
import { CURRENT_CHAIN } from 'store/slices/wallet.slice';
import { useEffect } from 'react';

export default function ConnectWallet() {
  const { setCurrentWalletState, setWalletState, setModalState } = useBoundStore();
  const { isConnected, isDisconnected, address } = useAccount();

  useEffect(() => {
    if (isConnected) {
      setModalState({ signUpMain: { isOpen: false } });
      setCurrentWalletState({ chain: CURRENT_CHAIN.EVM });
      setWalletState({ evm: { address, publicKey: address } });
    }
    if (isDisconnected) setCurrentWalletState({ chain: undefined });
  }, [isConnected]);

  return (
    // (current.chain === null || current.chain === CURRENT_CHAIN.EVM)
    <ConnectButton.Custom>
      {({ account, chain, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready && account && chain && (!authenticationStatus || authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button onClick={openConnectModal} type="button">
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button onClick={openChainModal} type="button">
                    Wrong network
                  </button>
                );
              }

              return (
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={openChainModal} style={{ display: 'flex', alignItems: 'center' }} type="button">
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 36,
                          height: 36,
                          borderRadius: 999,
                          overflow: 'hidden',
                          marginRight: 4,
                        }}
                      >
                        {chain.iconUrl && (
                          <img alt={chain.name ?? 'Chain icon'} src={chain.iconUrl} style={{ width: 36, height: 36 }} />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
