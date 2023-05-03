import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import { Sheet } from 'lib'
import { solidityKeccak256 } from 'ethers/lib/utils.js'

export const client = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_COLLABEAT_SUBGRAPH_API_URL,
  cache: new InMemoryCache(),
})

type MintedNft = {
  data: string
  id: string
  to: string
  tokenId: string
  transactionHash: string
}

const collabeat_utility_query = `
query Forkeds($first: Int, $skip: Int, $where: Forked_filter) {
  forkeds(first: $first, skip: $skip, where: $where) {
    id
    owner: from
    token_id: tokenId
    data_key: dataKey
  }
}
`
const collabeat_nft_query = `
query Minteds($first: Int, $skip: Int, $where: CollaBeatNftMinted_filter) {
  collaBeatNftMinteds(first: $first, skip: $skip, where: $where) {
    id
    data
    to
    tokenId
  }
}
`
const format = (minted: MintedNft) => {
  try {
    const contract_address = process.env.NEXT_PUBLIC_COLLABEAT_NFT.toLowerCase()
    const tokenId = minted.tokenId
    const chainId = process.env.NEXT_PUBLIC_CHAIN_ID
    const nonce = process.env.NEXT_PUBLIC_NONCE

    let input = contract_address + tokenId + chainId + nonce
    const data_key = solidityKeccak256(['string'], [input]).substring(2) // substring to remove "0x"

    return { id: minted.id, data_key: data_key, token_id: minted.tokenId, owner: minted.to }
  } catch (e) {}

  return null
}

export const get_sheets = async (variables: {
  first: number
  skip?: number
  where?: { to?: string; from: string }
}) => {
  const { data } = await client.query({ query: gql(collabeat_utility_query), variables })
  return { beats: data.forkeds } as { beats: Sheet[] }
}

export const get_bookmarked_sheets = async (variables: { first: number; skip?: number; where?: { to: string } }) => {
  const { data } = await client.query({ query: gql(collabeat_nft_query), variables })

  const formatted = data.collaBeatNftMinteds
    .map((nft: MintedNft) => {
      let formatted = format(nft)
      if (formatted !== null) return formatted
    })
    .filter(item => item !== undefined)

  const uniqueBeats = formatted.filter(
    (obj: Sheet, index: number, self: Sheet[]) => index === self.findIndex(t => t.token_id === obj.token_id)
  )

  return { beats: uniqueBeats } as { beats: Sheet[] }
}
