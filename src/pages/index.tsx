import MusicRow from 'components/MusicRow'
import MusicCard from 'components/MusicCard'
import NewSheetButton from 'components/MintButton/_index'
import SignPopup, { TokenProp } from 'components/SignPopup'
import { useFluence } from 'hooks/use-fluence'
import { useState } from 'react'
import ShareDialog from 'components/ShareDialog'

const musics = [
  {
    tokenId: 1,
    token_key: '1',
    name: 'music #1',
    owner: '0x244584678E6AE4363c8561e5f58Bd4938eD7c10D',
    description: '',
  },
  {
    tokenId: 2,
    token_key: '2',
    name: 'music #2',
    owner: '0x244584678E6AE4363c8561e5f58Bd4938eD7c10D',
    description: '',
  },
]

export default function MusicCollection() {
  const [selectedToken, setSelectedToken] = useState({
    tokenId: '',
    dataKey: '',
  })

  const [shareDialogState, setShareDialogState] = useState({
    tokenId: '',
    opened: false,
  })

  const onHandleRecordClicked = tokenId => {
    setSelectedToken({
      tokenId: tokenId,
      dataKey: tokenId,
    })
  }

  return (
    <>
      <main className="grid grid-cols-4 gap-4">
        {/* <h1 className="Inter mb-4 text-left text-3xl font-bold text-white">Musics</h1> */}
        {musics.map(music => (
          <MusicCard
            key={music.tokenId}
            tokenId={music.tokenId.toString()}
            name={music.name}
            description={music.description}
            audioUrls={[]}
            onHandleRecordClicked={onHandleRecordClicked}
            onHandleShareClicked={tokenId =>
              setShareDialogState({
                tokenId,
                opened: true,
              })
            }
          />
        ))}
        {shareDialogState.opened && (
          <ShareDialog
            tokenId={shareDialogState.tokenId}
            onHandleCloseClicked={() =>
              setShareDialogState({
                tokenId: '',
                opened: false,
              })
            }
          />
        )}
      </main>
    </>
  )
}
