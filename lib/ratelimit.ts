import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { env } from '@/lib/env'

/**
 * Sliding-window rate limiting for anonymous participant writes.
 * No-op (always allows) when Upstash is not configured — so local dev works
 * without Redis. Configure UPSTASH_REDIS_REST_URL/TOKEN in production.
 */
const redis =
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN })
    : null

const questionLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, '1 m'), prefix: 'qanda:q', analytics: false })
  : null

const voteLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(40, '1 m'), prefix: 'qanda:v', analytics: false })
  : null

export async function allowQuestion(key: string): Promise<boolean> {
  if (!questionLimiter) return true
  return (await questionLimiter.limit(key)).success
}

export async function allowVote(key: string): Promise<boolean> {
  if (!voteLimiter) return true
  return (await voteLimiter.limit(key)).success
}
