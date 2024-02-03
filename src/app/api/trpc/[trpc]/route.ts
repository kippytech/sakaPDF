import { appRouter } from "@/app/trpc";
import {fetchRequestHandler} from '@trpc/server/adapters/fetch' 
import { NextRequest, NextResponse } from "next/server";

const createContext = async (req: NextRequest) => {
  //@ts-ignore
  return createNextContext({
    headers: req.headers,
    cookies: req.cookies
  })
}

const handler = (req: NextRequest) =>  {
  //cors
  if (req.method === 'OPTIONS') {
    return new NextResponse('Cors Verified', {
      headers: {
        'Access-Control-Allow-Origin': 'https://sakapdf.vercel.app',
        'Access-Control-Request-Method': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        ['dyum']: 'm'
      },
      status: 200
    })
  }

  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => ({})
  })
}
  export { handler as GET, handler as POST }