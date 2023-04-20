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
  const [playerState, setPlayerState] = useState<{ [key: string]: PlayerState }>({})
  const [mixedAudioNode, setMixedAudioNode] = useState<{ [key: string]: AudioBufferSourceNode }>({})
  const [mixedAudio, setMixedAudio] = useState<{ [key: string]: AudioBuffer }>({})

  const onHandleRecordClicked = tokenId => {
    setSelectedToken({
      tokenId: tokenId,
      dataKey: tokenId,
    })
  }

  const updatePlayerState = (dataKey: string, state: PlayerState) => {
    setPlayerState(prev => ({
      ...prev,
      [dataKey]: state,
    }))
  }

  const playMixedAudio = (dataKey: string, buffer: AudioBuffer) => {
    const mixed = audioContext.createBufferSource()
    setMixedAudioNode(prev => ({ ...prev, [dataKey]: mixed }))

    mixed.buffer = buffer
    mixed.connect(audioContext.destination)
    mixed.start()
    mixed.onended = () => {
      updatePlayerState(dataKey, PlayerState.PLAY)
      setMixedAudioNode(prev => ({ ...prev, [dataKey]: null }))
    }

    updatePlayerState(dataKey, PlayerState.STOP)
  }

  const onPlayButtonClicked = async (dataKey: string) => {
    updatePlayerState(dataKey, PlayerState.LOADING)

    const audioExists = mixedAudio[dataKey]

    if (audioExists) {
      playMixedAudio(dataKey, audioExists)
      return
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_LINEAGE_NODE_URL}metadata/${dataKey}`)
    let metadata = await res.json()

    const urls = Object.values(metadata) as string[]

    if (urls.length <= 0) {
      updatePlayerState(dataKey, PlayerState.PLAY)
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

    playMixedAudio(dataKey, mixed)

    setMixedAudio(prev => ({
      ...prev,
      [dataKey]: mixed,
    }))
  }
  const onStopButtonClicked = (dataKey: string) => {
    const nodeExists = mixedAudioNode[dataKey]
    if (!nodeExists) return

    nodeExists.playbackRate.value = 0 // pause
    updatePlayerState(dataKey, PlayerState.PLAY)
  }

  const playerButtonHandler = async (dataKey: string) => {
    const isFirstPlay = playerState[dataKey] === undefined

    if (isFirstPlay) {
      onPlayButtonClicked(dataKey)
      return
    }

    switch (playerState[dataKey]) {
      case PlayerState.STOP:
        onStopButtonClicked(dataKey)
        break
      case PlayerState.PLAY:
        const nodeExists = mixedAudioNode[dataKey]

        if (nodeExists) {
          nodeExists.playbackRate.value = 1 // resume
          updatePlayerState(dataKey, PlayerState.STOP)
        } else {
          onPlayButtonClicked(dataKey)
        }

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
      const forkeds = await get_sheets({ first: page_size, skip: 0, where: { from: address } })

      setForkedSheets(forkedSheets.concat(forkeds))
      setSheets(sheets.concat(all))
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
                  audioState={playerState}
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
                  audioState={playerState}
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
