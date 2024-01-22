import BillingForm from '@/components/BillingForm'
import { getUserSubscriptionPlan } from '@/lib/stripe'
import React from 'react'

async function Billing() {

    const subscriptionPlan = await getUserSubscriptionPlan()

  return (
    <BillingForm subscriptionPlan={subscriptionPlan} />
  )
}

export default Billing