import MusicCard from 'components/MusicCard'
import { useEffect, useState } from 'react'
import ShareDialog from 'components/ShareDialog'
import { get_sheets } from '_aqua/music'
import { Sheet } from 'lib'
import LoadingIndicator from 'components/LoadingIndicator'
import { useRouter } from 'next/router'
import { RefreshIcon } from 'components/Icons/icons'

export default function MusicCollection() {
  const router = useRouter()

  const [selectedToken, setSelectedToken] = useState({
    tokenId: '',
    dataKey: '',
  })

  const [shareDialogState, setShareDialogState] = useState({
    dataKey: '',
    opened: false,
  })

  const [sheets, setSheets] = useState<Sheet[]>([])

  const [currentPage, setCurrentPage] = useState<number>(1)
  const [paginatedSheets, setPaginatedSheets] = useState<Sheet[]>([])
  const [refresh, setRefresh] = useState(false)

  const onHandleRecordClicked = tokenId => {
    setSelectedToken({
      tokenId: tokenId,
      dataKey: tokenId,
    })
  }

  function paginate(array: any[], page_size, page_number) {
    // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
    return array.slice((page_number - 1) * page_size, page_number * page_size)
  }

  function handleMoreSheets() {
    setCurrentPage(prev => prev + 1)
    setRefresh(true)
  }

  function handleRefreshSheets() {
    router.reload()
  }

  useEffect(() => {
    const get = async () => {
      let sheets = await get_sheets({ ttl: 60000 })

      setSheets(sheets)
      setPaginatedSheets(paginate(sheets, 9, currentPage))
    }

    if (sheets.length <= 0) get()
  }, [])

  useEffect(() => {
    const page_size = 9

    let moreSheets = paginate(sheets, page_size, currentPage)
    setPaginatedSheets(paginatedSheets.concat(moreSheets))
  }, [currentPage])

  return (
    <div className="m-5">
      <main className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
        {/* <h1 className="Inter mb-4 text-left text-3xl font-bold text-white">Musics</h1> */}

        {paginatedSheets.map((sheet, index) => (
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

        {paginatedSheets.length > 0 ? (
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
