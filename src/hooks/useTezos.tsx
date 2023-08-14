import { createContext, useContext, useEffect, useState } from 'react';
import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { BeaconEvent, NetworkType, defaultEventCallbacks } from '@airgap/beacon-dapp';
import { useBoundStore } from 'store';
import { CURRENT_CHAIN } from 'store/slices/wallet.slice';
import { InMemorySigner } from '@taquito/signer';
import { cryptoUtils, b58cdecode, buf2hex, prefix, hex2buf, b58cencode } from 'sotez';

import { char2Bytes, b58cdecode as tacob58cdecode } from '@taquito/utils';
import { generateKeyPairFromSeed } from '@stablelib/ed25519';

import { sign } from 'tweetnacl';

interface TezosContextInterface {
  tezos: TezosToolkit | undefined;
  beaconWallet: BeaconWallet | undefined;
}

export const TezosContext = createContext<TezosContextInterface | undefined>(undefined);

export const useTezosToolkit = () => {
  const context = useContext(TezosContext);
  if (!context) {
    throw new Error('useTezosToolkit  must be used within a TezosProvider');
  }
  return context;
};

export const TezosProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { setCurrentWalletState, setWalletState, setModalState } = useBoundStore();
  const [isConnected, setIsConnected] = useState(false);

  const [tezos] = useState<TezosToolkit>(new TezosToolkit('https://ghostnet.ecadinfra.com'));
  const [beaconWallet, setBeaconWallet] = useState<BeaconWallet>();

  useEffect(() => {
    async function init() {
      if (!isConnected) {
        const wallet = new BeaconWallet({
          name: 'Collabeat',
          preferredNetwork: NetworkType.GHOSTNET,
        });

        let active = await wallet?.client.getActiveAccount();

        if (active) {
          setWalletState({
            tezos: {
              address: active.address,
              publicKey: active.publicKey,
            },
          });

          setCurrentWalletState({ chain: CURRENT_CHAIN.TEZOS });
          setModalState({ signUpMain: { isOpen: false } });
        }

        setBeaconWallet(wallet);
        tezos.setWalletProvider(wallet);

        // DELETE LATER: test signing message using tezos wallet without blake2b hashing
        /*         let sk = 'edskRhyy8yvRcmc3W9BSJ5spguGibkZumrdwhSB21Dd7pU8fMqJPDzu1qcfWMaQGnMoyZVKU4RsqVSFaVyx6wRLPB3vkVmzkhp';
        let signer = new InMemorySigner(sk);

        let extracted = await cryptoUtils.extractKeys(sk);

        let sig2 =
          'edsigtcPRT5CdbxqQja3LwbQMceLjeeeXLthYy13HTph8Ppc4SE7MnYaLXUW4LsRVoEbo9Ln6Cn1H1xEqPggt474H1ApjV75XNH';
        let message = 'https://nftstorage.link/ipfs/bafkreidhrp2wwte5wliuvekr5whoh7267puttz6cp6v7qexymwhntug4am';
        let sig3 = await signer.sign(char2Bytes(message));

        console.log('sig3', sig3);
        console.log('extracted keys', extracted);
        tezos.setSignerProvider(signer);

        let inmemory_prefix_sig = b58cdecode(sig3.prefixSig, prefix.edsig);
        console.log('inmemory_prefix_sig', buf2hex(inmemory_prefix_sig), buf2hex(inmemory_prefix_sig).length);

        let decoded_pk_taco_prefix = tacob58cdecode(extracted.pk, prefix.edpk);
        let decoded_pkh_taco_prefix = tacob58cdecode(extracted.pkh, prefix.tz1);
        let decoded_sk_taco_prefix = tacob58cdecode(extracted.sk, prefix.edsk);
        let decoded_sig_taco_prefix = tacob58cdecode(sig2, prefix.edsig);

        console.log('taco_pk', buf2hex(decoded_pk_taco_prefix), buf2hex(decoded_pk_taco_prefix).length);
        console.log('taco_pkh', buf2hex(decoded_pkh_taco_prefix), buf2hex(decoded_pkh_taco_prefix).length);
        console.log('taco_sk', buf2hex(decoded_sk_taco_prefix), buf2hex(decoded_sk_taco_prefix).length);
        console.log('taco_sig', buf2hex(decoded_sig_taco_prefix), buf2hex(decoded_sig_taco_prefix).length);

        let sliced = buf2hex(decoded_sk_taco_prefix).substring(0, 64);
        let hexSliced = hex2buf(sliced);
        console.log(sliced, hexSliced, hexSliced.length);

        const { publicKey, secretKey } = generateKeyPairFromSeed(hexSliced);

        console.log('gpkfs pk ', buf2hex(publicKey));
        console.log('gpkfs sk ', buf2hex(secretKey));

        let signed_ed25519 = sign.detached(new TextEncoder().encode(message), secretKey);

        let encoded_ed25519 = b58cencode(signed_ed25519, prefix.edsig);

        console.log('edd2519 signed', buf2hex(signed_ed25519));
        console.log('encoded edd2519 sign', encoded_ed25519);
        */
        // delete end
        setIsConnected(true);
      }
    }

    init();
  }, [isConnected]);

  if (!isConnected) {
    return <></>;
  }

  return (
    <TezosContext.Provider value={{ tezos, beaconWallet }}>
      <div>{children}</div>
    </TezosContext.Provider>
  );
};
