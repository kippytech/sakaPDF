import { cn } from "@/lib/utils"
import { ReactNode } from "react"

type ContainerProps = {
    children: ReactNode
    className?: string
}

function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn("w-full mx-auto max-w-screen-xl px-3 md:px-20", className)}>{children}</div>
  )
}

export default Container