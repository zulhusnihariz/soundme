import { useBoundStore } from 'store';
import { useEffect } from 'react';
import { PhantomProvider } from 'lib/Phantom';
import { CURRENT_CHAIN } from 'store/slices/wallet.slice';

export default function ConnectSolana() {
  const { current, setCurrentState, setWalletState, setModalState } = useBoundStore();

  useEffect(() => {
    const getProvider = (): PhantomProvider | undefined => {
      if ('solana' in window) {
        // @ts-ignore
        const provider = window.solana as any;
        if (provider.isPhantom) return provider as PhantomProvider;
      }
    };

    setWalletState({ phantom: { provider: getProvider() } });
  }, []);

  /**
   * @description prompts user to connect wallet if it exists
   */
  const connectWallet = async () => {
    // @ts-ignore
    const { solana } = window;

    if (solana) {
      try {
        const response = await solana.connect();
        setWalletState({
          phantom: { address: response.publicKey.toString(), publicKey: response.publicKey.toString() },
        });
        setCurrentState({ chain: CURRENT_CHAIN.SOLANA });
        setModalState({ signUpMain: { isOpen: false } });
      } catch (err) {
        // { code: 4001, message: 'User rejected the request.' }
      }
    }
  };

  return (
    <>
      {current.chain === null && (
        <button onClick={() => connectWallet()} className="rounded-xl bg-[#3898FF] px-[14px] py-2 font-bold">
          Connect Phantom
        </button>
      )}
    </>
  );
}
