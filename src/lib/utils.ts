import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function absoluteUrl (path: string) {
  //means are on the client(client is fine with relative paths)
  if (typeof window !== 'undefined') return path

  //means are on the server & have deployed to vercel
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}${path}`

  return `http://localhost:${process.env.PORT ?? 3000}${path}`
}