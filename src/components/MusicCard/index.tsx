interface Music {
  name: String
  description: String
  handleClick: () => void
}

const MusicCard = ({ name, description, handleClick }: Music) => {
  return (
    <article className="rounded-xl bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 p-0.5 shadow-xl transition hover:shadow-sm">
      <div className="rounded-[10px] bg-white p-4 !pt-20 sm:p-6">
        {/* <time className="block text-xs text-gray-500">{name}</time> */}

        <a href="#">
          <h3 className="mt-0.5 text-lg font-medium text-gray-900">{name}</h3>
        </a>

        <div className="mt-4 flex flex-wrap gap-1">
          <a
            className="inline-block rounded bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 p-[2px] hover:text-white focus:outline-none focus:ring active:text-opacity-75"
            href="#"
          >
            <span className="block rounded-sm bg-transparent px-8 py-3 text-sm font-medium" onClick={handleClick}>
              Collaborate
            </span>
          </a>

          <a
            className="inline-block rounded bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 p-[2px] hover:text-white focus:outline-none focus:ring active:text-opacity-75"
            href="#"
          >
            <span className="block rounded-sm bg-transparent px-8 py-3 text-sm font-medium">Mint</span>
          </a>
        </div>
      </div>
    </article>
  )
}

export default MusicCard
