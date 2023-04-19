import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import { Sheet } from 'lib'

export const client = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_COLLABEAT_SUBGRAPH_API_URL,
  cache: new InMemoryCache(),
})

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
export const get_sheets = async (variables: { first: number; skip?: number; where?: {} }) => {
  const { data } = await client.query({ query: gql(query), variables })

  return data.forkeds as Sheet[]
}
