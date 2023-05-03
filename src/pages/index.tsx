import MusicCard from 'components/MusicCard'
import { useContext, useEffect, useState } from 'react'
import ShareDialog from 'components/ShareDialog'
import { get_bookmarked_sheets, get_sheets } from '../apollo-client'
import { PlayerState, Sheet } from 'lib'
import LoadingIndicator from 'components/LoadingIndicator'
import { useRouter } from 'next/router'
import { RefreshIcon } from 'components/Icons/icons'
import { isMobile } from 'react-device-detect'
import { useAccount } from 'wagmi'
import { getSongLength, mixAudioBuffer } from 'utils/audio-web-api'
import MintDialog from 'components/MintDialog'
import { AlertMessageContext } from 'hooks/use-alert-message'

enum CURRENT_SECTION {
  ALL,
  FRESH,
  BOOKMARKED,
}

export default function MusicCollection() {
  let { address } = useAccount()
  const { showError } = useContext(AlertMessageContext)

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

  const [isFetching, setIsFetching] = useState(true)
  const [isDialogMintOpened, setIsDialogMintOpened] = useState(false)
  const [beatToBookmark, setBeatToBookmark] = useState({ tokenId: '', owner: '' })

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

  const onHandleMintClicked = data => {
    if (!address) {
      showError('Connect your wallet to bookmark this beat')
      return
    }

    setBeatToBookmark(data)
    setIsDialogMintOpened(true)
  }

  const onHandleMintDialogClosed = () => {
    setBeatToBookmark(null)
    setIsDialogMintOpened(false)
  }

  const updatePlayerState = (dataKey: string, state: PlayerState) => {
    setAudioPlayerState(prev => ({
      ...prev,
      [dataKey]: state,
    }))
  }

  const createMixedAudio = async (dataKey: string) => {
    updatePlayerState(dataKey, PlayerState.LOADING)

    const res = await fetch(`${process.env.NEXT_PUBLIC_LINEAGE_NODE_URL}metadata/${dataKey}`)
    let metadata = await res.json()

    const urls = []
    for (const [key, value] of Object.entries(metadata)) {
      if (key.startsWith('0x')) urls.push(value)
    }

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
      createMixedAudio(dataKey)
      return
    }

    switch (audioPlayerState[dataKey]) {
      case PlayerState.STOP:
        updatePlayerState(dataKey, PlayerState.PLAY)
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
    const getSheets = async () => {
      const isFirstPage = currentPage === 1
      const skip = isFirstPage ? 0 : page_size

      switch (currentSection) {
        case CURRENT_SECTION.ALL:
          const all = await get_sheets({ first: page_size, skip })
          setSheets(sheets.concat(all.beats))

          if (address) {
            const bookmarked = await get_bookmarked_sheets({
              first: page_size,
              skip,
              where: { to: address },
            })

            setForkedSheets(forkedSheets.concat(bookmarked.beats))
          }

          break
        case CURRENT_SECTION.BOOKMARKED:
          const bookmarked = await get_bookmarked_sheets({
            first: page_size,
            skip,
            where: { to: address },
          })

          setForkedSheets(forkedSheets.concat(bookmarked.beats))

          break
      }
      setIsFetching(false)
    }

    getSheets()
  }, [currentPage])

  return (
    <div className="m-5">
      <main>
        {isDialogMintOpened && (
          <MintDialog
            beat={beatToBookmark}
            isOpened={isDialogMintOpened}
            onDialogClosed={() => onHandleMintDialogClosed()}
          />
        )}

        {forkedSheets.length > 0 && !isFetching && (
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
                  onHandleMintClicked={data => onHandleMintClicked(data)}
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

        {sheets.length > 0 && !isFetching && currentSection !== CURRENT_SECTION.BOOKMARKED && (
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
                  onHandleMintClicked={data => onHandleMintClicked(data)}
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

        {!isFetching ? (
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
