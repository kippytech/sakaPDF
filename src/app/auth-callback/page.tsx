import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'
import { trpc } from '../_trpc/client'

function AuthCallback() {

    const router = useRouter()

    const searchParams = useSearchParams()
    const origin = searchParams.get('origin')

    const {data} = trpc.authCallback.useQuery(undefined, {
        onSuccess: ({success}) => {
            //if user is synced to db
            router.push(origin ? `${origin}`: '/dashboard')
        }
    })

  return (
    <div>AuthCallback</div>
  )
}

export default AuthCallback