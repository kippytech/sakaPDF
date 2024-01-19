'use client'

import { trpc } from "@/app/_trpc/client"
import ChatWrapper from "@/components/ChatWrapper"
import PdfRenderer from "@/components/PdfRenderer"
import { db } from "@/db"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { notFound, redirect } from "next/navigation"

interface ParamProps {
    params: {
        fileId: string
    }
}

function FileId({params}: ParamProps) {
    //retrieve the file id
    const {fileId} = params

    //check user auth
    // const {getUser} = getKindeServerSession()
    // const user = await getUser()

    // if (!user || !user.id) redirect(`/auth-callback?origin=dashboard/${fileId}`)

    //make db call
    // const file = await db.file.findFirst({
    //     where: {
    //         id: fileId,
    //         userId: user.id
    //     },
    // })

    // if (!file) notFound()

    const {data: file, isLoading} = trpc.getFileForRender.useQuery({id: fileId})

    if (!file) return 'no file'

    console.log(file)

  return (
    <div className="flex-1 flex flex-col justify-between h-[calc(100vh-3.5rem)]">
        <div className="mx-auto max-w-8xl w-full grow lg:flex xl:px-2">
            {/*  left side */}
            <div className="flex-1 xl:flex">
                <div className="px-4 py-6 sm:px-6 lg:pl-8 xl:pl-6 xl:flex-1">
                    <PdfRenderer url={file.url} />
                </div>
            </div>
            {/*  right side */}
            <div className="shrink-0 flex-[0.75] border-t border-slate-200 lg:w-96 lg:border-l lg:border-t-0">
                <ChatWrapper />
            </div>
        </div>
    </div>
  )
}

export default FileId