import { getUserSubscriptionPlan } from "@/lib/stripe"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Button } from "./ui/button"
import { Icons } from "./Icons"
import Link from "next/link"
import { Gem } from "lucide-react"
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/server"
import { Avatar, AvatarFallback } from "./ui/avatar"
import Image from "next/image"

type UserAccountNavProps = {
    name: string
    email: string | undefined
    imageUrl: string
}

async function UserAccountNav({ name, email, imageUrl }: UserAccountNavProps) {

    const subscriptionPlan = await getUserSubscriptionPlan()

  return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild className="overflow-visible">
            <Button className="rounded-full h-8 w-8 aspect-square bg-slate-400">
                <Avatar className='relative w-8 h-8'>
                    {imageUrl ? (
                        <div className='relative w-full h-full aspect-square'>
                            <Image fill src={imageUrl} alt='profile-picture' referrerPolicy='no-referrer' />
                        </div>
                    ) : (
                        <AvatarFallback>
                            <span className="sr-only">{name}</span>
                            <Icons.user className="h-4 w-4 text-zinc-800" />
                        </AvatarFallback> 
                        )}
                </Avatar>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='bg-white' align='end'>
            <div className='flex items-center justify-start gap-2 p-2'>
                <div className='flex flex-col space-y-0.5 leading-none'>
                    {name && <p className="font-medium text-sm text-black">{name}</p>}
                    {email && (
                        <p className='w-[200px] truncate text-sm text-zinc-700'>{email}</p>
                    )}
                </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link href='/dashboard'>Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
                {subscriptionPlan.isSubscribed ? (
                    <Link href='/dashboard/billing'>Manage Subscription</Link>
                ) : (
                    <Link href='/pricing'>Upgrade <Gem className="text-blue-600 h-4 w-4 ml-1.5" /></Link>
                ) }
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
                <LogoutLink>Logout</LogoutLink>
            </DropdownMenuItem>
            </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserAccountNav