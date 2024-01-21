'use client'

import React from 'react'
import Messages from './Messages'
import ChatInput from './ChatInput'
import { trpc } from '@/app/_trpc/client'
import { ChevronLeft, Loader2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '../ui/button'
import { ChatContextProvider } from './ChatContext'

type ChatWrapperProps = {
  fileId: string
}

function ChatWrapper({ fileId }: ChatWrapperProps) {

  const {data, isLoading} = trpc.getFileUploadStatus.useQuery({ fileId }, { refetchInterval: (data) => 
    data?.status === 'SUCCESS' || data?.status === 'FAILED' ? false : 500
  })

  //loading is b4 any status incl pending(when page just renders)
  if (isLoading) return (
    <div className='relative min-h-full bg-zinc-50 divide-y divide-zinc-200 flex flex-col justify-between gap-2'>
      <div className='flex flex-1 justify-center items-center flex-col mb-28'>
        <div className='flex flex-col items-center gap-2'>
          <Loader2 className='animate-spin text-blue-500' />
          <h3 className='font-semibold text-xl'>Loading...</h3>
          <p className='text-zinc-700 text-sm'>We&apos;re preparing your pdf</p>
        </div>
      </div>
      <ChatInput isDisabled />
    </div>
  )

  if (data?.status === 'PROCESSING') return (
    <div className='relative min-h-full bg-zinc-50 divide-y divide-zinc-200 flex flex-col justify-between gap-2'>
      <div className='flex flex-1 justify-center items-center flex-col mb-28'>
        <div className='flex flex-col items-center gap-2'>
          <Loader2 className='animate-spin text-blue-500' />
          <h3 className='font-semibold text-xl'>Processing PDF...</h3>
          <p className='text-zinc-700 text-sm'>This won&apos;t take long</p>
        </div>
      </div>
      <ChatInput isDisabled />
    </div>
  )

  if (data?.status === 'FAILED') return (
    <div className='relative min-h-full bg-zinc-50 divide-y divide-zinc-200 flex flex-col justify-between gap-2'>
      <div className='flex flex-1 justify-center items-center flex-col mb-28'>
        <div className='flex flex-col items-center gap-2'>
          <XCircle className='text-red-500' />
          <h3 className='font-semibold text-xl'>Failed. Too many pages in PDF.</h3>
          <p className='text-zinc-700 text-sm'>
            Your <span className='font-medium'> free</span> plan supports up to 5 pages per PDF.
          </p>
          <Link href='/dashboard' className={buttonVariants({variant: 'secondary',className: 'mt-4'})}>
            <ChevronLeft className='mr-1.5' />Back
          </Link>
        </div>
      </div>
      <ChatInput isDisabled />
    </div>
  )

  return (
    <ChatContextProvider fileId={fileId}>
      <div className='relative min-h-full bg-zinc-50 divide-y divide-zinc-200 flex gap-2 flex-col justify-between'>
        <div className=' flex flex-1 justify-between flex-col mb-28'>
          <Messages />
        </div>
        <ChatInput />
      </div>
    </ChatContextProvider>
  )
}

export default ChatWrapper