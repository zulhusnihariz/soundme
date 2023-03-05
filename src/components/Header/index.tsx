import React from 'react'
import { Disclosure } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { ThemeToggleButton, ThemeToggleList } from 'components/Theme'
import ConnectWallet from 'components/Connect/ConnectWallet'
import styles from '../../styles/Home.module.scss'

import logo from '../../assets/img/logo.png'

export default function Header() {
  return (
    <Disclosure as="nav" className="bg-[#101010]">
      {({ open }) => (
        <div className="mx-auto max-w-[3840px] px-2 sm:px-6 lg:px-8">
          <div className="relative flex h-16 items-center justify-between">
            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
              {/* Mobile menu button */}
              <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                <span className="sr-only">Open main menu</span>
                {open ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </Disclosure.Button>
            </div>
            <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
              <div className="flex flex-shrink-0 items-center">
                <img className="block h-8 w-auto lg:hidden" src={logo.src} alt="Collabeat" />
                <img className="hidden h-8 w-auto lg:block" src={logo.src} alt="Collabeat" />
              </div>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center gap-4 pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
              <ThemeToggleButton />
              <ConnectWallet />
              {/* <button type="button" className="">
                <span className="Inter text-[#F0F0F0] ">Start a collaboration</span>
              </button>
              <a href="/main">
                <button type="button" className="rounded-md bg-[#A552D9] px-4 py-2 text-white hover:bg-purple-400">
                  <span className="Inter text-sm font-semibold tracking-wider text-[#F0F0F0]">Connect Wallet</span>
                </button>
              </a> */}
            </div>
          </div>
        </div>
      )}
    </Disclosure>
    // <header className={styles.header}>
    //   <div>SOUNDME</div>
    //   <div className="flex items-center">{/* <ThemeToggleButton /> header <ThemeToggleList /> */}</div>

    //   <div className="flex items-center">
    //     <ThemeToggleButton />
    //     <ConnectWallet />
    //   </div>
    // </header>
  )
}
