import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import email from '../../assets/icon/email.png'
import copy from '../../assets/icon/copy.png'
import twitter from '../../assets/icon/twitter.png'

interface ShareDialogProp {
  tokenId: String
}

const ShareButtonDialog = (prop: ShareDialogProp) => {
  const [isDialogOpened, setIsDialogOpened] = useState(false)

  const handleShareButtonClick = () => {
    setIsDialogOpened(true)
  }
  const handleModalShareClose = () => {
    setIsDialogOpened(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsDialogOpened(true)}
        className="rounded-full border border-[#FFDDDD] bg-transparent py-1 px-4"
      >
        Share
      </button>
      {isDialogOpened && (
        <div className="absolute inset-0 z-10 h-screen w-screen overflow-y-auto">
          <div className="flex items-center justify-center text-center sm:block sm:p-0">
            <div
              className="border-gradient inline-block transform overflow-hidden rounded-md bg-transparent text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              <div className="bg-transparent px-2 pt-4 pb-8 ">
                <div className="flex justify-end text-white">
                  <XMarkIcon
                    className="h-6 w-6 cursor-pointer"
                    aria-hidden="true"
                    onClick={() => setIsDialogOpened(false)}
                  />
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
    </>
  )
}

export default ShareButtonDialog
