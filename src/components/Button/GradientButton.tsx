interface GradientButtonProp {
  children: any
  bg?: string
  from?: string
  to?: string
  callback: () => void
}

const GradientButton = (prop: GradientButtonProp) => {
  const gradient = prop.from && prop.to ? `bg-gradient-to-t from-${prop.from} to-${prop.to}` : ''
  const bg = `bg-${prop.bg}`

  return (
    <button
      className={`flex h-20 w-20 flex-col items-center justify-center rounded-lg p-2 ${gradient} ${bg} text-xs font-bold text-white md:hover:scale-105`}
      onClick={() => prop.callback?.()}
    >
      {prop.children}
    </button>
  )
}

export default GradientButton
