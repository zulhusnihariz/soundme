import React from 'react';
import { Disclosure } from '@headlessui/react';

import ConnectWallet from 'components/Connect/ConnectWallet';
import styles from '../../styles/Home.module.scss';

import logo from '../../assets/img/logo.png';
import Link from 'next/link';
import { useBoundStore } from 'store';
import { ConnectedWalletInfo } from './ConnectedWalletInfo';
import { CURRENT_CHAIN } from 'store/slices/wallet.slice';
import { useConnectedWallet } from 'hooks/use-connected-wallet';

export default function Header() {
  const { setModalState, current } = useBoundStore();
  useConnectedWallet();
  return (
    <Disclosure as="nav" className="bg-transparent">
      <div className="mx-auto mt-6 max-w-[3840px] px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="flex flex-1 items-center sm:items-stretch sm:justify-start">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/">
                <img className="block h-10 w-auto lg:hidden" src={logo.src} alt="Collabeat" />
                <img className="hidden h-10 w-auto lg:block" src={logo.src} alt="Collabeat" />
              </Link>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center gap-4 pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {current.chain ? (
              <ConnectedWalletInfo />
            ) : (
              <button
                onClick={() => setModalState({ signUpMain: { isOpen: true } })}
                className="rounded-sm bg-gradient-to-t from-[#7224A7] to-[#FF3065] px-4 py-2"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </Disclosure>
  );
}
