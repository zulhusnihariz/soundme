export function getSongLength(arrayOfAudioBuffers: AudioBuffer[]) {
  let totalLength = 0

  for (let track of arrayOfAudioBuffers) {
    if (track.length > totalLength) {
      totalLength = track.length
    }
  }

  return totalLength
}

export function mixAudioBuffer(
  bufferList: AudioBuffer[],
  totalLength: number,
  numberOfChannels = 2,
  context: AudioContext
) {
  //create a buffer using the totalLength and sampleRate of the first buffer node
  let finalMix = context.createBuffer(numberOfChannels, totalLength, bufferList[0].sampleRate)

  //first loop for buffer list
  for (let i = 0; i < bufferList.length; i++) {
    // second loop for each channel ie. left and right
    for (let channel = 0; channel < numberOfChannels; channel++) {
      //here we get a reference to the final mix buffer data
      let buffer = finalMix.getChannelData(channel)

      //last is loop for updating/summing the track buffer with the final mix buffer
      for (let j = 0; j < bufferList[i].length; j++) {
        buffer[j] += bufferList[i].getChannelData(channel)[j]
      }
    }
  }

  return finalMix
}

export const getDataKeyAndTokenId = (pathname: string, toSliceString: string) => {
  const keyStartingIndex = pathname.indexOf(toSliceString) + toSliceString.length
  const substring = pathname.substring(keyStartingIndex)
  let regex = new RegExp('.{1,' + 64 + '}', 'g')
  const result = substring.match(regex)
  return { data_key: result[0], token_id: result[1] }
}

export function classNames(...classes: (false | null | undefined | string)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function shortenAddress(address: string, n: number = 4) {
  if (!address) return ''
  if (n < 1 || n >= address?.length) {
    return address
  }

  const firstNChars = address.slice(0, n)
  const lastNChars = address.slice(-n)

  return `${firstNChars}...${lastNChars}`
}
