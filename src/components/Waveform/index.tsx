import { PlayerState } from 'components/RecordingDialog'
import { useEffect, useRef, useState } from 'react'
import wavesurfer from 'wavesurfer.js'

interface WaveformProps {
  url: string
  playerState: PlayerState
  isMuted: Boolean
  onToggleSound: () => void
  onFinish?: () => void
}

const Waveform: React.FC<WaveformProps> = ({ url, playerState, isMuted, onToggleSound, onFinish }) => {
  const waveformRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadWaveSurfer = async () => {
      if (typeof window === 'undefined') {
        return
      }

      const { default: WaveSurfer } = await import('wavesurfer.js')

      if (isMounted && waveformRef.current) {
        wavesurferRef.current = WaveSurfer.create({
          container: waveformRef.current,
          waveColor: 'violet',
          backend: 'WebAudio',
          hideCursor: true,
          responsive: true,
          normalize: true,
          height: 38,
          barHeight: 10,
          fillParent: false,
          minPxPerSec: 100,
        })
        wavesurferRef.current.load(url)

        wavesurferRef.current.on('ready', () => {
          switch (playerState) {
            case PlayerState.PLAY:
              if (!isMuted) {
                wavesurferRef.current?.play()
              }
              break
            case PlayerState.PAUSED:
              if (wavesurferRef.current?.isPlaying) {
                wavesurferRef.current?.pause()
              }
              break
            case PlayerState.STOP:
            default:
              wavesurferRef.current?.stop()
              break
          }
        })

        wavesurferRef.current.on('finish', () => {
          if (onFinish) {
            onFinish()
          }
        })
      }
    }

    loadWaveSurfer()

    return () => {
      isMounted = false
      wavesurferRef.current?.destroy()
    }
  }, [url, playerState, isMuted, onFinish])

  return (
    <div className="flex items-center justify-between">
      <div ref={waveformRef} />
      <button className="rounded-full" onClick={onToggleSound}>
        {isMuted && (
          <svg fill="#000000" width="48px" height="48px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <path d="M542.86 294.4L362.3 430a10.72 10.72 0 0 0-2.71 3.25H255.53v153.2h104.06a10.58 10.58 0 0 0 2.71 3.25l180.56 135.52a10.83 10.83 0 0 0 17.34-8.66v-413.5a10.83 10.83 0 0 0-17.34-8.66zM742.6 599.41L765 577l-67.2-67.2 67.2-67.2-22.4-22.4-67.2 67.2-67.2-67.2-22.4 22.4 67.2 67.2-67.2 67.2 22.4 22.4 67.2-67.2 67.2 67.2z"></path>
            </g>
          </svg>
        )}
        {!isMuted && (
          <svg width="36px" height="36px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#000000">
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M1.5 4.83h2.79L8.15 1l.85.35v13l-.85.33-3.86-3.85H1.5l-.5-.5v-5l.5-.5zM4.85 10L8 13.14V2.56L4.85 5.68l-.35.15H2v4h2.5l.35.17zM15 7.83a6.97 6.97 0 0 1-1.578 4.428l-.712-.71A5.975 5.975 0 0 0 14 7.83c0-1.4-.48-2.689-1.284-3.71l.712-.71A6.971 6.971 0 0 1 15 7.83zm-2 0a4.978 4.978 0 0 1-1.002 3.004l-.716-.716A3.982 3.982 0 0 0 12 7.83a3.98 3.98 0 0 0-.713-2.28l.716-.716c.626.835.997 1.872.997 2.996zm-2 0c0 .574-.16 1.11-.44 1.566l-.739-.738a1.993 1.993 0 0 0 .005-1.647l.739-.739c.276.454.435.988.435 1.558z"
              ></path>
            </g>
          </svg>
        )}
      </button>
    </div>
  )
}

export default Waveform
