import { KindeUser } from '@kinde-oss/kinde-auth-nextjs/dist/types'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { redirect } from 'next/navigation'
import React from 'react'

async function Dashboard() {
    const {getUser} = getKindeServerSession()
    const user:any = await getUser()

    if (!user || !user.id) redirect('/auth-callback?origin=dashboard')
    
  return (
    <div>{user.email}</div>
  )
}

export default Dashboard