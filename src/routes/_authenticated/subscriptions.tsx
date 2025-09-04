import { createFileRoute } from '@tanstack/react-router'
import { Subscriptions } from '@/features/subscriptions'

export const Route = createFileRoute('/_authenticated/subscriptions')({
  component: Subscriptions,
})