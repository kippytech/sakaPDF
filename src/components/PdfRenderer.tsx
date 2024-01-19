'use client'

import {Document, Page, pdfjs} from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import { useToast } from './ui/use-toast'
import { Loader2 } from 'lucide-react'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

type PdfRendererProps = {
  url: string
}

function PdfRenderer({ url }: PdfRendererProps) {

  const {toast} = useToast()

  //const {} = useResizeDetector()

  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
        <div className="h-14 w-full border- border-zinc-200 flex items-center justify-between px-2">
            <div className="flex items-center gap-2">top bar</div>
        </div>
        <div className='flex-1 w-full max-h-screen'>
          <div>
            <Document loading={
              <div className='flex justify-center '>
                <Loader2 className='my-24 animate-spin' />
              </div>
            } onLoadError={() => {
              toast({
                title: 'Error loading PDF',
                description: 'Please try again',
                variant: 'destructive'
              })
            }}
              file={url} className='max-h-full'>
              <Page pageNumber={1} />
            </Document>
          </div>
        </div>
    </div>
  )
}

export default PdfRenderer