'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'
import { trpc } from '../_trpc/client'
import { Loader2 } from 'lucide-react'

function AuthCallback() {

    const router = useRouter()

    const searchParams = useSearchParams()
    const origin = searchParams.get('origin')

    const {data} = trpc.authCallback.useQuery(undefined, {
        onSuccess: ({success}) => {
            //if user is synced to db
            router.push(origin ? `${origin}`: '/dashboard')
        },
        onError(err) {
            if(err.data?.code === 'UNAUTHORIZED') {
                router.push('/login')
            }
        },
        retry: true,
        retryDelay: 500
    })

  return (
    <div className='w-full mt-24 flex justify-center'>
        <div className='flex flex-col gap-2 items-center'>
            <Loader2 className='animate-spin' />
            <h3 className='font-semibold text-xl'>Setting up your account...</h3>
            <p>You will be redirected automatically.</p>
        </div>
    </div>
  )
}

export default AuthCallback