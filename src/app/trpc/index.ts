//import * as trpc from '@trpc/server';
import { TRPCError } from '@trpc/server';
import { privateProcedure, publicProcedure, router} from '../_trpc/server'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { db } from '@/db';
import {z} from 'zod'
import { INFINITE_QUERY_LIMIT } from '@/config/infiniteQuery';
import { absoluteUrl } from '@/lib/utils';
import { getUserSubscriptionPlan, stripe } from '@/lib/stripe';
import { PLANS } from '@/config/stripe';

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

        const files =  await db.file.findMany({
            where: {
                userId: userId
            }
        })

        if (files.length === 0) throw new TRPCError({code: 'NOT_FOUND'})

        return files
    }),
    createStripeSession: privateProcedure.mutation(async ({ctx}) => {
        try {
        const {userId} = ctx

        //cant use relative urls in server
        const billingUrl = absoluteUrl('/dashboard/billing')

        if (!userId) return new TRPCError({code: 'UNAUTHORIZED'})

        const dbUser = await db.user.findFirst({
            where: {
                id: userId,
            }
        })

        if (!dbUser) return new TRPCError({code: 'UNAUTHORIZED'})

        const subscriptionPlan = await getUserSubscriptionPlan()

        if (subscriptionPlan.isSubscribed && dbUser.stripeCustomerId) {
            const stripeSession = await stripe.billingPortal.sessions.create({
                customer: dbUser.stripeCustomerId,
                return_url: billingUrl
            })

            return { url: stripeSession.url}
        }

        const stripeSession = await stripe.checkout.sessions.create({
            success_url: billingUrl,
            cancel_url: billingUrl,
            payment_method_types: ['card', 'paypal'],
            mode: 'subscription',
            billing_address_collection: 'auto',
            line_items: [
                {
                    price: PLANS.find((plan) => plan.name === 'Pro')?.price.priceIds.test,
                    quantity: 1
                }
            ],
            metadata: {
                userId: userId  //for webhooks
            }
        })

        return { url: stripeSession.url }
    } catch (error) {
        console.log(error)
    }
    }),
    getFileMessages: privateProcedure.input(
        z.object({
            limit: z.number().min(1).max(100).nullish(),
            cursor: z.string().nullish(),
            fileId: z.string()
        })
    ).query(async ({ ctx, input }) => {
        const {userId} = ctx
        const {fileId, cursor} = input
        const limit = input.limit ?? INFINITE_QUERY_LIMIT

        const file = await db.file.findFirst({
            where: {
                id: fileId,
                userId
            }
        })

        if (!file) throw new TRPCError({code: 'NOT_FOUND'})

        const messages = await db.message.findMany({
            take: limit + 1,
            where: {
                fileId
            },
            orderBy: {
                createdAt: 'desc'
            },
            cursor: cursor ? {id: cursor} : undefined,
            select: {
                id: true,
                isUserMessage: true,
                createdAt: true,
                text: true
            }
        })

        //logic for next cursor
        let nextCursor: typeof cursor | undefined 
        if (messages.length > limit) {
            const nextItem = messages.pop()
            nextCursor = nextItem?.id
        }

        return {
            messages,
            nextCursor
        }
    }),
    getFileUploadStatus: privateProcedure.input(z.object({fileId: z.string()})).query(async ({ ctx, input }) => {

        const file = await db.file.findFirst({
            where: {
                id: input.fileId,
                userId: ctx.userId
            }
        })

        if (!file) return {status: 'PENDING' as const}

        return {status: file.uploadStatus}
    }),
    getFile: privateProcedure.input(z.object({key: z.string()})).mutation(async ({ ctx, input }) => {
        const {userId} = ctx

        const file = await db.file.findFirst({
            where: {
                id: input.key,
                userId
            }
        })

        if (!file) throw new TRPCError({code: 'NOT_FOUND'})

        return file
    }),
    getFileForRender: privateProcedure.input(z.object({id: z.string()})).query(async ({ ctx, input }) => {
        const {userId} = ctx

        const file = await db.file.findFirst({
            where: {
                id: input.id,
                userId
            }
        })

        if (!file) throw new TRPCError({code: 'NOT_FOUND'})

        return file
    }),
    deleteFile: privateProcedure.input(z.object({id: z.string()})).mutation(async ({ ctx, input }) => {
        const {userId} = ctx

        const file = await db.file.findFirst({
            where: {
                id: input.id,
                userId
            }
        })

        if (!file) throw new TRPCError({code: 'NOT_FOUND'})

        await db.file.delete({
            where: {
                id: input.id
            }
        })

        return file //no need tho'
    })
});

// only export *type signature* of router!
// to avoid accidentally importing your API
// into client-side code
export type AppRouter = typeof appRouter;