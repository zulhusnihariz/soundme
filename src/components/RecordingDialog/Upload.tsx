import { useIpfs } from 'hooks/use-ipfs';
import { useContext, useEffect, useState } from 'react';
import { useAccount, useMutation, useSignMessage } from 'wagmi';
import { LoadingSpinner, PlayIcon, StopIcon } from 'components/Icons/icons';
import { AlertMessageContext } from 'hooks/use-alert-message';
import { useBoundStore } from 'store';
import { useConnectedWallet } from 'hooks/useConnectedWallet';

interface UploadProp {
  audioData: any;
  dataKey: String;
  tokenId: String;
  onHandlePlayClicked: () => void;
  onHandleStopClicked: () => void;
  onHandleRecordClicked: () => any;
  onHandleConfirmClicked: () => void;
  onHandleMuteClicked: (muted: boolean) => void;
  isRecordedPlaying: boolean;
  isAllBeatsMuted: boolean;
}

export type SendTransactionArgs = {
  data_key: string;
  token_key: string;
  token_id: string;
  alias: string;
  public_key: string;
  signature: string;
  data: string;
  method: string;
  nonce: number;
  version: number;
};

const Upload = (prop: UploadProp) => {
  const [audioUrl, setAudioUrl] = useState<string>('');

  const { current, wallet } = useBoundStore();

  const { ipfs } = useIpfs();
  const { address } = useAccount();

  const { signMessageAsync } = useSignMessage({
    onSuccess(signature) {
      add_new_beat(address as `0x${string}`, signature);
    },
  });

  const { showError, showSuccess } = useContext(AlertMessageContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { signMessage: signMessageByChain, address: addressByChain } = useConnectedWallet();

  const { mutateAsync: send_transaction } = useMutation({
    mutationFn: async (data: SendTransactionArgs) => {
      let response = await fetch('http://localhost:3030/api/v0/json-rpc', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'send_transaction',
          params: data,
          id: 'string',
        }),
      });

      return await response.json();
    },
  });

  const add_to_nft = async () => {
    if (!prop.audioData.blob) return;

    if (!address && !wallet.phantom.address && !wallet.near.address && !wallet.tezos.address) {
      showError('Connect your wallet to add beat to NFT');
      return;
    }

    setIsLoading(true);

    try {
      const resp = await ipfs.storeBlob(prop.audioData.blob);
      const url = `${process.env.NEXT_PUBLIC_IPFS_BEAT_STORAGE_URL}/${resp}`;
      setAudioUrl(url);
    } catch (e: unknown) {
      const error = e as Error;
      showError(`${error.message}`);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const signMessage = async () => {
      try {
        let signature = await signMessageByChain(audioUrl);
        if (typeof signature !== 'string') throw Error((signature as Error).message);
        add_new_beat(addressByChain.full, signature);
      } catch (e) {
        const error = e as Error;
        showError(`${error.message}`);
        setIsLoading(false);
        setAudioUrl('');
      }
    };

    if (audioUrl) signMessage();
  }, [audioUrl, signMessageAsync]);

  const add_new_beat = async (address: string, signature: string) => {
    console.log({
      data_key: prop.dataKey.toString(),
      token_key: process.env.NEXT_PUBLIC_TOKEN_KEY ?? '',
      token_id: prop.tokenId.toString(),
      alias: '',
      public_key: address,
      signature,
      data: audioUrl,
      method: 'metadata',
      nonce: 0,
      version: 1,
    });
    try {
      let res = await send_transaction({
        data_key: prop.dataKey.toString(),
        token_key: process.env.NEXT_PUBLIC_TOKEN_KEY ?? '',
        token_id: prop.tokenId.toString(),
        alias: '',
        public_key: address,
        signature,
        data: audioUrl,
        method: 'metadata',
        nonce: 0,
        version: 1,
      });

      console.log('add beat res', signature, res);
    } catch (e: unknown) {
      console.log('add beat err', e);
    }

    prop.onHandleConfirmClicked();
    showSuccess(`Congratulations, you've succeeded in making that terrible sound even more unbearable.`);
    setIsLoading(false);
  };

  return (
    <div className="mt-4 flex flex-col items-center justify-center gap-4 text-center text-sm text-white md:text-lg">
      <div className="flex gap-2">
        {prop.isRecordedPlaying ? (
          <button
            className="rounded-md bg-indigo-600 px-2 py-2 md:px-5 md:hover:scale-105"
            onClick={prop.onHandleStopClicked}
          >
            <StopIcon />
          </button>
        ) : (
          <button
            className="rounded-md bg-indigo-600 px-2 py-2 md:px-5 md:hover:scale-105"
            onClick={prop.onHandlePlayClicked}
          >
            <PlayIcon />
          </button>
        )}

        <button
          className="rounded-md bg-gradient-to-t from-[#7224A7] from-20% to-[#FF3065] px-2 py-2 md:px-5 md:hover:scale-105"
          onClick={prop.onHandleRecordClicked}
        >
          Record again
        </button>
      </div>

      <div className="flex gap-2">
        <button
          className=" rounded-md bg-red-600 px-2 py-2 md:px-5 md:hover:scale-105"
          disabled={isLoading}
          onClick={() => add_to_nft()}
        >
          {isLoading ? <LoadingSpinner /> : 'Add Beat to NFT'}
        </button>
        <button
          className="rounded-md bg-indigo-600 px-2 py-2 md:px-5 md:hover:scale-105"
          onClick={() => prop.onHandleMuteClicked(!prop.isAllBeatsMuted)}
        >
          {prop.isAllBeatsMuted ? 'Unmute Beats' : 'Mute Beats'}
        </button>
      </div>
    </div>
  );
};

export default Upload;
