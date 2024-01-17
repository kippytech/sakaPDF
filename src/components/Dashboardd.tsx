import React from 'react'
import UploadButton from './UploadButton'

function Dashboard() {
  return (
    <main className='max-w-7xl mx-auto md:p-10'>
      <div className='mt-8 flex flex-col items-start justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:gap-0'>
        <h1 className='mb-3 font-bold text-5xl text-slate-800'>My files</h1>
        <UploadButton />
      </div>
      {/* display all the files by user */}
    </main>
  )
}

export default Dashboard