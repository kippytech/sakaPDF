import { type ClassValue, clsx } from "clsx"
import { Metadata } from "next"
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

export function generateMetadata({
  title = 'sakaPDF',
  description = 'sakaPDF is an ai software to make chatting with your pdf files easy.',
  image = '/thumbnail.png',
  icons = '/favicon.ico',
  noIndex = false
}: {
  title?: string,
  description?: string,
  image?: string,
  icons?: string,
  noIndex?: boolean
} = {}): Metadata {

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@kipyegosancho'
    },
    icons,
    metadataBase: new URL('https://sakapdf.vercel.app'),
    themeColor: '#FFF',
    ...(noIndex && {
      robots: {
        index: false,
        follow: false
      }
    })
  }
}