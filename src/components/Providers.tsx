'use client'

import { PropsWithChildren, useState } from "react"
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import { trpc } from "@/app/_trpc/client"
import { httpBatchLink } from "@trpc/client"

function Providers({ children }: PropsWithChildren) {

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    const [queryClient] = useState(() => new QueryClient())
    const [trpcClient] = useState(() =>  trpc.createClient({
        links: [
            httpBatchLink({
                url: `${apiUrl}/api/trpc`  //'http://localhost:3000/api/trpc'
            })
        ]
    }))

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  )
}

export default Providers