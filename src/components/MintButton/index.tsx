import { useContractWrite, usePrepareContractWrite, useWaitForTransaction, useContractRead } from 'wagmi'
import BN from 'bn.js'
import { useEffect, useState } from 'react'
import GetTotalSupply from './GetTotalSupply'
import { ethers } from 'ethers'
interface MintProp {
  tokenId: String
}

const MintButton = (prop: MintProp) => {
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
    args: [new BN(1), 1],
    overrides: {
      value: ethers.utils.parseUnits('0.05', 'ether'),
    },
    onError(error) {
      console.log('Error', error)
    },
  })

  const { data, write } = useContractWrite(config)

  return (
    <button className="mr-2 bg-red-300 px-5 py-3 text-black" onClick={() => write?.()}>
      Mint (<GetTotalSupply tokenId={1} />)
    </button>
  )
}

export default MintButton
