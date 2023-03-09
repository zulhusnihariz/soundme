import MusicCard from 'components/MusicCard'
import { useEffect, useState } from 'react'
import ShareDialog from 'components/ShareDialog'
import { get_sheets } from '_aqua/music'
import { Sheet } from 'lib'

export default function MusicCollection() {
  const [selectedToken, setSelectedToken] = useState({
    tokenId: '',
    dataKey: '',
  })

  const [shareDialogState, setShareDialogState] = useState({
    dataKey: '',
    opened: false,
  })

  const [sheets, setSheets] = useState<Sheet[]>([])

  const onHandleRecordClicked = tokenId => {
    setSelectedToken({
      tokenId: tokenId,
      dataKey: tokenId,
    })
  }

  useEffect(() => {
    const get = async () => {
      let sheets = await get_sheets()
      console.log(sheets)
      setSheets(sheets)
    }

    if (sheets.length <= 0) {
      get()
    }
  }, [sheets])

  return (
    <div className="m-5">
      <main className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
        {/* <h1 className="Inter mb-4 text-left text-3xl font-bold text-white">Musics</h1> */}
        {sheets.map(sheet => (
          <MusicCard
            sheet={sheet}
            key={sheet.data_key.toString()}
            tokenId={sheet.data_key.toString()}
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
      </main>
    </div>
  )
}
