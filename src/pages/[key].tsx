import Waveform from 'components/Waveform'
import { AudioState, PlayerState, SelectedAudio } from 'lib'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import RecordingDialog from 'components/RecordingDialog'
import MintButton from 'components/MintButton'
import ForkDialog from 'components/ForkDialog'
import ShareDialog from 'components/ShareDialog'
import Image from 'next/image'
import { JSONIcon, ShareIcon } from 'components/Icons/icons'
import LoadingIndicator from 'components/LoadingIndicator'

const SingleMusic = () => {
  const router = useRouter()

  const [dataKey, setDataKey] = useState('')
  const [tokenId, setTokenId] = useState('')

  const [data, setData] = useState(null)
  const [isLoad, setIsLoad] = useState(false)
  const [filteredData, setFilteredData] = useState<Array<AudioState>>([])
  const [forkData, setForkData] = useState<Array<SelectedAudio>>([])
  const [isForking, setIsForking] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const [isDialogRecordingOpened, setIsDialogRecordingOpened] = useState(false)
  const [isDialogForkOpened, setIsDialogForkOpened] = useState(false)
  const [isShareDialogShow, setIsShareDialogShow] = useState(false)
  const [canRecord, setCanRecord] = useState(false)

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

      if (filtered.length > 10) {
        setCanRecord(false)
      } else {
        setCanRecord(true)
      }
    }
  }, [isLoad, data, canRecord])

  useEffect(() => {
    const load = async () => {
      try {
        const d = await fetch(`${process.env.NEXT_PUBLIC_LINEAGE_NODE_URL}metadata/${dataKey}`)
        const j = await d.json()
        setData(j)
      } catch (e) {
        console.log(e)
      }
    }

    if (data == null && dataKey) {
      load()
    }
  }, [dataKey, data, router])

  useEffect(() => {
    if (!dataKey && !tokenId) {
      let regex = new RegExp('.{1,' + 64 + '}', 'g')
      let result = router.query.key.toString().match(regex)

      setDataKey(result[0])
      setTokenId(result[1])
    }
  }, [router, dataKey, tokenId])

  const setAllState = (state: PlayerState) => {
    const data = filteredData.map(audio => {
      return { ...audio, playerState: state }
    })

    setFilteredData(data)

    if (state === PlayerState.PLAY) setIsPlaying(true)
    if (state === PlayerState.STOP) setIsPlaying(false)
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
    window.open(`${process.env.NEXT_PUBLIC_LINEAGE_NODE_URL}metadata/${dataKey}`, '_blank')
  }
  const onHandleDialogClosed = () => {
    setTimeout(() => {
      setData(null)
      setFilteredData([])
      setIsLoad(false)
      setIsDialogRecordingOpened(!isDialogRecordingOpened)
    }, 3000)
  }

  const toggleForkingMode = () => {
    setIsForking(!isForking)

    if (isForking) {
      resetAllSelection()
    } else {
      setAllMuted(true)
    }
  }

  const fork = () => {
    const selections = []

    filteredData.forEach(audio => {
      if (audio.selected) {
        selections.push({
          owner: audio.key,
          data_key: dataKey,
          cid: audio.data,
        } as SelectedAudio)
      }
    })

    setForkData(selections)
  }

  return (
    <>
      <div className="px-2 pb-5">
        <div className="fixed bottom-0 left-0 mb-5 flex w-full items-center justify-center">
          <div className="flex items-center justify-between rounded-xl bg-gray-700 p-2">
            {!isPlaying ? (
              <button
                className="mr-2 rounded-xl px-8 py-3 text-black text-black hover:bg-[#1C1C1C]"
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
            ) : (
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
            )}

            {!isForking && canRecord && (
              <button
                className="from-20% mr-2 inline-block min-w-[8rem] rounded-xl bg-gradient-to-t from-[#7224A7] to-[#FF3065] px-8 py-3  font-bold text-white md:hover:scale-105"
                onClick={() => setIsDialogRecordingOpened(!isDialogRecordingOpened)}
              >
                Record
              </button>
            )}

            {isForking && (
              <button
                className="from-20% mr-2 min-w-[8rem] rounded-xl bg-gradient-to-t from-[#F5517B] to-[#FEDC00] px-8 py-3 font-bold text-white md:hover:scale-105"
                onClick={() => {
                  fork()
                  setIsDialogForkOpened(true)
                }}
              >
                Fork
              </button>
            )}
          </div>
        </div>
        {dataKey && tokenId && (
          <div className="flex items-center justify-between py-5">
            <div className="flex gap-2">
              {tokenId && <MintButton tokenId={tokenId} />}

              {isForking ? (
                <button
                  className={`flex h-20 w-20 flex-col items-center justify-center rounded-sm bg-red-500 p-2 text-xs font-bold text-white md:hover:scale-105`}
                  onClick={() => toggleForkingMode()}
                >
                  <span> Cancel</span>
                </button>
              ) : (
                <button
                  className={`from-20% flex h-20 w-20 flex-col items-center justify-center rounded-sm bg-gradient-to-t from-[#F5517B] to-[#FEDC00] p-2 text-xs font-bold text-white md:hover:scale-105`}
                  onClick={() => toggleForkingMode()}
                >
                  <Image className="mb-1" src="/assets/fork-icon.png" height={20} width={20} alt="fork icon" />
                  <span>Fork</span>
                  <span>This Beat</span>
                </button>
              )}
            </div>
            <div className="inline-block">
              <button className="mr-2 bg-green-100 p-3" onClick={onHandleCheckMetadata}>
                <JSONIcon />
              </button>
              <button className="bg-green-300 p-3 text-black" onClick={() => setIsShareDialogShow(true)}>
                <ShareIcon />
              </button>
            </div>
          </div>
        )}
        <div className="w-full">
          {filteredData.length > 0 ? (
            filteredData.map((audioState, key) => {
              if (audioState.data) {
                return (
                  <div key={key} className="border-1 m-1 h-[80px] rounded bg-white p-2 text-left">
                    <div className="whitespace-nowrap rounded-full bg-purple-100 px-1 py-0.5 text-xs text-black md:text-sm">
                      {audioState.key.toString()}
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
            })
          ) : (
            <LoadingIndicator text={'Fetching data...'} />
          )}
        </div>
      </div>
      {isDialogRecordingOpened && (
        <RecordingDialog
          dataKey={dataKey}
          tokenId={tokenId}
          isOpened={isDialogRecordingOpened}
          onDialogClosed={() => onHandleDialogClosed()}
          setAllMuted={muted => setAllMuted(muted)}
          setAllState={state => setAllState(state)}
        />
      )}
      {isDialogForkOpened && (
        <ForkDialog
          tokenId={tokenId}
          dataKey={dataKey}
          isOpened={isDialogForkOpened}
          selectedAudios={forkData}
          onDialogClosed={() => setIsDialogForkOpened(false)}
        />
      )}
      {isShareDialogShow && <ShareDialog dataKey={dataKey} onHandleCloseClicked={() => setIsShareDialogShow(false)} />}
    </>
  )
}

export default SingleMusic
