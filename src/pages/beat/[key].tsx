import Waveform from 'components/Waveform'
import { AudioState, PlayerState, SelectedAudio } from 'lib'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import RecordingDialog from 'components/RecordingDialog'
import MintButton from 'components/MintButton'
import ForkDialog from 'components/ForkDialog'

const SingleMusic = () => {
  const router = useRouter()

  const [data, setData] = useState(null)
  const [isLoad, setIsLoad] = useState(false)
  const [filteredData, setFilteredData] = useState<Array<AudioState>>([])
  const [forkData, setForkData] = useState<Array<SelectedAudio>>([])
  const [selectedToken, setSelectedToken] = useState({
    tokenId: router.query.key,
    dataKey: '',
  })
  const [isForking, setIsForking] = useState(false)

  const [isDialogRecordingOpened, setIsDialogRecordingOpened] = useState(false)
  const [isDialogForkOpened, setIsDialogForkOpened] = useState(false)

  useEffect(() => {
    if (data && !isLoad) {
      const filtered = []
      for (const key in data) {
        if (key.toLowerCase().startsWith('0x')) {
          filtered.push({
            key,
            data: data[key],
            isMuted: false,
            playerState: PlayerState.STOP,
          } as AudioState)
        }
      }
      setFilteredData(filtered)
      setIsLoad(true)
    }
  }, [isLoad, data])

  useEffect(() => {
    const load = async () => {
      try {
        const d = await fetch(`${process.env.NEXT_PUBLIC_LINEAGE_NODE_URL}/metadata/${router.query.key}`)
        const j = await d.json()
        setData(j)
      } catch (e) {
        console.log(e)
      }
    }

    if (!data) {
      load()
    }
  }, [data, router])

  const setAllState = (state: PlayerState) => {
    const data = filteredData.map(audio => {
      return { ...audio, playerState: state }
    })

    setFilteredData(data)
  }

  const setAllMuted = (muted: boolean) => {
    const data = filteredData.map(audio => {
      return { ...audio, isMuted: muted }
    })

    setFilteredData(data)
  }

  const resetAllSelection = () => {
    const data = filteredData.map(audio => {
      return { ...audio, selected: false, isMuted: false }
    })

    setFilteredData(data)
  }

  const onToggleSound = (state: AudioState) => {
    const index = filteredData.findIndex(item => item.key === state.key)
    const updatedData = [...filteredData]

    updatedData[index] = {
      ...updatedData[index],
      isMuted: !state.isMuted,
    }

    setFilteredData(updatedData)
  }

  const onToggleSelection = (state: AudioState) => {
    const index = filteredData.findIndex(item => item.key === state.key)
    const updatedData = [...filteredData]

    updatedData[index] = {
      ...updatedData[index],
      selected: !state.selected,
      isMuted: state.selected,
    }

    setFilteredData(updatedData)
  }

  const onHandleCheckMetadata = () => {
    window.open(`${process.env.NEXT_PUBLIC_LINEAGE_NODE_URL}/metadata/${router.query.key}`, '_blank')
  }
  const onHandleDialogClosed = () => {
    setData(null)
    setFilteredData([])
    setIsDialogRecordingOpened(!isDialogRecordingOpened)
  }

  const toggleForkingMode = () => {
    setIsForking(!isForking)

    if (isForking) {
      resetAllSelection()
    } else {
      setAllMuted(true)
    }

    // if (!isForking) {
    //   resetAllSelection()
    // }
  }

  const fork = () => {
    const selections = []

    filteredData.forEach(audio => {
      if (audio.selected) {
        selections.push({
          owner: audio.key,
          data_key: router.query.key,
          cid: audio.data,
        } as SelectedAudio)
      }
    })

    setForkData(selections)
  }

  return (
    <div className="">
      <div className="">
        <div className="fixed bottom-0 left-0 mb-5 flex w-full items-center justify-center">
          <div className="flex items-center justify-between rounded-xl bg-gray-700 p-2">
            <button
              className="mr-2 rounded-xl px-8 py-3 text-black hover:bg-[#1C1C1C]"
              onClick={() => setAllState(PlayerState.STOP)}
            >
              <svg fill="#00FF00" height="32px" width="32px" version="1.1" viewBox="0 0 32 32">
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                <g id="SVGRepo_iconCarrier">
                  <path d="M23,8H9C8.4,8,8,8.4,8,9v14c0,0.6,0.4,1,1,1h14c0.6,0,1-0.4,1-1V9C24,8.4,23.6,8,23,8z"></path>
                </g>
              </svg>
            </button>
            {!isForking && (
              <button
                className="mr-2 inline-block rounded-xl bg-red-500 px-8 py-3 text-white"
                onClick={() => setIsDialogRecordingOpened(!isDialogRecordingOpened)}
              >
                Record
              </button>
            )}

            {isForking && (
              <button
                className="mr-2 rounded-xl bg-yellow-400 px-8 py-3 text-black"
                onClick={() => {
                  fork()
                  setIsDialogForkOpened(true)
                }}
              >
                Fork
              </button>
            )}

            <button
              className="rounded-xl px-8 py-3 text-black text-black hover:bg-[#1C1C1C]"
              onClick={() => setAllState(PlayerState.PLAY)}
            >
              <svg fill="#00FF00" height="32px" width="32px" version="1.1" viewBox="0 0 32 32">
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                <g id="SVGRepo_iconCarrier">
                  <path d="M21.6,15.2l-9-7c-0.3-0.2-0.7-0.3-1.1-0.1C11.2,8.3,11,8.6,11,9v14c0,0.4,0.2,0.7,0.6,0.9C11.7,24,11.9,24,12,24 c0.2,0,0.4-0.1,0.6-0.2l9-7c0.2-0.2,0.4-0.5,0.4-0.8S21.9,15.4,21.6,15.2z"></path>{' '}
                </g>
              </svg>
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between py-5">
          <div>
            <MintButton tokenId={router.query.key.toString()} />
            {isForking ? (
              <button className="bg-red-500 px-5 py-3 text-white" onClick={() => toggleForkingMode()}>
                Cancel
              </button>
            ) : (
              <button className="bg-yellow-300 px-5 py-3 text-black" onClick={() => toggleForkingMode()}>
                Fork This
              </button>
            )}
          </div>
          <button className="rounded-md p-3 hover:rounded-full">
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
          {/* <div className="inline-block">
            <h1 className="text-xl font-bold">{rawData.name}</h1>
            <button className="font-sm mr-2 rounded-md bg-green-700 px-8 py-2">Metadata</button>
          </div> */}
        </div>
        <div className="w-full">
          {filteredData.map((audioState, key) => {
            if (audioState.data) {
              return (
                <div key={key} className="border-1 m-1 h-[80px] rounded bg-white p-2 text-left">
                  <div className="font-sm inline-block whitespace-nowrap rounded-full bg-purple-100 px-2.5 py-0.5 text-sm text-black">
                    {audioState.key}
                  </div>
                  <div className="h-1/2 w-full">
                    <Waveform
                      url={audioState.data as string}
                      playerState={audioState.playerState}
                      isMuted={audioState.isMuted}
                      onToggleSound={() => onToggleSound(audioState)}
                      isSelecting={isForking}
                      isSelected={audioState.selected}
                      onSelectButtonClicked={() => onToggleSelection(audioState)}
                    />
                  </div>
                </div>
              )
            }
          })}
        </div>
      </div>
      {isDialogRecordingOpened && (
        <RecordingDialog
          dataKey={selectedToken.dataKey}
          isOpened={isDialogRecordingOpened}
          onDialogClosed={() => onHandleDialogClosed()}
        />
      )}
      {isDialogForkOpened && (
        <ForkDialog
          tokenId={router.query.key.toString()}
          dataKey={router.query.key.toString()}
          isOpened={isDialogForkOpened}
          selectedAudios={forkData}
          onDialogClosed={() => setIsDialogForkOpened(false)}
        />
      )}
    </div>
  )
}

export default SingleMusic
