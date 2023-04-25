import { useContractWrite, usePrepareContractWrite } from 'wagmi'
import { ethers, BigNumber } from 'ethers'
import Image from 'next/image'
import GradientButton from 'components/Button/GradientButton'
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
    <GradientButton from="[#a726f8]" to="[#ffdd00]" callback={write}>
      <Image className="mb-1 " src="/assets/plus-icon.png" height={20} width={20} alt="plus icon" />
      <span>Bookmark</span>
      <span>Beat</span>
    </GradientButton>
  )
}

export default MintButton
