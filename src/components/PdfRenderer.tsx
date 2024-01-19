'use client'

import {Document, Page, pdfjs} from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import { useToast } from './ui/use-toast'
import { ChevronDown, ChevronUp, Loader2, RotateCw, SearchIcon } from 'lucide-react'
import {useResizeDetector} from 'react-resize-detector'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useState } from 'react'
import { useForm} from 'react-hook-form'
import { z } from 'zod'
import {zodResolver} from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import SimpleBar from 'simplebar-react'
import PdfFullscreen from './PdfFullscreen'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

type PdfRendererProps = {
  url: string
}

function PdfRenderer({ url }: PdfRendererProps) {

  const [numPages, setNumPages] = useState<number>()
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [renderedScale, setRenderedScale] = useState<number | null>(null)

  const isLoading = renderedScale !== zoom

  const pageValidator = z.object({
    page: z.string().refine((num) => Number(num) > 0 && Number(num) <= numPages!)
  })

  type TPageValidator = z.infer<typeof pageValidator>

  const {register, handleSubmit, formState: {errors}, setValue} = useForm<TPageValidator>({
    defaultValues: {
      page: '1'
    },
    resolver: zodResolver(pageValidator)
  })

  const {toast} = useToast()

  const {ref, width} = useResizeDetector()

  const handlePageSubmit = ({page}: TPageValidator) => {
    setCurrentPage(Number(page))
    setValue('page', page)
  }

  return (
    <>
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
        <div className="h-14 w-full border- border-zinc-200 flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Button onClick={() => { setCurrentPage((prev) => (prev - 1) > 1 ? prev - 1: 1); setValue('page', String(currentPage - 1))  }}  disabled={currentPage <= 1} variant='ghost' aria-label='previous page'>
                <ChevronDown className='h-4 w-4' />
              </Button>
              <div className='flex items-center gap-2'>
                <Input {...register('page')} onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit(handlePageSubmit)()
                  }
                }} className={cn('w-12 h-8', errors.page && 'focus-visible:ring-red-500')} />
                <p className='text-zinc-700 text-sm space-x-1'>
                  <span>/</span>
                  <span>{numPages ?? 'X'}</span>
                </p>
              </div>
              <Button onClick={() => { setCurrentPage((prev) => (prev + 1) < numPages! ? prev + 1: numPages!); setValue('page', String(currentPage + 1)) }} disabled={currentPage === numPages || numPages === undefined} variant='ghost' aria-label='next page'>
                <ChevronUp className='h-4 w-4' />
              </Button>
            </div>
            <div className='space-x-2'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button aria-label='zoom' variant='ghost' className='gap-1.5'>
                    <SearchIcon className='h-4 w-4' />
                    { zoom * 100} % <ChevronDown className='h-3 w-3 opacity-50' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => setZoom(1)}>
                    100%
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setZoom(1.5)}>
                    150%
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setZoom(2)}>
                    200%
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setZoom(2.5)}>
                    250%
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button  onClick={() => setRotation((prev) => prev + 90 )} variant='ghost' aria-label='rotate 90 degrees'>
                <RotateCw className='h-4 w-4' />
              </Button>
              <PdfFullscreen fileUrl={url}/>
            </div>
        </div>
        <div className='flex-1 w-full max-h-screen'>
          <SimpleBar autoHide={false} className='max-h-[calc(100vh-10rem)]'>
            <div ref={ref}>
              <Document onLoadSuccess={ ({numPages}) => setNumPages(numPages) } loading={
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
                { isLoading && renderedScale ? (<Page key={'@' + renderedScale} pageNumber={currentPage} width={width ? width : 1} scale={zoom} rotate={rotation} />) : null }
                <Page key={'@' + zoom} pageNumber={currentPage} width={width ? width : 1} scale={zoom} rotate={rotation} className={cn(isLoading ? 'hidden' : '')} loading={
                  <div className='flex justify-center'>
                    <Loader2 className='my-24 animate-spin' />
                  </div>
                } 
                  onRenderSuccess={() => setRenderedScale(zoom)}
                />
              </Document>
            </div>
          </SimpleBar>
        </div>
    </div>
    </>
  )
}

export default PdfRenderer