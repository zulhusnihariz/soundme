export interface Sheet {
  forked_beats: Beat[]
  cid: String
  data_key: String
  owner: String
  token_id: number
}

interface Beat {
  cid: String
  data_key: String
  owner: String
  token_id: number
}
