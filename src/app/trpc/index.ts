//import * as trpc from '@trpc/server';
import { TRPCError } from '@trpc/server';
import { privateProcedure, publicProcedure, router} from '../_trpc/server'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { db } from '@/db';

//export const appRouter = trpc.router();
export const appRouter = router({
    authCallback: publicProcedure.query(async () => {
        const {getUser} = getKindeServerSession()
        const user = await getUser()

        if (!user?.id || !user.email) throw new TRPCError({code: 'UNAUTHORIZED'})

        //check if the user is in the db
        const dbUser = await db.user.findFirst({
            where: {
                id: user.id
            }
        })

        if (!dbUser) {
            //create user in db
            await db.user.create({
                data: {
                    id: user.id,
                    email: user.email
                }
            })
        }

        return {success: true}
    }),
    getUserFiles: privateProcedure.query(async ({ ctx }) => {
        const {userId} = ctx

        return await db.file.findMany({
            where: {
                userId: userId
            }
        })
    })
});

// only export *type signature* of router!
// to avoid accidentally importing your API
// into client-side code
export type AppRouter = typeof appRouter;