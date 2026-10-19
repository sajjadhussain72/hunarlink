import { betterAuth } from 'better-auth'
import { Pool } from 'pg'

const origin = (value?: string) => value ? (value.startsWith('http') ? value : `https://${value}`) : undefined
const trustedOrigins = [
  'http://localhost:3000',
  origin(process.env.V0_RUNTIME_URL), origin(process.env.V0_DEV_APP_URL), origin(process.env.V0_BUILD_URL), origin(process.env.V0_SANDBOX_URL),
  origin(process.env.VERCEL_URL), origin(process.env.VERCEL_PROJECT_PRODUCTION_URL),
].filter(Boolean) as string[]

export const auth = betterAuth({
  database: new Pool({ connectionString: process.env.DATABASE_URL }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: origin(process.env.BETTER_AUTH_URL) ?? origin(process.env.VERCEL_PROJECT_PRODUCTION_URL) ?? origin(process.env.VERCEL_URL) ?? origin(process.env.V0_RUNTIME_URL),
  trustedOrigins,
  emailAndPassword: { enabled: true },
  user: { additionalFields: { phone: { type: 'string', required: false }, role: { type: 'string', required: false, defaultValue: 'CUSTOMER' }, status: { type: 'string', required: false, defaultValue: 'ACTIVE' } } },
  advanced: process.env.NODE_ENV === 'development' ? { defaultCookieAttributes: { sameSite: 'none', secure: true } } : undefined,
})
