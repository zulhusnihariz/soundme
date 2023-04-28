import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from 'wagmi'
import { ethers, BigNumber } from 'ethers'

interface ConfirmButton {
  tokenId: String
  onBookmarkSuccess: any
}

const ConfirmButton = ({ tokenId, onBookmarkSuccess }: ConfirmButton) => {
  // logic same as MintButton/index.tsx component
  const { config } = usePrepareContractWrite({
    address: process.env.NEXT_PUBLIC_COLLABEAT as any,
    abi: [
      {
        inputs: [
          { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
          { internalType: 'uint32', name: 'amount', type: 'uint32' },
        ],
        name: 'mint',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
      },
    ],
    functionName: 'mint',
    args: [BigNumber.from(tokenId), 1],
    overrides: {
      value: ethers.utils.parseUnits('0.015', 'ether'),
    },
    onError(error) {
      console.log('Error', error)
    },
  })

  const { data, write } = useContractWrite(config)

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess: () => {
      onBookmarkSuccess()
    },
  })

  return (
    <button className="mr-2 bg-green-500 px-5 py-3 text-black" onClick={() => write?.()}>
      Confirm
    </button>
  )
}

export default ConfirmButton
