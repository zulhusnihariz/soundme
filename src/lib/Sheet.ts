export interface Sheet {
  beats: Beat[]
  cid: String
  data_key: String
  owner: String
}

interface Beat {
  cid: String
  data_key: String
  owner: String
}
