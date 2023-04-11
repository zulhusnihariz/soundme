import { useRef, useState } from 'react'
import { CountdownCircleTimer } from 'react-countdown-circle-timer'

interface CountdownProp {
  onCountdownFinish: () => void
}

const CountdownTimer = (prop: CountdownProp) => {
  return (
    <CountdownCircleTimer
      isPlaying
      duration={3}
      colors={['#8500B4', '#DE296A', '#FFDD00']}
      colorsTime={[3, 2, 1]}
      onComplete={prop.onCountdownFinish}
    >
      {({ remainingTime }) => <div className="time-wrapper">{remainingTime}</div>}
    </CountdownCircleTimer>
  )
}

export default CountdownTimer
