import MintButtonDialog from 'components/MintButtonDialog'
import ShareButtonDialog from 'components/ShareDialog'
import voice from '../../assets/img/voice.png'
import mic from '../../assets/icon/mic.png'
import { SpectrumVisualizer, SpectrumVisualizerTheme } from 'react-audio-visualizers'
import RecordingDialog from 'components/RecordingDialog'
import Link from 'next/link'
import { Sheet } from 'lib'
import { useRouter } from 'next/router'

interface MusicCardProp {
  tokenId: String
  name: String
  description: String
  sheet: Sheet
  audioUrls: Array<string>
  onHandleRecordClicked: (tokenId) => void
  onHandleShareClicked: (datakey) => void
}

const MusicCard = (prop: MusicCardProp) => {
  const router = useRouter()

  return (
    <>
      <div className="bg-pink px-4 py-2 text-white sm:w-1/2 md:w-full">
        <div className="my-4">
          <p className="mb-1 text-left text-base font-semibold text-[#F6F8FF]">{`Collabeat #${prop.tokenId}`}</p>
          <p className="text-left text-xs text-[#F6F8FF]">
            <span className="text-[#FFE331]">{prop.sheet.owner}</span>
          </p>
        </div>
        <div className="z-10 flex items-center justify-between gap-2 py-2">
          <button
            onClick={e => router.push(`/${prop.sheet.data_key}${prop.sheet.token_id}`)}
            className="flex cursor-pointer flex-row items-center justify-center gap-2 rounded-3xl border border-[#232323] bg-black py-2 px-4"
          >
            <span>Collabeat</span>
          </button>
          <div className="flex flex-row gap-2">
            <MintButtonDialog tokenId={prop.tokenId} />
            <button
              className="rounded-full bg-black px-2"
              type="button"
              onClick={() => prop.onHandleShareClicked(prop.sheet.data_key)}
            >
              <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" stroke="#fff">
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                <g id="SVGRepo_iconCarrier">
                  <path
                    d="M9.42857 12.875L14.5714 16.8125M14.5714 7.625L9.42857 11.125M6 12.0357V11.9643C6 11.0175 6.76751 10.25 7.71429 10.25C8.66106 10.25 9.42857 11.0175 9.42857 11.9643V12.0357C9.42857 12.9825 8.66106 13.75 7.71429 13.75C6.76751 13.75 6 12.9825 6 12.0357ZM14.5714 6.78571V6.71429C14.5714 5.76751 15.3389 5 16.2857 5C17.2325 5 18 5.76751 18 6.71429V6.78571C18 7.73249 17.2325 8.5 16.2857 8.5C15.3389 8.5 14.5714 7.73249 14.5714 6.78571ZM14.5714 17.2857V17.2143C14.5714 16.2675 15.3389 15.5 16.2857 15.5C17.2325 15.5 18 16.2675 18 17.2143V17.2857C18 18.2325 17.2325 19 16.2857 19C15.3389 19 14.5714 18.2325 14.5714 17.2857Z"
                    stroke="#fff"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </g>
              </svg>
            </button>
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
