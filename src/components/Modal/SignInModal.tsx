import { Dialog, Tab } from '@headlessui/react';
import { useBoundStore } from 'store';
import ConnectSolana from 'components/Connect/ConnectSolana';
import ConnectWallet from 'components/Connect/ConnectWallet';
import { useState } from 'react';
import ConnectNear from 'components/Connect/ConnectNear';
import ConnectTezos from 'components/Connect/ConnectTezos';

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export default function SignInModal() {
  const { modal, setModalState } = useBoundStore();

  let [categories] = useState({});
  return (
    <>
      <Dialog open={modal.signUpMain.isOpen} onClose={() => setModalState({ signUpMain: { isOpen: false } })}>
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed left-1/2 top-1/2 max-w-[400px] -translate-x-1/2 -translate-y-1/2 transform rounded-lg border border-slate-500 bg-[#0D0D0D] p-8 text-white">
          <Dialog.Panel>
            <Dialog.Title className="mb-4">Connect a wallet to continue</Dialog.Title>
            <Dialog.Description>
              Choose how you want to connect. If you don't have a wallet, you can select a provider and create one.
            </Dialog.Description>
            <div className="w-full px-2 py-16 sm:px-0">
              <div className="flex flex-col gap-5 space-x-1 rounded-xl bg-blue-900/20 p-1">
                <ConnectWallet />
                <ConnectSolana />
                <ConnectNear />
                <ConnectTezos />
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
