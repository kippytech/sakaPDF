'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import Dropzone from 'react-dropzone'
import { Cloud, File, Loader2 } from "lucide-react"
import { Progress } from "./ui/progress"
import { useUploadThing } from "@/lib/uploadthing"
import { useToast } from "./ui/use-toast"
import { trpc } from "@/app/_trpc/client"
import { useRouter } from "next/navigation"

const UploadDropzone = ({isSubscribed}: {isSubscribed: boolean}) => {

    const [isUploading, setIsUploading] = useState(true)
    const [uploadProgress, setUploadProgress] = useState(0)

    const {toast} = useToast()

    const router = useRouter()

    const {startUpload} = useUploadThing(isSubscribed ? 'proPlanUploader' : 'freePlanUploader')

    const {mutate: startPolling} = trpc.getFile.useMutation({
        onSuccess: (file) => {
            router.push(`/dashboard/${file.id}`)
        },
        retry: true,
        retryDelay: 500
    })

    const startSimulatedProgress = () => {
        setUploadProgress(0)

        const interval = setInterval(() => {
            setUploadProgress((prev) => {
                if (prev >= 95) {
                    clearInterval(interval)
                    return prev
                } 
                return prev + 5
            })
        }, 500)

        return interval
    }

    return (
        <>
            <Dropzone multiple={false} onDrop={async (acceptedFile) => {
                setIsUploading(true)
                const progressInterval = startSimulatedProgress()

                //handle file upload
                const res = await startUpload(acceptedFile)

                if (!res) {
                    return toast({
                        title: 'Something went wrong',
                        description: 'Please try again',
                        variant: 'destructive'
                    })
                }

                const [fileResponse] = res

                const key = fileResponse.key

                if (!key) {
                    return toast({
                        title: 'Something went wrong',
                        description: 'Please try again',
                        variant: 'destructive'
                    })
                }

                clearInterval(progressInterval)
                setUploadProgress(100)

                //call the db to confirm uploading(polling) to ensure uploadthing is in sync w db
                startPolling({ key })
            }}>
                { ({getRootProps, acceptedFiles, getInputProps}) => {
                     return <div {...getRootProps()} className="border h-64 m-4 border-dashed border-gray-300 rounded-lg">
                        <div className="flex items-center justify-center h-full w-full">
                            <label htmlFor="dropzone-file" className="flex flex-col items-center w-full h-full rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Cloud className='mb-2 text-zinc-500' />
                                    <p className="mb-2 text-sm text-zinc-700">
                                        <span className="font-semibold">Click to upload </span>or drag and drop.
                                    </p>
                                    <p className="text-sm text-zinc-500">PDF (up to {isSubscribed ? '16' : '4'} MB)</p>
                                </div>
                                { acceptedFiles && acceptedFiles[0] ? (
                                    <div className="max-w-sm bg-white flex items-center rounded-md  overflow-hidden outline-[1px] outline-zinc-200 divide-x divide-zinc-200">
                                        <div className="px-3 py-2 h-full grid place-items-center">
                                            <File className="text-blue-600 h-4 w-4" />
                                        </div>
                                        <div className="px-3 py-2 h-full text-sm truncate">
                                            {acceptedFiles[0].name}
                                        </div>
                                    </div>
                                ) : null}
                                { isUploading ? (
                                    <div className="w-full mt-4 max-w-xs mx-auto">
                                        <Progress value={uploadProgress} className="bg-zinc-200 h-2"
                                          indicatorColor={uploadProgress === 100 ? 'bg-green-500' : ''}
                                        />
                                        { uploadProgress === 100 ? (
                                            <div className='flex gap-1 items-center justify-center text-sm text-zinc-700 text-center pt-2'>
                                                <Loader2 className="animate-spin" />
                                                Redirecting...
                                            </div>
                                        ) : null}
                                    </div>
                                ) : null }
                                <input {...getInputProps()} type="file id='dropzone-file" className="hidden" />
                            </label>
                        </div>
                    </div>
                }}
            </Dropzone>
        </>
    )
}

function UploadButton({isSubscribed}: {isSubscribed: boolean}) {
    const [isOpen, setIsOpen] = useState(false)
  return (
    <Dialog open={isOpen} onOpenChange={(v) => { if (!v) {setIsOpen(v)}}}>
        <DialogTrigger asChild onClick={() => setIsOpen(true)}>
            <Button>Upload PDF</Button>
        </DialogTrigger>
        <DialogContent>
            <UploadDropzone isSubscribed={isSubscribed} />
        </DialogContent>
    </Dialog>
  )
}

export default UploadButton