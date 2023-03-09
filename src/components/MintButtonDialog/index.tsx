import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface MintDialogProp {
  tokenId: String
}

const MintButtonDialog = (prop: MintDialogProp) => {
  const [isDialogOpened, setIsDialogOpened] = useState(false)
  return (
    <>
      <button
        type="button"
        className="Inter mr-2 bg-[#D45BFF] px-4 py-2 text-base font-medium leading-5 text-white"
        onClick={() => setIsDialogOpened(true)}
      >
        Mint
      </button>
      {isDialogOpened && (
        <div className="absolute inset-0 z-10 h-screen w-screen overflow-y-auto">
          <div className="flex items-center justify-center text-center sm:block sm:p-0">
            <div
              className="border-gradient inline-block transform overflow-hidden rounded-md bg-black text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              <div className="bg-black px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-end text-white ">
                  <XMarkIcon
                    className="h-6 w-6 cursor-pointer"
                    aria-hidden="true"
                    onClick={() => setIsDialogOpened(false)}
                  />
                </div>
                <div className="justify-center sm:flex sm:items-center">
                  <div className="mt-3 text-center">
                    <h3 className="Roboto mb-8 text-lg font-medium leading-6 text-[#DCDCDC]" id="modal-headline">
                      Mint
                    </h3>
                    <div className="mt-2">
                      <p className="Roboto text-xs text-[#DCDCDC]">
                        You are minting <b>{`Sheet #${prop.tokenId}`}</b>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* {waitingForApproval ? (
              <div className="flex-col items-center justify-center bg-black pb-10 pt-5 sm:flex sm:px-6">
                <span className="Roboto mb-1 text-xs text-[#DCDCDC]">Approve minting with your wallet</span>
                <button
                  type="button"
                  className="Inter w-full justify-center rounded-md border border-transparent bg-[#831934] px-10 py-2 text-base font-bold text-[#747474] shadow-sm sm:ml-3 sm:w-auto sm:text-sm"
                  disabled
                >
                  Waiting for approval
                </button>
              </div>
            ) : (
              <div className="items-center justify-center bg-black pb-10 pt-5 sm:flex sm:px-6">
                <button
                  onClick={handleModalMintClose}
                  type="button"
                  className="Inter inline-flex w-full justify-center rounded-md border border-white bg-transparent px-8 py-2 text-base font-medium text-[#9F9CA2] shadow-sm focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmButtonClick}
                  type="button"
                  className="Inter inline-flex w-full justify-center rounded-md border border-transparent bg-[#F5517B] px-8 py-2 text-base font-medium text-white shadow-sm hover:bg-opacity-50 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Confirm
                </button>
              </div>
            )} */}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default MintButtonDialog
