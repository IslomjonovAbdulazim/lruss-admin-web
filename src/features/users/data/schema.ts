import { z } from 'zod'

const userSchema = z.object({
  id: z.number(),
  telegram_id: z.number(),
  phone_number: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  avatar_url: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
})
export type User = z.infer<typeof userSchema>

export const userListSchema = z.array(userSchema)
