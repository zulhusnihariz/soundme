import MusicCard from 'components/MusicCard'
import NewSheetButton from 'components/NewSheetButton'
import SignPopup, { TokenProp } from 'components/SignPopup'
import { useFluence } from 'hooks/use-fluence'
import { useIpfs } from 'hooks/use-ipfs'
import { useEffect, useState } from 'react'
import styles from 'styles/Home.module.scss'
import { usePrepareContractWrite } from 'wagmi'

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
    tokenId: -1,
    tokenKey: '',
  })

  return (
    <>
      <NewSheetButton />
      <main className={styles.main + ' space-y-6'}>
        <div>
          {musics.map(music => (
            <MusicCard
              key={music.tokenId}
              name={music.name}
              description={music.description}
              handleClick={() =>
                setSelectedToken({
                  tokenId: music.tokenId,
                  tokenKey: music.token_key,
                })
              }
            />
          ))}
        </div>
        {selectedToken.tokenId > -1 && (
          <SignPopup
            token={selectedToken as any}
            handleCancel={() =>
              setSelectedToken({
                tokenId: -1,
                tokenKey: '',
              })
            }
          />
        )}
      </main>
    </>
  )
}

// function SignMsg() {
//   const [msg, setMsg] = useState('Dapp Starter')
//   const { data, isError, isLoading, isSuccess, signMessage } = useSignMessage({
//     message: msg,
//   })
//   const signMsg = () => {
//     if (msg) {
//       signMessage()
//     }
//   }

//   return (
//     <>
//       <p>
//         <input value={msg} onChange={e => setMsg(e.target.value)} className="rounded-lg p-1" />
//         <button
//           disabled={isLoading}
//           onClick={() => signMsg()}
//           className="ml-1 rounded-lg bg-blue-500 py-1 px-2 text-white transition-all duration-150 hover:scale-105"
//         >
//           Sign
//         </button>
//       </p>
//       <p>
//         {isSuccess && <span>Signature: {data}</span>}
//         {isError && <span>Error signing message</span>}
//       </p>
//     </>
//   )
// }
