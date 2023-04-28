import { useIpfs } from 'hooks/use-ipfs'
import { useContext, useEffect, useState } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { add_beat } from '_aqua/music'
import { PlayIcon, StopIcon } from 'components/Icons/icons'
import { AlertMessageContext } from 'hooks/use-alert-message'

interface UploadProp {
  audioData: any
  dataKey: String
  tokenId: String
  onHandlePlayClicked: () => void
  onHandleStopClicked: () => void
  onHandleRecordClicked: () => any
  onHandleConfirmClicked: () => void
  onHandleMuteClicked: (muted: boolean) => void
  isRecordedPlaying: boolean
  isAllBeatsMuted: boolean
}

const Upload = (prop: UploadProp) => {
  const [audioUrl, setAudioUrl] = useState('')

  const { ipfs } = useIpfs()
  const { address } = useAccount()

  const { signMessage } = useSignMessage({
    onSuccess(signature) {
      add_new_beat(signature)
    },
  })

  const { showError } = useContext(AlertMessageContext)

  const add_to_nft = async () => {
    if (!prop.audioData.blob) return

    if (!address) {
      showError('Connect your wallet to add beat to NFT')
      return
    }

    try {
      const resp = await ipfs.storeBlob(prop.audioData.blob)
      const url = `${process.env.NEXT_PUBLIC_IPFS_BEAT_STORAGE_URL}/${resp}`
      setAudioUrl(url)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    if (audioUrl) {
      signMessage({ message: audioUrl })
    }
  }, [audioUrl, signMessage])

  const add_new_beat = async signature => {
    console.log(
      prop.dataKey.toString(),
      process.env.NEXT_PUBLIC_TOKEN_KEY,
      prop.tokenId.toString(),
      '',
      address,
      signature,
      audioUrl
    )
    let x = await add_beat(
      prop.dataKey.toString(),
      process.env.NEXT_PUBLIC_TOKEN_KEY,
      prop.tokenId.toString(),
      '',
      address,
      signature,
      audioUrl
    )

    console.log(x)
    prop.onHandleConfirmClicked()
  }

  return (
    <div className="mt-4 flex flex-col items-center justify-center gap-4 text-center text-sm text-white md:text-lg">
      <div className="flex gap-2">
        {prop.isRecordedPlaying ? (
          <button
            className="rounded-md bg-indigo-600 py-2 px-2 md:px-5 md:hover:scale-105"
            onClick={prop.onHandleStopClicked}
          >
            <StopIcon />
          </button>
        ) : (
          <button
            className="rounded-md bg-indigo-600 py-2 px-2 md:px-5 md:hover:scale-105"
            onClick={prop.onHandlePlayClicked}
          >
            <PlayIcon />
          </button>
        )}

        <button
          className="from-20% rounded-md bg-gradient-to-t from-[#7224A7] to-[#FF3065] py-2 px-2 md:px-5 md:hover:scale-105"
          onClick={prop.onHandleRecordClicked}
        >
          Record again
        </button>
      </div>

      <div className="flex gap-2">
        <button className="rounded-md bg-red-600 py-2 px-2 md:px-5 md:hover:scale-105" onClick={() => add_to_nft()}>
          Add Beat to NFT
        </button>
        <button
          className="rounded-md bg-indigo-600 py-2 px-2 md:px-5 md:hover:scale-105"
          onClick={() => prop.onHandleMuteClicked(!prop.isAllBeatsMuted)}
        >
          {prop.isAllBeatsMuted ? 'Unmute Beats' : 'Mute Beats'}
        </button>
      </div>
    </div>
  )
}

export default Upload
