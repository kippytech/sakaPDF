'use client'

import React, { useState } from 'react'
import UploadButton from './UploadButton'
import { trpc } from '@/app/_trpc/client'
import { Ghost, Loader2, MessageSquare, Plus, Trash } from 'lucide-react'
import Skeleton from 'react-loading-skeleton'
import Link from 'next/link'
import {format} from 'date-fns'
import { Button } from './ui/button'
import { useRouter } from 'next/navigation'
import { getUserSubscriptionPlan } from '@/lib/stripe'

type DashboardProps = {
  subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>
}

function Dashboard({subscriptionPlan}: DashboardProps) {

  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const router = useRouter()

  const utils = trpc.useContext()

  const {data: files, isLoading} = trpc.getUserFiles.useQuery()

  const {mutate} = trpc.deleteFile.useMutation({
    onSuccess: () => {
       //router.refresh()
       utils.getUserFiles.invalidate()
   },
    onMutate ({id})  {
       setIsDeleting(id)
    },
    onSettled() {
       setIsDeleting(null)
    } 
  })

  return (
    <main className='max-w-7xl mx-auto md:p-10'>
      <div className='mt-8 flex flex-col items-start justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:gap-0'>
        <h1 className='mb-3 font-bold text-5xl text-slate-800'>My files</h1>
        <UploadButton isSubscribed={subscriptionPlan.isSubscribed} />
      </div>
      {/* display all the files by user */}
      { files && files.length > 0 ? (
        <ul className='mt-8  grid gri-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 divide-y divide-zinc-200'>
          { files.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() ).map((file) => (
            <li key={file.id} className='col-span-1 divide-y divide-slate-200 rounded-lg bg-white shadow hover:shadow-lg transition'>
              <Link href={`/dashboard/${file.id}`} className='flex flex-col gap-2'>
                <div className='pt-6 px-6 flex items-center justify-between space-x-6 w-full'>
                  <div className='h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500' />
                  <div className='flex-1 truncate'>
                    <div className='flex items-center space-x-3'>
                      <h3 className='truncate text-lg font-medium text-zinc-800'>
                        { file.name}
                      </h3>
                    </div>
                  </div>
                </div>
              </Link>
              <div className='px-6 mt-4 grid grid-cols-3 gap-6 place-items-center text-xs text-zin-500'>
                <div className='flex items-center gap-2'>
                  <Plus className='h-4 w-4' />
                  { format(new Date(file.createdAt), 'dd MM yyyy') }
                </div>
                <div className='flex items-center gap-2'>
                  <MessageSquare className='h-4 w-4' />
                  mocked
                </div>
                <Button onClick={() => mutate({id: file.id})} size='sm' className='w-full' variant='destructive'>
                  { isDeleting === file.id ? (
                    <Loader2 className='animate-spin'/> 
                  ) : (
                    <Trash className='w-4 h-4' />
                  ) }
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : isLoading ? (
        <Skeleton className='my-2' height={100} count={3} />
      ) : (
        <div className='mt-16 flex flex-col items-center gap-2'>
          <Ghost className='text-zinc-800' />
          <h3 className='font-semibold text-xl'>Pretty empty here.</h3>
          <p>Let&apos;s upload your first PDF.</p>
        </div>
      ) }
    </main>
  )
}

export default Dashboard