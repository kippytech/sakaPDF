import { trpc } from '@/app/_trpc/client'
import { INFINITE_QUERY_LIMIT } from '@/config/infiniteQuery'
import { Loader2, MessageSquare } from 'lucide-react'
import React, { useContext, useEffect, useRef } from 'react'
import Skeleton from 'react-loading-skeleton'
import Message from './Message'
import { ChatContext } from './ChatContext'
import { useIntersection } from '@mantine/hooks'

type MessagesProps = {
  fileId: string
}

function Messages({ fileId }: MessagesProps) {

  const {isLoading: isAIThinking} = useContext(ChatContext)

  const {data, isLoading, fetchNextPage} = trpc.getFileMessages.useInfiniteQuery({
    fileId,
    limit: INFINITE_QUERY_LIMIT
  }, {
    getNextPageParam: (lastPage) => lastPage?.nextCursor,
    keepPreviousData: true
  })

  const messages = data?.pages.flatMap((page) => page.messages)

  const loadingMessage = {
    id: 'loading-message',
    createdAt: new Date().toISOString(),
    text: (
      <span className='flex items-center justify-center h-full'>
        <Loader2 className='animate-spin' />
      </span>
    ),
    isUserMessage: false
  }

  const combinedMessages = [
    ...(isAIThinking ? [loadingMessage] : []),
    ...(messages ?? [])
  ]

  const lastMessageRef = useRef<HTMLDivElement>(null)

  const {entry, ref} = useIntersection({
    root: lastMessageRef.current,
    threshold: 1
  })

  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage()
    }
  }, [entry, fetchNextPage])

  return (
    <div className='max-h-[calc(100vh-3.5rem-7rem)] border border-zinc-200 flex flex-col-reverse flex-1 gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch'>
      { combinedMessages && combinedMessages.length > 0 ? (
        combinedMessages.map((mssg, i) => {

          const isNextMessageSamePerson = combinedMessages[i - 1]?.isUserMessage === combinedMessages[i]?.isUserMessage

          if (i === combinedMessages.length-1) {
            return <Message isNextMessageSamePerson={isNextMessageSamePerson} message={mssg} key={mssg.id} ref={ref} />
          } else return <Message isNextMessageSamePerson={isNextMessageSamePerson} message={mssg} key={mssg.id} />
        })
      ) : isLoading ? (
        <div className='w-full flex flex-col gap-2'>
          <Skeleton className='h-16' />
          <Skeleton className='h-16' />
          <Skeleton className='h-16' />
          <Skeleton className='h-16' />
        </div> ) : (
          <div className='flex-1 flex flex-col items-center justify-center gap-2'>
            <MessageSquare className='text-blue-500 h-8 w-8' />
            <h3 className='font-semibold text-xl'>You&apos;re all set!</h3>
            <p className='text-slate-500  text-sm'>Ask a question to get started</p>
          </div> ) }
    </div>
  )
}

export default Messages