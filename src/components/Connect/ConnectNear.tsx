import '@near-wallet-selector/modal-ui/styles.css';
import { setupModal } from '@near-wallet-selector/modal-ui';
import { useBoundStore } from 'store';
import { setupWalletSelector } from '@near-wallet-selector/core';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import MyNearIconUrl from '@near-wallet-selector/my-near-wallet/assets/my-near-wallet-icon.png';

export default function ConnectNear() {
  const { current } = useBoundStore();

  async function onClickConnect() {
    const selector = await setupWalletSelector({
      network: 'testnet',
      modules: [
        setupMyNearWallet({
          walletUrl: 'https://testnet.mynearwallet.com',
          //@ts-ignore
          iconUrl: MyNearIconUrl,
        }),
      ],
    });

    const modal = setupModal(selector, {
      contractId: `${process.env.CONTRACT_NAME}`,
    });

    modal.show();
  }

  return (
    <>
      {
        <button onClick={() => onClickConnect()} className="rounded-xl bg-[#3898FF] px-[14px] py-2 font-bold">
          NEAR
        </button>
      }
    </>
  );
}
