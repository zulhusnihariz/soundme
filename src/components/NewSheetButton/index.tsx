import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi'
import music_abi from '../../abis/music_utility.json'
import sha256 from 'crypto-js/sha256'
import BN from 'bn.js'
import { useIpfs } from 'hooks/use-ipfs'

export default function NewSheetButton() {
  const generate_metadata_uri = tokenId => {
    const address = '0xDc01e254b3FB0D34253d53De2B819Bfc7Fe5F610'
    const chainId = '5'
    const nonce = 0

    const dataKey = `${address}${tokenId}${chainId}${nonce}`
    return ` https://metadata.xfero.io/metadata/${sha256(dataKey)}`
  }

  const { config } = usePrepareContractWrite({
    address: '0xDc01e254b3FB0D34253d53De2B819Bfc7Fe5F610',
    abi: [
      {
        inputs: [
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
          { internalType: 'string', name: 'tokenURI', type: 'string' },
        ],
        name: 'mint',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
      },
    ],
    functionName: 'mint',
    args: [new BN(1), 'asd'],
  })

  const { data, write } = useContractWrite(config)

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })

  // TODO - Upload file
  // const ipfs = useIpfs()

  // const handleButton = async (buffer) => {
  //   console.log(await ipfs.add(buffer))
  // }

  return (
    <button
      className="inline-block rounded bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 p-[2px] hover:text-white focus:outline-none focus:ring active:text-opacity-75"
      // disabled={!write || !isLoading}
      onClick={() => write?.()}
      // onClick={handleButton}
    >
      <span className="block rounded-sm bg-transparent px-8 py-3 text-sm font-medium">
        {isLoading ? 'Creating sheet...' : 'New Sheet'}
      </span>
    </button>
  )
}
