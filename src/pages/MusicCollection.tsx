import MusicCard from 'components/MusicCard'
import NewSheetButton from 'components/NewSheetButton'
import SignPopup, { TokenProp } from 'components/SignPopup'
import { useFluence } from 'hooks/use-fluence'
import { useIpfs } from 'hooks/use-ipfs'
import styles from 'styles/Home.module.scss'
import { usePrepareContractWrite } from 'wagmi'

/* eslint-disable no-use-before-define */
import React, { useState, useRef, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { PlayIcon } from '@heroicons/react/24/solid'
import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import { LinearProgress } from '@material-ui/core'

import mic from '../assets/icon/mic.png'
import email from '../assets/icon/email.png'
import copy from '../assets/icon/copy.png'
import twitter from '../assets/icon/twitter.png'
import record from '../assets/icon/record.png'
import replay from '../assets/icon/replay.png'
import bigmic from '../assets/icon/bigmic.png'

import voice from '../assets/img/voice.png'
import voice2 from '../assets/img/voice2.png'
import voicelong from '../assets/img/voicelong.png'
import voice1 from '../assets/img/Vector.png'
import mute from '../assets/icon/mute.png'

import { useAccount, useSignMessage } from 'wagmi'
import { add_beat } from '_aqua/music'

export default function MusicCollection() {
  const [selectedToken, setSelectedToken] = useState({
    tokenId: -1,
    tokenKey: '',
  })

  const { address } = useAccount()

  const fluence = useFluence()

  const [msg, setMsg] = useState('')
  const { data, isError, isLoading, isSuccess, signMessage } = useSignMessage({
    message: msg,
    onSuccess(signature) {
      add_new_beat(signature)
    },
  })

  const add_new_beat = async signature => {
    console.log(selectedToken.tokenKey, address, msg, signature)
    add_beat(selectedToken.tokenKey.toString(), address, msg, signature)
    setTitle('Done! Collaboration has been updated.')
    // handleModalUploadClose()
  }

  // Countdown circle
  const renderTime = ({ remainingTime }) => {
    const currentTime = useRef(remainingTime)
    const prevTime = useRef(null)
    const isNewTimeFirstTick = useRef(false)
    const [, setOneLastRerender] = useState(0)

    if (currentTime.current !== remainingTime) {
      isNewTimeFirstTick.current = true
      prevTime.current = currentTime.current
      currentTime.current = remainingTime
    } else {
      isNewTimeFirstTick.current = false
    }

    // force one last re-render when the time is over to tirgger the last animation
    if (remainingTime === 0) {
      setTimeout(() => {
        setOneLastRerender(val => val + 1)
      }, 20)
      setRecording(true)
      handleRecord()
    }

    const isTimeUp = isNewTimeFirstTick.current

    return (
      <div className="time-wrapper">
        <div key={remainingTime} className={`time ${isTimeUp ? 'up' : ''}`}>
          {remainingTime}
        </div>
        {prevTime.current !== null && (
          <div key={prevTime.current} className={`time ${!isTimeUp ? 'down' : ''}`}>
            {prevTime.current}
          </div>
        )}
      </div>
    )
  }
  // End Countdown circle

  const [showRecord, setRecord] = useState(false)
  const [showMint, setMint] = useState(false)
  const [showShare, setShare] = useState(false)
  const [waitingForApproval, setWaitingForApproval] = useState(false)
  const [showUpload, setUpload] = useState(false)
  const [countdownEnded, setCountdownEnded] = useState(false)
  const [recording, setRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const [audioBlob, setAudioBlob] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [second, setSecond] = useState('00')
  const [minute, setMinute] = useState('00')
  const [hour, setHour] = useState('00')
  const [timer, setTimer] = useState(0)
  const [intervalId, setIntervalId] = useState(null)
  const [musics, setMusics] = useState([])

  const [title, setTitle] = useState('')

  const mediaRecorder = useRef(null)

  const handleRecordButtonClick = (id, key) => {
    setSelectedToken({
      tokenId: id,
      tokenKey: key,
    })
    setRecord(true)
  }
  // const handleModalRecordClose = () => {
  //   setRecord(false);
  // };

  // Mint Modal
  const handleMintButtonClick = () => {
    setMint(true)
  }
  const handleModalMintClose = () => {
    setMint(false)
  }

  // Share Modal
  const handleShareButtonClick = () => {
    setShare(true)
  }
  const handleModalShareClose = () => {
    setShare(false)
  }

  const handleConfirmButtonClick = () => {
    setWaitingForApproval(true)
  }

  // Upload modal
  const handleModalUploadClose = () => {
    setUpload(false)
    setUploadProgress(0)
    setCountdownEnded(false)
    setRecording(false)
    setAudioBlob(null)
    setAudioUrl(null)
    setSelectedToken({
      tokenId: -1,
      tokenKey: '',
    })
    setMsg('')
  }

  // Recording part
  const handleRecord = () => {
    // console.log('recording...')
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(stream => {
        mediaRecorder.current = new MediaRecorder(stream)
        mediaRecorder.current.start()

        setRecording(true)

        const chunks = []
        mediaRecorder.current.addEventListener('dataavailable', event => {
          chunks.push(event.data)
        })

        mediaRecorder.current.addEventListener('stop', () => {
          const blob = new Blob(chunks, { type: 'audio/mpeg' })
          const url = URL.createObjectURL(blob)
          // console.log('done')
          console.log(blob)
          setAudioBlob(blob)
          setAudioUrl(url)
        })
      })
      .catch(err => console.log(err))
  }

  const handleRerecord = () => {
    setCountdownEnded(false)
    setAudioBlob(null)
    setAudioUrl(null)
  }

  const handleStop = () => {
    mediaRecorder.current.stop()
    setRecording(false)

    setSecond('00')
    setMinute('00')
    setHour('00')

    setTimer(0)
  }

  const handleReplay = currUrl => {
    const audio = new Audio(currUrl)
    audio.play()
  }

  const ipfs = useIpfs()

  const handleUpload = async () => {
    // const id = setInterval(() => {
    //   setUploading(true)
    //   setRecord(false)
    //   setUpload(true)
    //   setUploadProgress(oldProgress => {
    //     setTitle('Saving your recording')
    //     const diff = Math.random() * 10
    //     return Math.min(oldProgress + diff, 100)
    //   })
    // }, 500)
    // setIntervalId(id)

    setUploading(true)
    setRecord(false)
    setUpload(true)
    setTitle('Saving your recording')
    try {
      const resp = await ipfs.add(audioBlob)
      const url = `https://seedweb3.infura-ipfs.io/ipfs/${resp.path}`
      // const url = 'ayam dan itik'
      // console.log(resp)
      console.log(url)
      setMsg(url)
    } catch (err) {
      console.log(err)
    }
  }

  const isValidUrl = urlString => {
    var urlPattern = new RegExp(
      '^(https?:\\/\\/)?' + // validate protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
        '(\\#[-a-z\\d_]*)?$',
      'i'
    ) // validate fragment locator
    return !!urlPattern.test(urlString)
  }

  useEffect(() => {
    const rawData = [
      {
        'tokenId': 1,
        'token_key': '1',
        'name': 'music #1',
        'owner': '0x244584678E6AE4363c8561e5f58Bd4938eD7c10D',
        'image': '',
        'description': '',
        '0x16716B9a49B607CDA90cC0a2eB997c3B3CDAe49c': '',
        '0x244584678E6AE4363c8561e5f58Bd4938eD7c10D': 'banjir',
        '0x64dBb406074d09f5a480ABDD12b37d4BbD2a4076':
          'https://seedweb3.infura-ipfs.io/ipfs/Qmdc4hhF8S55JB7GBezS6PXs7bRrMibJDYUEnTkZs2Yk7J',
        '0xCe2F68C1CfEA8748F56032F7601eE04715e165C0': '',
        '0xD014B065247EC977A2E94F128e3B33d73dD3EA02':
          'https://seedweb3.infura-ipfs.io/ipfs/QmQ7JWesgkf49HBFgQwBXHRw8M3erPbVM7QWXAA76cq9A1',
      },
      {
        'tokenId': 2,
        'token_key': '2',
        'name': 'music #2',
        'owner': '0x244584678E6AE4363c8561e5f58Bd4938eD7c10D',
        'image': '',
        'description': '',
        '0x16716B9a49B607CDA90cC0a2eB997c3B3CDAe49c': '',
        '0xD014B065247EC977A2E94F128e3B33d73dD3EA02': '',
      },
    ]
    const newMusics = []
    for (var i in rawData) {
      const currData = rawData[i]
      const currMusic = {}
      const audioUrls = []
      let beatAmount = 0
      for (var j of Object.keys(currData)) {
        switch (j) {
          case 'tokenId': {
            currMusic.tokenId = currData[j]
            break
          }
          case 'token_key': {
            currMusic.token_key = currData[j]
            break
          }
          case 'name': {
            currMusic.name = currData[j]
            break
          }
          case 'owner': {
            currMusic.owner = currData[j]
            break
          }
          case 'image': {
            currMusic.image = currData[j]
            break
          }
          case 'description': {
            currMusic.description = currData[j]
            break
          }
          default: {
            if (isValidUrl(currData[j])) {
              audioUrls.push(currData[j])
              beatAmount = beatAmount + 1
            }
            break
          }
        }
      }
      currMusic.audioUrls = audioUrls
      currMusic.beatAmount = beatAmount
      newMusics.push(currMusic)
    }
    setMusics(newMusics)
  }, [])

  useEffect(() => {
    if (msg) {
      signMessage()
    }
  }, [msg])

  // timestamp
  useEffect(() => {
    let intervalIdTime

    if (recording) {
      intervalIdTime = setInterval(() => {
        const secondCounter = timer % 60
        const minuteCounter = Math.floor(timer / 60)
        const hourCounter = Math.floor(timer / 3600)

        const computedSecond = String(secondCounter).length === 1 ? `0${secondCounter}` : secondCounter
        const computedMinute = String(minuteCounter).length === 1 ? `0${minuteCounter}` : minuteCounter
        const computedHour = String(hourCounter).length === 1 ? `0${hourCounter}` : hourCounter

        setSecond(computedSecond)
        setMinute(computedMinute)
        setHour(computedHour)

        setTimer(counter => counter + 1)
      }, 1000)
    }

    return () => clearInterval(intervalIdTime)
  }, [recording, timer])

  // Start recording after 3seconds
  useEffect(() => {
    let intervalIdRec
    if (recording) {
      intervalIdRec = setInterval(() => {
        setRecording(prevTime => prevTime + 1)
      }, 1000)
    } else {
      setRecording(0)
    }
    return () => clearInterval(intervalIdRec)
  }, [recording])

  // Uploading
  useEffect(() => {
    if (uploadProgress === 100 && intervalId) {
      clearInterval(intervalId)
      setTitle('Done! Collaboration has been updated.')
    }
  }, [uploadProgress, intervalId])

  return (
    <>
      <NewSheetButton />
      <main className={styles.main + ' space-y-6'}>
        <div>
          {musics.map(music => (
            <MusicCard
              key={music.tokenId}
              name={music.name}
              description={music.description}
              beatAmount={music.beatAmount}
              audioUrls={music.audioUrls}
              handleClick={() => handleRecordButtonClick(music.tokenId, music.token_key)}
            />
          ))}
        </div>
        {/* {selectedToken.tokenId > -1 && (
          <SignPopup
            token={selectedToken as any}
            handleCancel={() =>
              setSelectedToken({
                tokenId: -1,
                tokenKey: '',
              })
            }
          />
        )} */}
      </main>
      {/* Record Modal  */}
      {showRecord && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-[#202020] bg-opacity-80" />
            </div>

            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true" />

            <div
              className="border-gradient inline-block transform overflow-hidden rounded-md bg-[#DE296A] text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              {!countdownEnded && (
                <div className="bg-black px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="justify-center sm:flex sm:items-center">
                    <div className="mt-3 text-center">
                      <h3 className="Roboto mb-8 text-xl font-bold leading-6 text-[#DCDCDC]" id="modal-headline">
                        Get Ready. Recording will start in...
                      </h3>
                      <div className="timer-wrapper mb-10">
                        <CountdownCircleTimer
                          isPlaying
                          duration={3}
                          colors={['#8500B4', '#DE296A', '#FFDD00']}
                          colorsTime={[3, 2, 1]}
                          onComplete={() => setCountdownEnded(true)}
                        >
                          {renderTime}
                        </CountdownCircleTimer>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {countdownEnded && (
                <>
                  {!audioUrl && (
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
                                <img
                                  src={bigmic.src}
                                  alt="Mic"
                                  className="absolute top-[1.2rem] left-[2.1rem] h-auto w-16"
                                />
                              </div>
                            </div>
                          </button>
                        </div>
                        {recording && (
                          <div className="Inter mt-4 text-center text-2xl font-medium text-white">
                            <span className="hour">{hour}</span>
                            <span>:</span>
                            <span className="minute">{minute}</span>
                            <span>:</span>
                            <span className="second">{second}</span>
                            {/* <button
                              type="button"
                              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-5"
                              onClick={handleStop}
                            >
                              Stop
                            </button> */}
                          </div>
                        )}
                        <div className="flex w-full flex-row items-center justify-end ">
                          <p className="Inter text-sm font-medium text-[#B7B7B7]">Recording</p>
                        </div>
                        <div className="flex w-full flex-row">
                          <img src={voice1.src} alt="voice" className="bg-[#F57251]" />
                          <div className="h-24 w-full bg-[#595959]" />
                        </div>
                      </div>
                    </div>
                  )}

                  {audioUrl && (
                    <div className="mt-8">
                      <div className="flex w-full flex-col  items-center justify-center bg-black pt-2 pb-8">
                        <div className="flex w-full flex-row items-center justify-end gap-x-2 pb-4 pr-2">
                          <p className="Inter text-sm font-medium text-[#CCCCCC]">Collaboration_1</p>
                          <img src={mute.src} alt="Mute" className="h-auto w-6" />
                        </div>
                        <div className="flex flex-row items-center justify-center gap-x-4">
                          <button type="button" onClick={handleRerecord} className="flex flex-row items-center gap-x-4">
                            <span className="Inter cursor-pointer text-base font-medium text-white">Record</span>
                            <img src={record.src} alt="Record" className="h-auto w-8 cursor-pointer" />
                          </button>
                          <div className="box-shadow relative h-40 w-40 rounded-full bg-[#FF3535]">
                            <div className="absolute top-2 left-2 h-36 w-36 rounded-full border-4 border-black border-opacity-50 bg-gradient-to-b from-[#D45BFF] via-[#F5517B] to-[#FEDC00] ">
                              <div className="flex w-full items-center justify-center">
                                <button
                                  type="button"
                                  className="Inter mt-[3rem] text-3xl font-extrabold text-white"
                                  onClick={handleUpload}
                                >
                                  Upload
                                </button>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleReplay(audioUrl)}
                            className="flex flex-row items-center gap-x-4"
                          >
                            <img src={replay.src} alt="Replay" className="h-auto w-8" />
                            <span className="Inter text-base font-medium text-white">Replay</span>
                          </button>
                        </div>
                        <div className="flex w-full flex-row items-center justify-end pt-10 pr-2">
                          <p className="Inter text-sm font-medium text-[#B7B7B7]">Recording Ended</p>
                        </div>
                        <div className="bg-[#F57251]">
                          <img src={voicelong.src} alt="voice" />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* End Record Modal  */}

      {/* Upload Modal  */}
      {showUpload && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-[#202020] bg-opacity-80" />
            </div>

            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true" />

            <div
              className="border-gradient inline-block transform overflow-hidden rounded-md bg-gray-500 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              {uploading && uploadProgress >= 0 && (
                <div className="relative">
                  <div className="flex w-full flex-col  items-center justify-center bg-black py-10">
                    <div className=" flex w-full  flex-col items-center justify-center ">
                      <p className="Roboto mb-16 text-lg font-semibold text-[#DCDCDC]">{title}</p>
                    </div>

                    <LinearProgress
                      variant="determinate"
                      value={uploadProgress}
                      style={{
                        width: '62%',
                        backgroundColor: '#333333',
                        borderRadius: 10,
                        height: 10,
                      }}
                      classes={{
                        bar: 'bg-gradient-to-r from-[#D45BFF] to-[#F5517B]',
                      }}
                    />

                    <button
                      onClick={handleModalUploadClose}
                      type="button"
                      className="Inter mt-10 inline-flex w-full justify-center rounded-md border border-white bg-transparent px-8 py-2 text-base font-medium text-white shadow-sm focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* End Upload Modal  */}

      {/* Mint Modal  */}
      {showMint && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-[#202020] bg-opacity-80" />
            </div>

            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true" />

            <div
              className="border-gradient inline-block transform overflow-hidden rounded-md bg-black text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              <div className="bg-black px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="justify-center sm:flex sm:items-center">
                  <div className="mt-3 text-center">
                    <h3 className="Roboto mb-8 text-lg font-medium leading-6 text-[#DCDCDC]" id="modal-headline">
                      Mint
                    </h3>
                    <div className="mt-2">
                      <p className="Roboto text-xs text-[#DCDCDC]">
                        You are minting <b>Collaboration_Name</b>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {waitingForApproval ? (
                <div className="flex-col items-center justify-center bg-black pb-10 pt-5 sm:flex sm:px-6">
                  <span className="Roboto mb-1 text-xs text-[#DCDCDC]">Approve minting with your wallet</span>
                  <button
                    type="button"
                    className="Inter w-full justify-center rounded-md border border-transparent bg-[#831934] px-10 py-2 text-base font-bold text-[#747474] shadow-sm sm:ml-3 sm:w-auto sm:text-sm"
                    disabled
                  >
                    Waiting for approval
                  </button>
                </div>
              ) : (
                <div className="items-center justify-center bg-black pb-10 pt-5 sm:flex sm:px-6">
                  <button
                    onClick={handleModalMintClose}
                    type="button"
                    className="Inter inline-flex w-full justify-center rounded-md border border-white bg-transparent px-8 py-2 text-base font-medium text-[#9F9CA2] shadow-sm focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmButtonClick}
                    type="button"
                    className="Inter inline-flex w-full justify-center rounded-md border border-transparent bg-[#F5517B] px-8 py-2 text-base font-medium text-white shadow-sm hover:bg-opacity-50 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Confirm
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* End Mint Modal  */}

      {/* Share Modal  */}
      {showShare && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-[#202020] bg-opacity-80" />
            </div>

            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true" />

            <div
              className="border-gradient inline-block transform overflow-hidden rounded-md bg-transparent text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              <div className="bg-transparent px-2 pt-4 pb-8 ">
                <div className="flex justify-end text-white ">
                  <XMarkIcon className="h-6 w-6 cursor-pointer" aria-hidden="true" onClick={handleModalShareClose} />
                </div>
                <div className="px-4 py-1 sm:flex sm:items-center">
                  <div className="mt-3 text-left">
                    <div className="px-2 text-left">
                      <h3 className="Roboto mb-4 text-xl font-bold leading-6 text-[#DCDCDC]">Invite a friend</h3>
                      <label htmlFor="email" className="Roboto block text-sm font-medium text-[#DCDCDC]">
                        Enter email
                      </label>
                      <div className="flex w-full flex-row justify-between">
                        <div>
                          <input
                            type="text"
                            className="block w-full rounded-md border  border-white bg-black px-4 py-2 text-gray-700 "
                          />
                          <span className="Roboto text-sm text-[#DCDCDC]">
                            Your friend can join and collaborate on the same project
                          </span>
                        </div>
                        <button
                          type="button"
                          className="Inter flex h-11 flex-row items-center justify-center gap-x-4 rounded-md bg-[#F5517B] px-4 py-2 text-base font-medium text-white hover:bg-opacity-50 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          <img src={email.src} alt="Email" />
                          Invite
                        </button>
                      </div>
                    </div>
                    <hr className="my-6 border-b border-[#525252]" />
                    <div className="px-2 text-left">
                      <h3 className="Roboto mb-4 text-xl font-bold leading-6 text-[#DCDCDC]">Share link</h3>
                      <div className="flex w-full flex-row justify-between">
                        <input
                          type="text"
                          placeholder="https://www.testing.com/collaboration_1"
                          className="block w-full rounded-md border  border-white bg-black px-4 py-2 text-[#DCDCDC] "
                        />
                        <button
                          type="button"
                          className="Inter flex h-11 flex-row items-center justify-center gap-x-4 rounded-md bg-[#F5517B] px-6 py-2 text-base font-medium text-white hover:bg-opacity-50 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          <img src={copy.src} alt="Email" />
                          Copy
                        </button>
                      </div>
                    </div>
                    <hr className="my-6 border-b border-[#525252]" />
                    <div className="px-2">
                      <h3 className="Roboto mb-4 text-xl font-bold leading-6 text-[#DCDCDC]">Social media</h3>
                      <div>
                        <button
                          type="button"
                          className="Inter flex flex-row items-center gap-x-2 rounded-md bg-[#1A8CD8] px-4 py-2 text-sm text-white hover:bg-opacity-70"
                        >
                          <img src={twitter.src} alt="Email" />
                          Tweet
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* End Share Modal  */}
    </>
  )
}

// function SignMsg() {
//   const [msg, setMsg] = useState('Dapp Starter')
//   const { data, isError, isLoading, isSuccess, signMessage } = useSignMessage({
//     message: msg,
//   })
//   const signMsg = () => {
//     if (msg) {
//       signMessage()
//     }
//   }

//   return (
//     <>
//       <p>
//         <input value={msg} onChange={e => setMsg(e.target.value)} className="rounded-lg p-1" />
//         <button
//           disabled={isLoading}
//           onClick={() => signMsg()}
//           className="ml-1 rounded-lg bg-blue-500 py-1 px-2 text-white transition-all duration-150 hover:scale-105"
//         >
//           Sign
//         </button>
//       </p>
//       <p>
//         {isSuccess && <span>Signature: {data}</span>}
//         {isError && <span>Error signing message</span>}
//       </p>
//     </>
//   )
// }
