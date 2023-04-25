export function shortenAddress(address: string, n: number = 4) {
  if (!address) return ''
  if (n < 1 || n >= address?.length) {
    return address
  }

  const firstNChars = address.slice(0, n)
  const lastNChars = address.slice(-n)

  return `${firstNChars}...${lastNChars}`
}
