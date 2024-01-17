'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import Dropzone from 'react-dropzone'
import { Cloud, File } from "lucide-react"
import { Progress } from "./ui/progress"

const UploadDropzone = () => {

    const [isUploading, setIsUploading] = useState(true)
    const [uploadProgress, setUploadProgress] = useState(0)

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
                await new Promise(async(resolve) => await setTimeout(resolve, 10000))
                clearInterval(progressInterval)
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
                                    <p className="text-sm text-zinc-500">PDF (up to 4MB)</p>
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
                                        <Progress value={uploadProgress} className="bg-zinc-200 h-2"/>
                                    </div>
                                ) : null }
                            </label>
                        </div>
                    </div>
                }}
            </Dropzone>
        </>
    )
}

function UploadButton() {
    const [isOpen, setIsOpen] = useState(false)
  return (
    <Dialog open={isOpen} onOpenChange={(v) => { if (!v) {setIsOpen(v)}}}>
        <DialogTrigger asChild onClick={() => setIsOpen(true)}>
            <Button>Upload PDF</Button>
        </DialogTrigger>
        <DialogContent>
            <UploadDropzone />
        </DialogContent>
    </Dialog>
  )
}

export default UploadButton