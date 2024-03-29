'use client'

import { ArrowRight, Menu } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

function MobileNav({ isAuth }: {isAuth: boolean}) {

    const [isOpen, setIsOpen] = useState(false)

    const toggleOpen = () => setIsOpen((prev) => !prev)

    const pathname = usePathname()

    useEffect(() => {
        if (isOpen) toggleOpen()
    }, [pathname])

    const closeOnCurrent = (href: string) => {
        if (pathname === href) {
            toggleOpen()
        }
    }

  return (
    <div className='sm:hidden'>
        <Menu onClick={toggleOpen} className='relative z-50 h-5 w-5 text-zinc-700' />
        {isOpen ? (
            <div className='fixed inset-0 animate-in slide-in-from-top-5 fade-in-20 z-0 '>
                <ul className='absolute bg-white border-b border-zinc-200 shadow-xl grid w-full gap-3 px-10 pt-20 pb-8'>
                    {!isAuth ? (
                        <>
                            <li>
                                <Link onClick={() => closeOnCurrent('/signup')} href='/signup' className='flex items-center w-full font-semibold text-green-600'>Get started <ArrowRight className='ml-2 h-5 w-5' /></Link>
                            </li>
                            <li className='my-3 h-1 w-full bg-gray-300' />
                            <li>
                                <Link onClick={() => closeOnCurrent('/login')} href='/login' className='flex items-center w-full font-semibold text-green-600'>Log in </Link>
                            </li>
                            <li className='my-3 h-1 w-full bg-gray-300' />
                            <li>
                                <Link onClick={() => closeOnCurrent('/pricing')} href='/pricing' className='flex items-center w-full font-semibold text-green-600'>Pricing </Link>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <Link onClick={() => closeOnCurrent('/dashboard')} href='/dashboard' className='flex items-center w-full font-semibold text-green-600'>Dashboard </Link>
                            </li>
                            <li className='my-3 h-1 w-full bg-gray-300' />
                            <li>
                                <Link onClick={() => closeOnCurrent('/pricing')} href='/pricing' className='flex items-center w-full font-semibold text-green-600'>Pricing </Link>
                            </li>
                            <li className='my-3 h-1 w-full bg-gray-300' />
                            <li>
                                <Link href='/logout' className='flex items-center w-full font-semibold text-green-600'>Logout </Link>
                            </li>
                        </>
                    ) }
                </ul>
            </div>
        ) : null }
    </div>
  )
}

export default MobileNav