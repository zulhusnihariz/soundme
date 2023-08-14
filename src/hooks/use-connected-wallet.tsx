import { setupWalletSelector } from '@near-wallet-selector/core';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import { Connection, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js';
import { PhantomProvider } from 'lib/Phantom';
import { InMemorySigner, connect, keyStores, utils } from 'near-api-js';
import { useEffect, useState } from 'react';
import { useBoundStore } from 'store';
import { CURRENT_CHAIN } from 'store/slices/wallet.slice';
import MyNearIconUrl from '@near-wallet-selector/my-near-wallet/assets/my-near-wallet-icon.png';

import { useChainId, useBalance, useAccount, useSignMessage, useDisconnect } from 'wagmi';
import { abbreviateETHBalance, shortenAddress } from 'utils';
import { encode } from 'bs58';
import { useTezosToolkit } from './useTezos';
import { SigningType } from '@airgap/beacon-dapp';
import { char2Bytes } from '@taquito/utils';

export function useConnectedWallet() {
  const { current, wallet, setCurrentWalletState, setWalletState } = useBoundStore();
  const { near, phantom, tezos } = wallet;

  const [address, setAddress] = useState({ display: '', full: '' });
  const [balance, setBalance] = useState({ formatted: '', symbol: '' });

  const { tezos: tezosProvider, beaconWallet } = useTezosToolkit();

  // Wagmi hooks
  const { address: evmAddress } = useAccount();
  const evmChainId = useChainId();
  const { disconnectAsync: wagmiDisconnect, isSuccess } = useDisconnect();
  const { data: evmBalance } = useBalance({ address: evmAddress });

  const { signMessageAsync } = useSignMessage({});
  // End Wagmi hooks
  function setConnectedAddress() {
    switch (current.chain) {
      case CURRENT_CHAIN.EVM:
        setAddress({ display: shortenAddress(`${evmAddress}`), full: `${evmAddress}` });
        return;
      case CURRENT_CHAIN.SOLANA:
        setAddress({ display: shortenAddress(`${phantom.address}`), full: `${phantom.publicKey}` });
        return;
      case CURRENT_CHAIN.NEAR:
        setAddress({ display: shortenAddress(`${near.address}`), full: `${near.publicKey}` });
        return;
      case CURRENT_CHAIN.TEZOS:
        setAddress({ display: shortenAddress(`${tezos?.address}`), full: `${tezos?.address}` });
        return;
    }
  }

  async function getBalance() {
    if (!current.chain) return;

    switch (current.chain) {
      case CURRENT_CHAIN.EVM:
        const ethBalance = evmBalance == null ? void 0 : evmBalance.formatted;
        const displayBalance = ethBalance ? abbreviateETHBalance(parseFloat(ethBalance)) : void 0;

        setBalance({ formatted: displayBalance ?? '0', symbol: evmBalance?.symbol ?? '' });
        break;
      case CURRENT_CHAIN.SOLANA:
        if (!phantom.provider || !phantom.provider.publicKey) return;
        const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
        let balance = await connection.getBalance(phantom?.provider?.publicKey);

        setBalance({ formatted: `${balance / LAMPORTS_PER_SOL}`, symbol: 'SOL' });
        break;
      case CURRENT_CHAIN.NEAR:
        if (near.provider) {
          let nearBalance = await near.provider?.account.getAccountBalance();
          const amountInNEAR = utils.format.formatNearAmount(nearBalance.available);
          const displayNearBalance = amountInNEAR ? abbreviateETHBalance(parseFloat(amountInNEAR)) : 0;

          setBalance({ formatted: `${displayNearBalance}`, symbol: 'NEAR' });
          return;
        }

        setBalance({ formatted: `${0}`, symbol: 'NEAR' });
        break;
      case CURRENT_CHAIN.TEZOS:
        if (tezosProvider && beaconWallet) {
          const active = await beaconWallet.client.getActiveAccount();
          if (active) {
            const balance = await tezosProvider.tz.getBalance(active.address as string);
            setBalance({ formatted: `${Number(balance)}`, symbol: 'XTZ' });
            return;
          }
        }
    }
  }

  async function signMessage(message: string) {
    switch (current.chain) {
      case CURRENT_CHAIN.EVM:
        try {
          return await signMessageAsync({ message });
        } catch (e) {
          return e;
        }

      case CURRENT_CHAIN.SOLANA:
        try {
          const encodedMessage = new TextEncoder().encode(message);
          let result = await phantom.provider?.signMessage(encodedMessage, 'utf8');
          return encode(result.signature as Uint8Array);
        } catch (e) {
          return e;
        }
      case CURRENT_CHAIN.NEAR:
        if (near.provider) {
          try {
            const encodedMessage = new TextEncoder().encode(message);
            const result = await near.provider?.signer.signMessage(
              encodedMessage,
              near.provider.account.accountId,
              'testnet'
            );
            return encode(result.signature as Uint8Array);
          } catch (e) {
            return e;
          }
        }
      case CURRENT_CHAIN.TEZOS:
        let formattedInput = ['Tezos Signed Message:', 'http://localhost:3000', new Date().toISOString(), message].join(
          ' '
        );

        const bytes = char2Bytes(formattedInput);
        const bytesLength = (bytes.length / 2).toString(16);
        const addPadding = `00000000${bytesLength}`;
        const paddedBytesLength = addPadding.slice(addPadding.length - 8);
        const payloadBytes = '05' + '01' + paddedBytesLength + bytes;

        try {
          let test = await beaconWallet?.client.requestSignPayload({
            signingType: SigningType.MICHELINE,
            payload: `${payloadBytes}`,
          });

          // let test = await beaconWallet?.client.requestSignPayload({
          //   signingType: SigningType.RAW,
          //   payload: message,
          // });

          // let decoded = b58cdecode(test?.signature as string, prefix.edsig);
          // console.log(test?.signature, buf2hex(decoded));

          // return buf2hex(decoded);

          return test?.signature;
        } catch (e) {
          console.log(e);
          return e;
        }
    }
  }

  /**
   * @description disconnect wallet based on current connected chain
   */
  async function disconnect() {
    switch (current.chain) {
      case CURRENT_CHAIN.EVM:
        await wagmiDisconnect();
        setWalletState({ evm: { address: '' } });
        break;
      case CURRENT_CHAIN.SOLANA:
        // @ts-ignore
        const { solana } = window;

        if (phantom.address && solana) {
          await (solana as PhantomProvider).disconnect();
          setWalletState({ phantom: { address: '' } });
        }
        break;
      case CURRENT_CHAIN.NEAR:
        if (near.provider) {
          const wallet = await near.provider?.selector.wallet();
          await wallet.signOut();
          setWalletState({ near: { address: '' } });
        }
        break;
      case CURRENT_CHAIN.TEZOS:
        if (beaconWallet) {
          beaconWallet.client.clearActiveAccount();
          setWalletState({ tezos: { address: '' } });
        }
        break;
    }

    setCurrentWalletState({ chain: undefined, address: '', publicKey: '', balance: { formatted: '', symbol: '' } });
    setAddress({ display: '', full: '' });
    setBalance({ formatted: '', symbol: '' });
  }

  useEffect(() => {
    console.log('inside useConnectedWallet hooks');
    async function setConnectedBalance() {
      await getBalance();
    }

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

      const myKeyStore = new keyStores.BrowserLocalStorageKeyStore();

      const connectionConfig = {
        networkId: 'testnet',
        keyStore: myKeyStore, // first create a key store
        nodeUrl: 'https://rpc.testnet.near.org',
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
        explorerUrl: 'https://explorer.testnet.near.org',
      };

      const isSignedIn = selector.isSignedIn();

      if (isSignedIn) {
        setCurrentWalletState({ chain: CURRENT_CHAIN.NEAR });

        const nearConnection = await connect(connectionConfig);
        let accounts = selector.store.getState().accounts[0];
        let account = await nearConnection.account(accounts.accountId);
        const signer = new InMemorySigner(myKeyStore);

        signer.createKey(accounts.accountId, 'testnet');

        let pk;

        if (accounts && accounts.publicKey) {
          pk = accounts.publicKey.split(':')[1];
        }

        console.log('pbk', pk);

        setWalletState({
          near: {
            address: accounts.accountId,
            publicKey: pk ?? accounts.publicKey,
            provider: { account, selector, signer },
          },
        });
        setConnectedAddress();
        await getBalance();
      }
    }

    initNearWallet();
    if (current.chain === CURRENT_CHAIN.NEAR) return;

    setConnectedAddress();
    setConnectedBalance();
  }, [current.chain, evmChainId]);

  return { address, balance, disconnect, signMessage };
}
