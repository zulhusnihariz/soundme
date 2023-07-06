import { useAccount } from 'wagmi';
import { useBoundStore } from 'store';
import { useEffect } from 'react';
import { PhantomProvider } from 'lib/Phantom';
import { CURRENT_CHAIN } from 'store/slices/wallet.slice';
import { shortenAddress } from 'utils';
import { LAMPORTS_PER_SOL, clusterApiUrl, Connection } from '@solana/web3.js';

export default function ConnectSolana() {
  const { isConnected } = useAccount();
  const { wallet, currentChain, setWalletState, setCurrentChain } = useBoundStore();
  const { phantom } = wallet;

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
        let balance = await getBalance();
        setWalletState({ phantom: { address: response.publicKey.toString(), balance } });
        setCurrentChain(CURRENT_CHAIN.SOLANA);
      } catch (err) {
        // { code: 4001, message: 'User rejected the request.' }
      }
    }
  };

  const getBalance = async () => {
    if (!phantom.provider || !phantom.provider.publicKey) return;
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    let balance = await connection.getBalance(phantom?.provider?.publicKey);
    return balance / LAMPORTS_PER_SOL;
  };

  /**
   * @description disconnect Phantom wallet
   */
  const disconnectWallet = async () => {
    // @ts-ignore
    const { solana } = window;

    if (phantom.address && solana) {
      await (solana as PhantomProvider).disconnect();
      setWalletState({ phantom: { address: '' } });
      setCurrentChain(null);
    }
  };

  return (
    <>
      {currentChain === null && (
        <button onClick={() => connectWallet()} className="rounded-xl bg-[#3898FF] px-[14px] py-2 font-bold">
          Connect Phantom
        </button>
      )}

      {currentChain === CURRENT_CHAIN.SOLANA && (
        <div className="flex items-center justify-center">
          <button
            style={{
              fontSize: '16px',
              padding: '15px',
              fontWeight: 'bold',
              borderRadius: '5px',
              margin: '15px auto',
            }}
            onClick={disconnectWallet}
          >
            Disconnect
          </button>
          <div className="flex rounded-lg bg-[#1A1B1F]">
            <p className="px-4 py-2">{`${phantom.balance} SOL`}</p>
            <p className="rounded-lg bg-[#38393C] px-4 py-2 font-bold"> {shortenAddress(phantom.address)}</p>
          </div>
        </div>
      )}
    </>
  );
}
