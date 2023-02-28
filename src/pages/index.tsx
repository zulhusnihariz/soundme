import styles from 'styles/Home.module.scss'
import { ThemeToggleButton, ThemeToggleList } from 'components/Theme'
import { useNetwork, useSwitchNetwork, useAccount, useBalance } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useConnectModal, useAccountModal, useChainModal } from '@rainbow-me/rainbowkit'
import { useSignMessage } from 'wagmi'

import Header from '../components/Header'
import MusicCollection from './MusicCollection'
import { Fluence } from '@fluencelabs/fluence'

/* eslint-disable no-use-before-define */
import React, { useState, useRef, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
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

export default function Home() {
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
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [second, setSecond] = useState('00')
  const [minute, setMinute] = useState('00')
  const [hour, setHour] = useState('00')
  const [timer, setTimer] = useState(0)
  const [intervalId, setIntervalId] = useState(null)

  const [title, setTitle] = useState('')

  const mediaRecorder = useRef(null)

  const handleRecordButtonClick = () => {
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
    setAudioUrl(null)
  }

  // Recording part
  const handleRecord = () => {
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
          setAudioUrl(url)
        })
      })
      .catch(err => console.log(err))
  }

  const handleStop = () => {
    mediaRecorder.current.stop()
    setRecording(false)
  }

  const handleReplay = () => {
    const audio = new Audio(audioUrl)
    audio.play()
  }

  const handleUpload = () => {
    const id = setInterval(() => {
      setUploading(true)
      setRecord(false)
      setUpload(true)
      setUploadProgress(oldProgress => {
        setTitle('Saving your recording')
        const diff = Math.random() * 10
        return Math.min(oldProgress + diff, 100)
      })
    }, 500)
    setIntervalId(id)
  }

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
    <div className="background flex h-auto w-full flex-col justify-start">
      <Header />
      <div className="mx-[5rem] mt-10 mb-10 flex flex-col justify-start gap-y-8">
        <h1 className="Inter text-left text-3xl font-bold text-white">Collaborations</h1>
        <div className="bg-pink Inter w-1/4 px-4 py-2 text-white">
          <div className="mt-1">
            <p className="mb-1 text-left text-base font-semibold text-[#F6F8FF]">Collaboration Name</p>
            <p className="text-left text-xs font-medium text-[#F6F8FF]">
              Started by <span className="text-[#FFE331]">@username</span>
            </p>
          </div>
          <div className="my-4 flex items-center gap-x-2">
            <span className="Roboto font-bold">3:00</span>
            <div className="flex items-center">
              <img src={voice.src} alt="" className="z-10" />
              <img src={voice.src} alt="" />
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-9 w-9 rounded-full bg-[#F8F8F8] bg-opacity-30 p-1"
            >
              <path
                fillRule="evenodd"
                d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="mb-4 flex items-center justify-around gap-2">
            <div
              onClick={handleRecordButtonClick}
              className="flex cursor-pointer flex-row items-center justify-center gap-2 rounded-3xl border border-[#232323] bg-black py-2 px-4"
            >
              <img src={mic.src} alt="Record" />
              <span>Record</span>
            </div>
            <div className="flex flex-row gap-2">
              <button
                type="button"
                onClick={handleMintButtonClick}
                className="rounded-full border border-[#FFDDDD] bg-transparent py-1 px-4"
              >
                Mint
              </button>
              <button
                type="button"
                onClick={handleShareButtonClick}
                className="rounded-full border border-[#FFDDDD] bg-transparent py-1 px-4"
              >
                Share
              </button>
            </div>
          </div>
        </div>
        <MusicCollection />
      </div>
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
                          <button type="button" onClick={handleRecord} className="flex flex-row items-center gap-x-4">
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
                          <button type="button" onClick={handleReplay} className="flex flex-row items-center gap-x-4">
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
    </div>
  )
}
