//create a router instance

import { initTRPC } from "@trpc/server";

//imitialize tRPC backend
const t = initTRPC.create()

//export reusable router & procedure helpers that can be used throughout the router

export const router = t.router

export const publicProcedure = t.procedure