import * as nearAPI from 'near-api-js';
import { AccountState, Wallet, WalletSelector, setupWalletSelector } from '@near-wallet-selector/core';

import '@near-wallet-selector/modal-ui/styles.css';
import MyNearIconUrl from '@near-wallet-selector/my-near-wallet/assets/my-near-wallet-icon.png';
import { setupModal } from '@near-wallet-selector/modal-ui';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import { useEffect, useState } from 'react';
import { useBoundStore } from 'store';
import { CURRENT_CHAIN } from 'store/slices/wallet.slice';

export default function ConnectNear() {
  const { wallet: storeWallet, currentChain, setWalletState, setCurrentChain } = useBoundStore();
  const { near } = storeWallet;
  const { keyStores, connect, InMemorySigner, utils } = nearAPI;
  const myKeyStore = new keyStores.BrowserLocalStorageKeyStore();
  const signer = new InMemorySigner(myKeyStore);

  const [selector, setSelector] = useState<WalletSelector>();
  const [wallet, setWallet] = useState<Wallet>();
  const [account, setAccount] = useState<AccountState>();
  const [nearConnection, setNearConnection] = useState<nearAPI.Near>();
  const connectionConfig = {
    networkId: 'testnet',
    keyStore: myKeyStore, // first create a key store
    nodeUrl: 'https://rpc.testnet.near.org',
    walletUrl: 'https://wallet.testnet.near.org',
    helperUrl: 'https://helper.testnet.near.org',
    explorerUrl: 'https://explorer.testnet.near.org',
  };

  useEffect(() => {
    async function initNearWallet() {
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

      setSelector(selector);

      const isSignedIn = selector.isSignedIn();

      if (isSignedIn) {
        const nearConnection = await connect(connectionConfig);
        let wallet = await selector.wallet();
        let accounts = selector.store.getState().accounts[0];

        setNearConnection(nearConnection);
        setWallet(wallet);
        setAccount(accounts);

        let nearAcc = await nearConnection.account(accounts.accountId);
        let accBal = await nearAcc.getAccountBalance();

        const amountInNEAR = utils.format.formatNearAmount(accBal.available);
        const parsedAmountInNEAR = parseFloat(parseFloat(amountInNEAR).toFixed(3));

        setWalletState({ near: { address: accounts.accountId, balance: parsedAmountInNEAR } });
        setCurrentChain(CURRENT_CHAIN.NEAR);
      }
    }

    initNearWallet();
  }, []);

  async function onClickConnect() {
    const modal = setupModal(selector!, {
      contractId: `${process.env.CONTRACT_NAME}`,
    });

    modal.show();
  }
  async function onClickDisconnect() {
    wallet?.signOut();
    setWallet(undefined);
    setCurrentChain(null);
    setWalletState({ near: { address: '' } });
    // window.location.replace(window.location.origin + window.location.pathname);
  }

  return (
    <>
      {currentChain === null && (
        <button onClick={() => onClickConnect()} className="rounded-xl bg-[#3898FF] px-[14px] py-2 font-bold">
          Connect Near
        </button>
      )}

      {currentChain === CURRENT_CHAIN.NEAR && (
        <>
          <button onClick={() => onClickDisconnect()}>Disconnect</button>

          <div className="flex rounded-lg bg-[#1A1B1F]">
            <p className="px-4 py-2">{`${near.balance} NEAR`}</p>
            <p className="rounded-lg bg-[#38393C] px-4 py-2 font-bold"> {near.address}</p>
          </div>
        </>
      )}
    </>
  );
}
