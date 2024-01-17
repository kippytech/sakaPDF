import { db } from '@/db'
import { KindeUser } from '@kinde-oss/kinde-auth-nextjs/dist/types'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { redirect } from 'next/navigation'
import Dashboardd from '@/components/Dashboardd'

async function Dashboard() {
    const {getUser} = getKindeServerSession()
    const user: any = await getUser()

    if (!user || !user.id) redirect('/auth-callback?origin=dashboard')

    const dbUser = await db.user.findFirst({
      where: {
        id: user.id
      }
    })

    if (!dbUser) redirect('/auth-callback?origin=dashboard')
    
  return (
    <Dashboardd />
  )
}

export default Dashboard