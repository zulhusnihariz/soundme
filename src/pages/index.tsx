import MusicCard from 'components/MusicCard'
import { useEffect, useState } from 'react'
import ShareDialog from 'components/ShareDialog'
import { get_sheets } from '../apollo-client'
import { PlayerState, Sheet } from 'lib'
import LoadingIndicator from 'components/LoadingIndicator'
import { useRouter } from 'next/router'
import { RefreshIcon } from 'components/Icons/icons'
import { isMobile } from 'react-device-detect'
import { useAccount } from 'wagmi'
import { getSongLength, mixAudioBuffer } from 'utils/audio-web-api'

enum CURRENT_SECTION {
  ALL,
  FRESH,
  BOOKMARKED,
}

export default function MusicCollection() {
  let { address } = useAccount()
  // address = '0xc20de1a30487ec70fc730866f297f2e2f1e411f7' // uncomment to test bookmarked beats ui

  const router = useRouter()
  const page_size = isMobile ? 3 : 9

  const [selectedToken, setSelectedToken] = useState({
    tokenId: '',
    dataKey: '',
  })

  const [shareDialogState, setShareDialogState] = useState({
    dataKey: '',
    opened: false,
  })

  const [sheets, setSheets] = useState<Sheet[]>([])
  const [forkedSheets, setForkedSheets] = useState<Sheet[]>([])
  const [currentSection, setCurrentSection] = useState<CURRENT_SECTION>(CURRENT_SECTION.ALL)

  const [currentPage, setCurrentPage] = useState<number>(1)
  const [refresh, setRefresh] = useState(false)

  const [audioContext, setAudioContext] = useState(new AudioContext())
  const [audioPlayerState, setAudioPlayerState] = useState<{ [key: string]: PlayerState }>({})
  const [mixedAudio, setMixedAudio] = useState<{ [key: string]: AudioBuffer }>({})

  const onHandleRecordClicked = tokenId => {
    setSelectedToken({
      tokenId: tokenId,
      dataKey: tokenId,
    })
  }

  const updatePlayerState = (dataKey: string, state: PlayerState) => {
    setAudioPlayerState(prev => ({
      ...prev,
      [dataKey]: state,
    }))
  }

  const onPlayButtonClicked = async (dataKey: string) => {
    updatePlayerState(dataKey, PlayerState.LOADING)

    const res = await fetch(`${process.env.NEXT_PUBLIC_LINEAGE_NODE_URL}metadata/${dataKey}`)
    let metadata = await res.json()

    const urls = Object.values(metadata) as string[]

    if (urls.length <= 0) {
      updatePlayerState(dataKey, PlayerState.STOP)
      return
    }

    let promises = urls.map(url =>
      fetch(url)
        .then(response => response.arrayBuffer())
        .then(buffer => audioContext.decodeAudioData(buffer))
    )

    let buffers = await Promise.all(promises)

    const songLength = getSongLength(buffers)
    let mixed = mixAudioBuffer(buffers, songLength, 1, audioContext)

    updatePlayerState(dataKey, PlayerState.PLAY)

    setMixedAudio(prev => ({
      ...prev,
      [dataKey]: mixed,
    }))
  }

  const playerButtonHandler = async (dataKey: string) => {
    const isFirstPlay = audioPlayerState[dataKey] === undefined

    if (isFirstPlay) {
      onPlayButtonClicked(dataKey)
      return
    }

    switch (audioPlayerState[dataKey]) {
      case PlayerState.STOP:
        updatePlayerState(dataKey, PlayerState.PLAY)
      // wave current .stop
      case PlayerState.PLAY:
        updatePlayerState(dataKey, PlayerState.PAUSED)
        break
      case PlayerState.PAUSED:
        updatePlayerState(dataKey, PlayerState.PLAY)
        break
      default:
        break
    }
  }

  function handleMoreSheets() {
    setCurrentPage(prev => prev + 1)
    setRefresh(true)
  }

  function handleRefreshSheets() {
    router.reload()
  }

  useEffect(() => {
    const getInitialSheets = async () => {
      const all = await get_sheets({ first: page_size, skip: 0 })
      setSheets(sheets.concat(all))

      if (address) {
        const forkeds = await get_sheets({ first: page_size, skip: 0, where: { from: address } })
        setForkedSheets(forkedSheets.concat(forkeds))
      }
    }

    getInitialSheets()
  }, [])

  useEffect(() => {
    const getMoreSheets = async () => {
      switch (currentSection) {
        case CURRENT_SECTION.ALL:
          const all = await get_sheets({ first: page_size, skip: page_size })
          setSheets(sheets.concat(all))
          break
        case CURRENT_SECTION.BOOKMARKED:
          const forkeds = await get_sheets({ first: page_size, skip: page_size, where: { from: address } })
          setForkedSheets(forkedSheets.concat(forkeds))
          break
      }
    }

    getMoreSheets()
  }, [currentPage])

  return (
    <div className="m-5">
      <main>
        {sheets.length > 0 && currentSection !== CURRENT_SECTION.BOOKMARKED && (
          <section className="mb-4">
            <h1 className="Inter mb-4 text-left text-3xl font-bold text-white">Fresh beats</h1>

            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
              {sheets.map((sheet, index) => (
                <MusicCard
                  sheet={sheet}
                  key={index}
                  tokenId={sheet.token_id.toString()}
                  name={sheet.data_key.toString()}
                  description={''}
                  audioUrls={[]}
                  onHandleRecordClicked={onHandleRecordClicked}
                  onHandleShareClicked={dataKey =>
                    setShareDialogState({
                      dataKey,
                      opened: true,
                    })
                  }
                  onHandlePlayClicked={playerButtonHandler}
                  updatePlayerState={updatePlayerState}
                  audioState={audioPlayerState}
                  mixedAudio={mixedAudio[sheet.data_key.toString()]}
                />
              ))}
              {shareDialogState.opened && (
                <ShareDialog
                  dataKey={shareDialogState.dataKey}
                  onHandleCloseClicked={() =>
                    setShareDialogState({
                      dataKey: '',
                      opened: false,
                    })
                  }
                />
              )}
            </div>
          </section>
        )}

        {forkedSheets.length > 0 && (
          <section className="mb-4">
            <h1
              className="Inter mb-4 text-left text-3xl font-bold text-white"
              onClick={() => {
                setCurrentSection(CURRENT_SECTION.BOOKMARKED)
                setRefresh(false)
              }}
            >
              Bookmarked beats
            </h1>

            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
              {forkedSheets.map((sheet, index) => (
                <MusicCard
                  sheet={sheet}
                  key={index}
                  tokenId={sheet.token_id.toString()}
                  name={sheet.data_key.toString()}
                  description={''}
                  audioUrls={[]}
                  onHandleRecordClicked={onHandleRecordClicked}
                  onHandleShareClicked={dataKey =>
                    setShareDialogState({
                      dataKey,
                      opened: true,
                    })
                  }
                  onHandlePlayClicked={playerButtonHandler}
                  updatePlayerState={updatePlayerState}
                  audioState={audioPlayerState}
                  mixedAudio={mixedAudio[sheet.data_key.toString()]}
                />
              ))}
              {shareDialogState.opened && (
                <ShareDialog
                  dataKey={shareDialogState.dataKey}
                  onHandleCloseClicked={() =>
                    setShareDialogState({
                      dataKey: '',
                      opened: false,
                    })
                  }
                />
              )}
            </div>
          </section>
        )}

        {sheets.length > 0 ? (
          <button
            onClick={refresh ? handleRefreshSheets : handleMoreSheets}
            className="fixed inset-x-0 bottom-[15px] mx-auto flex w-28 cursor-pointer flex-row items-center justify-center rounded-3xl border border-[#232323] bg-black py-2 px-4"
          >
            {refresh ? <RefreshIcon /> : <span>More</span>}
          </button>
        ) : (
          <LoadingIndicator text={'Fetching data...'} />
        )}
      </main>
    </div>
  )
}
