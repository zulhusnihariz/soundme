import bigmic from '../../assets/icon/bigmic.png'
import voice1 from '../../assets/img/Vector.png'
import mute from '../../assets/icon/mute.png'
import { useRef, useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import classNames from 'classnames'
import Waveform from 'components/Waveform'
import { useCallback, useEffect } from 'react'
import { useAccount } from 'wagmi'
import Recording from './Recording'
import CountdownTimer from './CountDownTimer'
import StartRecording from './StartRecording'
import Upload from './Upload'

interface RecordingDialogProp {
  dataKey: String
  isOpened: boolean
  setIsOpened: (flag: boolean) => void
}

interface AudioState {
  key: String
  data: any
  isMuted: boolean
  playerState: PlayerState
}

export enum RecordingDialogState {
  START,
  COUNTDOWN,
  RECORD,
  UPLOAD,
  FINISH,
}

export enum PlayerState {
  STOP,
  PLAY,
  PAUSED,
}

const rawData = {
  'tokenId': 1,
  'token_key': '1',
  'name': 'music #1',
  'owner': '0x244584678E6AE4363c8561e5f58Bd4938eD7c10D',
  'image': '',
  'description':
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur placerat quam nec mauris efficitur elementum. Fusce sollicitudin consectetur sapien vel sagittis. Maecenas vestibulum diam blandit quam dictum egestas. Suspendisse potenti. Aliquam et venenatis mi, sed congue nulla. Cras ullamcorper dignissim suscipit. Maecenas eleifend pretium velit quis efficitur. Duis viverra, neque et interdum rutrum, nibh leo placerat mi, maximus finibus felis orci eu urna. Proin nec laoreet neque. Ut ex ligula, dignissim a lobortis eget, lacinia vel lacus. Nam ac risus non ligula finibus convallis. Integer est neque, tempus sit amet diam ac, imperdiet hendrerit ligula. Nulla at imperdiet sem. Duis nibh enim, placerat lacinia lacinia eu, ullamcorper nec mauris. Integer iaculis mollis ultrices. Suspendisse potenti.',
  '0x16716B9a49B607CDA90cC0a2eB997c3B3CDAe49c': '',
  '0x244584678E6AE4363c8561e5f58Bd4938eD7c10D': 'banjir',
  '0x64dBb406074d09f5a480ABDD12b37d4BbD2a4076':
    'https://seedweb3.infura-ipfs.io/ipfs/Qmdc4hhF8S55JB7GBezS6PXs7bRrMibJDYUEnTkZs2Yk7J',
  '0xCe2F68C1CfEA8748F56032F7601eE04715e165C0': '',
  '0xD014B065247EC977A2E94F128e3B33d73dD3EA02':
    'https://seedweb3.infura-ipfs.io/ipfs/QmQ7JWesgkf49HBFgQwBXHRw8M3erPbVM7QWXAA76cq9A1',
  '0xC8216a85b7Ac6F2279e11DAaE93FA3dAc9bd9b8A':
    'https://seedweb3.infura-ipfs.io/ipfs/QmPoRTH55jRRU3kiFrKctimkrJNyAWiD1ec6YoQ5KENcMp',
}

const RecordingDialog = (prop: RecordingDialogProp) => {
  const [state, setState] = useState<RecordingDialogState>(RecordingDialogState.START)
  const [audioData, setAudioData] = useState({
    blob: null,
    url: '',
  })
  const [filteredData, setFilteredData] = useState<Array<AudioState>>([])
  const { address } = useAccount()

  const onHandleRecordClicked = () => {
    setState(RecordingDialogState.COUNTDOWN)
  }

  const onHandleConfirmClicked = () => {
    prop.setIsOpened(!prop.isOpened)
  }

  const onRecordingFinished = () => {
    if (audioData) {
      setState(RecordingDialogState.UPLOAD)
    } else {
      setState(RecordingDialogState.START)
    }
  }

  useEffect(() => {
    const filtered = []
    for (const key in rawData) {
      if (key.toLowerCase().startsWith('0x')) {
        filtered.push({
          key,
          data: rawData[key],
          isMuted: false,
          playerState: PlayerState.STOP,
        } as AudioState)
      }
    }

    // the last items, is an empty state
    filtered.push({
      key: address,
      data: '',
      isMuted: false,
      playerState: PlayerState.STOP,
    })

    setFilteredData(filtered)
  }, [address])

  const changeAllState = (state: PlayerState) => {
    const data = filteredData.map(audio => {
      return { ...audio, playerState: state }
    })

    setFilteredData(data)
  }

  const changeState = (state: AudioState, player: PlayerState) => {
    const index = filteredData.findIndex(item => item.key === state.key)
    const updatedData = [...filteredData]

    updatedData[index] = {
      ...updatedData[index],
      playerState: player,
    }

    setFilteredData(updatedData)
  }

  const onToggleSound = (state: AudioState) => {
    const index = filteredData.findIndex(item => item.key === state.key)
    const updatedData = [...filteredData]

    updatedData[index] = {
      ...updatedData[index],
      isMuted: !state.isMuted,
    }

    setFilteredData(updatedData)
  }

  return (
    <>
      <div
        className={classNames('fixed inset-0 z-10 overflow-y-auto', {
          hidden: !prop.isOpened,
        })}
      >
        <div className="flex min-h-screen items-center justify-center px-4 py-4 pb-20 text-center sm:block sm:p-0">
          {/* <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-[#202020] bg-opacity-80" />
          </div> */}

          {/* <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true" /> */}

          <div className="border-gradient inline-block transform overflow-hidden rounded-md bg-[#DE296A] text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-7xl sm:align-middle">
            <div className="justify-between">
              <div className="">
                <div className="flex justify-between">
                  <div className="p-2">
                    <h1 className="text-xl font-bold">{rawData.name}</h1>
                    <h1 className="text-xs">{rawData.description}</h1>
                  </div>
                  <div className="p-3 text-white">
                    <XMarkIcon className="h-6 w-6 cursor-pointer" onClick={() => prop.setIsOpened(!prop.isOpened)} />
                  </div>
                </div>
                <div className="">
                  {filteredData.map((audioState, key) => {
                    if (audioState.data) {
                      return (
                        <div key={key} className="border-1 m-1 h-[80px] rounded bg-white p-2 text-left opacity-50">
                          <div className="font-sm inline-block whitespace-nowrap rounded-full bg-purple-100 px-2.5 py-0.5 text-sm text-black">
                            {audioState.key}
                          </div>
                          <div className="h-1/2 w-full">
                            <Waveform
                              url={audioState.data as string}
                              playerState={audioState.playerState}
                              isMuted={audioState.isMuted}
                              onToggleSound={() => onToggleSound(audioState)}
                            />
                          </div>
                        </div>
                      )
                    }
                  })}
                  <div className="border-1 m-1 h-[180px] rounded bg-black p-2 text-left">
                    <div className="font-sm absolute inline-block whitespace-nowrap rounded-full bg-purple-100 px-2.5 py-0.5 text-sm text-black">
                      {address}
                    </div>
                    <div className="flex h-full w-full items-center justify-center">
                      {state == RecordingDialogState.START && (
                        <StartRecording
                          onHandleStartRecordingClicked={() => setState(RecordingDialogState.COUNTDOWN)}
                        />
                      )}
                      {state === RecordingDialogState.COUNTDOWN && (
                        <CountdownTimer onCountdownFinish={() => setState(RecordingDialogState.RECORD)} />
                      )}
                      {state === RecordingDialogState.RECORD && (
                        <Recording
                          state={state}
                          onHandleStopRecordingClicked={() => onRecordingFinished()}
                          setAudioData={setAudioData}
                        />
                      )}
                      {state === RecordingDialogState.UPLOAD && (
                        <div className="w-full items-center justify-center">
                          {audioData.url && (
                            <Waveform
                              url={audioData.url as string}
                              playerState={filteredData[filteredData.length - 1].playerState}
                              isMuted={filteredData[filteredData.length - 1].isMuted}
                              onToggleSound={() => onToggleSound(filteredData[filteredData.length - 1])}
                            />
                          )}
                          <Upload
                            audioData={audioData}
                            dataKey={rawData.token_key}
                            onHandleConfirmClicked={() => onHandleConfirmClicked()}
                            onHandleRecordClicked={() => onHandleRecordClicked()}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex  grid grid-cols-4 items-center gap-4 bg-black p-4">
                  <button onClick={() => changeAllState(PlayerState.STOP)}>Stop</button>
                  <button onClick={() => changeAllState(PlayerState.PLAY)}>Play</button>
                  <button onClick={() => changeAllState(PlayerState.PAUSED)}>Pause</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* {!audioUrl && (
        <div className="relative">
          <div className="absolute left-[6.5rem] inline-block h-[93%] border-l-2 border-[#D45BFF]" />
          <div className="ml-auto h-16 w-[84.2%] bg-[#595959]" />
          <div className="flex w-full flex-col  items-center justify-center bg-black pt-2 pb-8 ">
            <div className="flex w-full flex-row items-center justify-end gap-x-2 pr-2">
              <p className="Inter text-sm font-medium text-[#CCCCCC]">Collaboration_1</p>
              <img src={mute.src} alt="Mute" className="h-auto w-6" />
            </div>

            <div className="box-shadow relative h-40 w-40 rounded-full bg-[#FF3535] py-2">
              <button type="button" onClick={handleStop}>
                <div className="absolute top-2 left-2 h-36 w-36 rounded-full border-4 border-black border-opacity-50 bg-[#FF3535] ">
                  <div className="flex w-full justify-center">
                    <img src={bigmic.src} alt="Mic" className="absolute top-[1.2rem] left-[2.1rem] h-auto w-16" />
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )} */}
    </>
  )
}

export default RecordingDialog
