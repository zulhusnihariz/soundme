import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import { Sheet } from 'lib'
import { AbiCoder } from 'ethers/lib/utils.js'

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

const query = `
query Forkeds($first: Int, $skip: Int, $where: Forked_filter) {
  forkeds(first: $first, skip: $skip, where: $where) {
    id
    owner: from
    token_id: tokenId
    data_key: dataKey
  }
}
`
const minted_query = `
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
  let eth = new AbiCoder()

  const types = ['string', 'bytes']

  try {
    let [data_key, bytes] = eth.decode(types, minted.data)
    return { id: minted.id, data_key, token_id: minted.tokenId, owner: minted.to }
  } catch (e) {}

  return null
}

export const get_sheets = async (variables: {
  first: number
  skip?: number
  where?: { to?: string; from: string }
}) => {
  const { data } = await client.query({ query: gql(query), variables })
  return { beats: data.forkeds } as { beats: Sheet[] }
}

export const get_bookmarked_sheets = async (variables: {
  first: number
  skip?: number
  where?: { to: string; from: string }
}) => {
  const { first, skip, where } = variables

  const where_from = { first, skip, where: { from: where.from } }
  const where_to = { first, skip, where: { to: where.to } }

  const forked_promise = client.query({ query: gql(query), variables: where_from })
  const minted_promise = client.query({ query: gql(minted_query), variables: where_to })

  let [forked, minted] = await Promise.all([forked_promise, minted_promise])

  let minted_data = minted.data
  let forked_data = forked.data

  const formatted_minteds = minted_data.collaBeatNftMinteds
    .map((nft: MintedNft) => {
      let formatted = format(nft)
      if (formatted !== null) return formatted
    })
    .filter(item => item !== undefined)

  const combined = forked_data.forkeds.concat(formatted_minteds)

  const uniqueBeats = combined.filter(
    (obj: Sheet, index: number, self: Sheet[]) => index === self.findIndex(t => t.token_id === obj.token_id)
  )

  return { beats: uniqueBeats } as { beats: Sheet[] }
}
