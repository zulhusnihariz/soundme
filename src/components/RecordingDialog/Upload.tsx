import { useIpfs } from 'hooks/use-ipfs'
import { useEffect, useState } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { add_beat } from '_aqua/music'

interface UploadProp {
  audioData: any
  dataKey: String
  onHandlePlayClicked: () => void
  onHandleStopClicked: () => void
  onHandleRecordClicked: () => any
  onHandleConfirmClicked: () => void
}

const Upload = (prop: UploadProp) => {
  const [audioUrl, setAudioUrl] = useState('')

  const ipfs = useIpfs()
  const { address } = useAccount()

  const { signMessage } = useSignMessage({
    onSuccess(signature) {
      add_new_beat(signature)
    },
  })

  const add_to_nft = async () => {
    try {
      const resp = await ipfs.add(prop.audioData.blob)
      const url = `${process.env.NEXT_PUBLIC_IPFS_BEAT_STORAGE_URL}/${resp.path}`
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
    console.log(prop.dataKey.toString(), address, audioUrl, signature)
    add_beat(prop.dataKey.toString(), address, audioUrl, signature)
    prop.onHandleConfirmClicked()
  }

  return (
    <div className="mt-4 text-center">
      <div>
        <button className="mx-3 bg-indigo-600 px-5 py-3" onClick={prop.onHandlePlayClicked}>
          Play
        </button>
        <button className="mx-3 bg-indigo-600 px-5 py-3" onClick={prop.onHandleStopClicked}>
          Stop
        </button>
      </div>
      <button className="mx-3 bg-indigo-600 px-5 py-3" onClick={prop.onHandleRecordClicked}>
        Recording again
      </button>
      <button className="bg-red-600 px-5 py-3" onClick={() => add_to_nft()}>
        Add to NFT
      </button>
    </div>
  )
}

export default Upload
