import { useFluence } from 'hooks/use-fluence'
import { useState } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { add_beat } from '_aqua/music'
export interface TokenProp {
  tokenId: number
  tokenKey: string
}

export default function SignPopup(props: { token: TokenProp; handleCancel: () => void }) {
  const { address } = useAccount()

  const fluence = useFluence()

  const [msg, setMsg] = useState('')
  const { data, isError, isLoading, isSuccess, signMessage } = useSignMessage({
    message: msg,
    onSuccess(signature) {
      add_new_beat(signature)
    },
  })

  const signMsg = async () => {
    if (msg) {
      signMessage()
    }
  }

  const add_new_beat = async signature => {
    console.log(props.token.tokenKey, address, msg, signature)
    add_beat(props.token.tokenKey.toString(), address, msg, signature)
    props.handleCancel()
  }

  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-lg sm:p-6 lg:p-8" role="alert">
      <div className="flex items-center gap-4">
        <span className="shrink-0 rounded-full bg-blue-400 p-2 text-white"></span>

        <p className="font-medium text-black sm:text-lg">New data!</p>
      </div>

      <p className="mt-4 text-gray-500">
        Add new data to dataKey (<b>{props.token.tokenKey}</b>) <br /> under {address}
      </p>

      <input value={msg} onChange={e => setMsg(e.target.value)} className="mt-3 rounded-lg p-1" />

      <div className="mt-6 sm:flex sm:gap-4">
        <a
          className="inline-block w-full rounded-lg bg-blue-500 px-5 py-3 text-center text-sm font-semibold text-white sm:w-auto"
          href="#"
          onClick={signMsg}
        >
          Add data
        </a>

        <a
          className="mt-2 inline-block w-full rounded-lg bg-gray-50 px-5 py-3 text-center text-sm font-semibold text-gray-500 sm:mt-0 sm:w-auto"
          href="#"
          onClick={props.handleCancel}
        >
          Cancel
        </a>
      </div>
    </div>
  )
}
