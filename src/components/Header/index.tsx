import React from 'react'
import { Disclosure } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { ThemeToggleButton, ThemeToggleList } from 'components/Theme'
import ConnectWallet from 'components/Connect/ConnectWallet'
import styles from '../../styles/Home.module.scss'

import logo from '../../assets/img/logo.png'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function Header() {
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
            <ConnectWallet />
          </div>
        </div>
      </div>
    </Disclosure>
  )
}
