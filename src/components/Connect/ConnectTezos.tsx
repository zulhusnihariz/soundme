import { useBoundStore } from 'store';
import { AccountInfo, NetworkType } from '@airgap/beacon-dapp';
import { useTezosToolkit } from 'hooks/useTezos';
import { CURRENT_CHAIN } from 'store/slices/wallet.slice';

export default function ConnectTezos() {
  const { current, setCurrentWalletState, setWalletState, setModalState } = useBoundStore();
  const { tezos, beaconWallet } = useTezosToolkit();

  async function setup(account?: AccountInfo | undefined) {
    if (!account) return;
    const balance = await tezos?.tz.getBalance(account.address);

    setWalletState({
      tezos: { address: account.address, publicKey: account.publicKey, balance: { formatted: `${Number(balance)}` } },
    });

    setCurrentWalletState({ chain: CURRENT_CHAIN.TEZOS });
    setModalState({ signUpMain: { isOpen: false } });
  }

  async function connectWallet() {
    try {
      await beaconWallet?.requestPermissions({
        network: {
          type: NetworkType.GHOSTNET,
        },
      });

      setup(await beaconWallet?.client.getActiveAccount());
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      {
        <button onClick={() => connectWallet()} className="rounded-xl bg-[#3898FF] px-[14px] py-2 font-bold">
          Connect Tezos
        </button>
      }
    </>
  );
}
