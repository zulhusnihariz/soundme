import { Dialog, Tab } from '@headlessui/react';
import { useBoundStore } from 'store';
import ConnectSolana from 'components/Connect/ConnectSolana';
import ConnectWallet from 'components/Connect/ConnectWallet';
import { useState } from 'react';
import ConnectNear from 'components/Connect/ConnectNear';

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export default function SignInModal() {
  const { modal, setModalState } = useBoundStore();

  let [categories] = useState({
    EVM: [{ element: () => <ConnectWallet /> }],
    Solana: [{ element: () => <ConnectSolana /> }],
    Near: [{ element: () => <ConnectNear /> }],
  });
  return (
    <>
      <Dialog open={modal.signUpMain.isOpen} onClose={() => setModalState({ signUpMain: { isOpen: false } })}>
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed left-1/2 top-1/2 max-w-[400px] -translate-x-1/2 -translate-y-1/2 transform rounded-lg border border-slate-500 bg-[#0D0D0D] p-8">
          <Dialog.Panel>
            <Dialog.Title className="mb-4">Connect a wallet to continue</Dialog.Title>
            <Dialog.Description>
              Choose how you want to connect. If you don't have a wallet, you can select a provider and create one.
            </Dialog.Description>
            <div className="w-full px-2 py-16 sm:px-0">
              <Tab.Group>
                <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
                  {Object.keys(categories).map(category => (
                    <Tab
                      key={category}
                      className={({ selected }) =>
                        classNames(
                          'w-full py-2.5 text-sm  font-medium text-white focus:outline-none',
                          selected
                            ? 'border-t-none border-b-4 border-b-[#e93a88] text-[#e93a88] outline-none focus:outline-none'
                            : 'text-white hover:bg-white/[0.12]'
                        )
                      }
                    >
                      {category}
                    </Tab>
                  ))}
                </Tab.List>
                <Tab.Panels className="mt-2">
                  {Object.values(categories).map((posts, idx) => (
                    <Tab.Panel key={idx} className={classNames('rounded-xl p-3')}>
                      {posts[0].element}
                    </Tab.Panel>
                  ))}
                </Tab.Panels>
              </Tab.Group>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
