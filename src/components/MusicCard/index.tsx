import MintButtonDialog from 'components/MintButtonDialog'
import ShareButtonDialog from 'components/ShareButtonDialog'
import voice from '../../assets/img/voice.png'
import mic from '../../assets/icon/mic.png'
import { SpectrumVisualizer, SpectrumVisualizerTheme } from 'react-audio-visualizers'
import RecordingDialog from 'components/RecordingDialog'

interface MusicCardProp {
  tokenId: String
  name: String
  description: String
  audioUrls: Array<string>
  onHandleRecordClicked: (tokenId) => void
}

const MusicCard = (prop: MusicCardProp) => {
  return (
    <>
      <div className="bg-pink Inter w-1/4 px-4 py-2 text-white">
        <div className="my-4">
          <p className="mb-1 text-left text-base font-semibold text-[#F6F8FF]">{`Collabeat #${prop.tokenId}`}</p>
          <p className="text-left text-xs font-medium text-[#F6F8FF]">
            Started by <span className="text-[#FFE331]">@username</span>
          </p>
        </div>
        <div className="z-10 mb-10 flex items-center justify-around gap-2">
          <button
            onClick={e => prop.onHandleRecordClicked(prop.tokenId)}
            className="flex cursor-pointer flex-row items-center justify-center gap-2 rounded-3xl border border-[#232323] bg-black py-2 px-4"
          >
            <span>Collabeat</span>
          </button>
          <div className="flex flex-row gap-2">
            <MintButtonDialog tokenId={prop.tokenId} />
            <ShareButtonDialog tokenId={prop.tokenId} />
          </div>
        </div>
        {/* <div className="z-1 fixed bottom-0 py-5">
          <SpectrumVisualizer
            audio="https://seedweb3.infura-ipfs.io/ipfs/Qmdc4hhF8S55JB7GBezS6PXs7bRrMibJDYUEnTkZs2Yk7J"
            theme={SpectrumVisualizerTheme.roundBars}
          />
        </div> */}
      </div>
    </>
  )
}

export default MusicCard
