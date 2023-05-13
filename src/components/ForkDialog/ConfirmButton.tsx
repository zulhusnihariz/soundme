import { LoadingSpinner } from 'components/Icons/icons'
import { ethers } from 'ethers'
import { AlertMessageContext } from 'hooks/use-alert-message'
import { useContext, useState } from 'react'
import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from 'wagmi'

const ConfirmButton = ({ cid, onForkSuccess }) => {
  const { showError } = useContext(AlertMessageContext)
  const [isLoading, setIsLoading] = useState<boolean>(false)

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

  const { data, writeAsync } = useContractWrite(config)

  const { isSuccess } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess: () => {
      onForkSuccess()
      setIsLoading(false)
    },
  })

  const onHandleConfirmClicked = async () => {
    setIsLoading(true)

    try {
      await writeAsync?.()
    } catch (e: unknown) {
      const error = e as Error
      showError(`${error.message}`)
      setIsLoading(false)
    }
  }

  return (
    <button
      className="mr-2 bg-green-500 px-5 py-3 text-black"
      disabled={isLoading}
      onClick={() => onHandleConfirmClicked()}
    >
      {isLoading ? <LoadingSpinner /> : 'Confirm'}
    </button>
  )
}

export default ConfirmButton
