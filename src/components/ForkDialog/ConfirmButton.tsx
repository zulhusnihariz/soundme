import { LoadingSpinner } from 'components/Icons/icons'
import { ethers } from 'ethers'
import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from 'wagmi'

const ConfirmButton = ({ cid, onForkSuccess }) => {
  const { config } = usePrepareContractWrite({
    address: process.env.NEXT_PUBLIC_COLLABEAT as any,
    abi: [
      {
        inputs: [
          { internalType: 'string', name: 'name', type: 'string' },
          { internalType: 'string', name: 'ipfs_address', type: 'string' },
          { internalType: 'string', name: 'cid', type: 'string' },
        ],
        name: 'fork',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
      },
    ],
    functionName: 'fork',
    args: ['', process.env.NEXT_PUBLIC_IPFS_FORK_MULTIADDRESS, cid],
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
      onForkSuccess()
    },
  })

  return (
    <button className="mr-2 bg-green-500 px-5 py-3 text-black" disabled={isLoading} onClick={() => write?.()}>
      {isLoading ? <LoadingSpinner /> : 'Confirm'}
    </button>
  )
}

export default ConfirmButton
