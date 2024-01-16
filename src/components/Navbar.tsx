import Link from "next/link"
import Container from "./Container"
import { buttonVariants } from "./ui/button"
import {LoginLink, RegisterLink} from '@kinde-oss/kinde-auth-nextjs/server'
import { ArrowRight } from "lucide-react"


function Navbar() {
  return (
    <nav className="sticky h-14 inset-x-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition">
        <Container>
            <div className="flex h-14 items-center justify-between border-b border-zinc-200">
                <Link href='/' className="flex z-40 font-semibold">
                    <span>sakaPDF</span>
                </Link>
                <div className="hidden sm:flex items-center space-x-4">
                    <>
                        <Link href='/pricing' className={buttonVariants({variant: 'ghost', size: 'sm'})}>Pricing</Link>
                        <LoginLink className={buttonVariants({variant: 'ghost', size: 'sm'})}>Login</LoginLink>
                        <RegisterLink className={buttonVariants({size: 'sm'})}>Getstarted <ArrowRight className="ml-2 h-5 w-5" /></RegisterLink>
                    </>
                </div>
            </div>
        </Container>
    </nav>
  )
}

export default Navbar