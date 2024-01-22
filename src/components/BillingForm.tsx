'use client'

import { getUserSubscriptionPlan } from "@/lib/stripe"
import { useToast } from "./ui/use-toast"
import { trpc } from "@/app/_trpc/client"
import Container from "./Container"
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card"

type BillingFormProps = {
    subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>
}

function BillingForm({subscriptionPlan}: BillingFormProps) {

    const {toast} = useToast()

    const { mutate: createStripeSession, isLoading } = trpc.createStripeSession.useMutation()
    //     onSuccess: ({ url }) => {
    //         if(url) window.location.href = url 
    //         if (!url) {
    //             toast({
    //                 title: 'There was a problem...',
    //                 description: 'Please try again in a moment',
    //                 variant: 'destructive'
    //             })
    //         }
    //     }
    // })

  return (
    <Container className="max-w-5xl">
        <form className="mt-12" onSubmit={(e) => {
            e.preventDefault()
            createStripeSession()
        }}>
            <Card>
                <CardHeader>
                    <CardTitle>Subscription Plan</CardTitle>
                    <CardDescription>You are currently on the <strong>{subscriptionPlan.name}</strong> plan</CardDescription>
                </CardHeader>
            </Card>
        </form>
    </Container>
  )
}

export default BillingForm