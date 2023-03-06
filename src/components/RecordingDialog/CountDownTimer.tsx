import { useRef, useState } from 'react'
import { CountdownCircleTimer } from 'react-countdown-circle-timer'

interface CountdownProp {
  onCountdownFinish: () => void
}

const renderTime = ({ remainingTime }) => {
  return (
    <div className="time-wrapper">
      <div>{remainingTime}</div>
    </div>
  )
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
      {renderTime}
    </CountdownCircleTimer>
  )
}

export default CountdownTimer
