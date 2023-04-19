export function classNames(...classes: (false | null | undefined | string)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}
