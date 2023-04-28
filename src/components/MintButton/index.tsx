import { useContractWrite, usePrepareContractWrite } from 'wagmi'
import { ethers, BigNumber } from 'ethers'
import Image from 'next/image'

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
    args: [BigNumber.from(prop.tokenId), 1],
    overrides: {
      value: ethers.utils.parseUnits('0.015', 'ether'),
    },
    onError(error) {
      console.log('Error', error)
    },
  })

  const { data, write } = useContractWrite(config)

  return (
    <button
      className={`from-20% flex h-20 w-20 flex-col items-center justify-center rounded-sm bg-gradient-to-t from-[#A726F8] to-[#FFDD00] p-2 text-xs font-bold text-white md:hover:scale-105`}
      onClick={() => write?.()}
    >
      <Image className="mb-1 " src="/assets/plus-icon.png" height={20} width={20} alt="plus icon" />
      <span>Bookmark</span>
      <span>Beat</span>
    </button>
  )
}

export default MintButton
