import { BeatState } from 'components/RecordingDialog'
import { useEffect, useRef, useState } from 'react'
import wavesurfer from 'wavesurfer.js'

interface WaveformProps {
  url: string
  state: BeatState
}

const Waveform: React.FC<WaveformProps> = ({ url, state }) => {
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
        })
        wavesurferRef.current.load(url)

        wavesurferRef.current.on('ready', () => {
          switch (state) {
            case BeatState.PLAY:
              wavesurferRef.current?.play()
              break
            case BeatState.PAUSED:
              if (wavesurferRef.current?.isPlaying) {
                wavesurferRef.current?.pause()
              }
              break
            case BeatState.STOP:
            default:
              wavesurferRef.current?.stop()
              break
          }
        })
      }
    }

    loadWaveSurfer()

    return () => {
      isMounted = false
      wavesurferRef.current?.destroy()
    }
  }, [url, state])

  return <div ref={waveformRef} />
}

export default Waveform
