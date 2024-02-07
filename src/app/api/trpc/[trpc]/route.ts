import { appRouter } from "@/app/trpc";
import {fetchRequestHandler} from '@trpc/server/adapters/fetch' 

const handler = async (req: Request) =>  
 
   fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => ({})
  })

  export { handler as GET, handler as POST }