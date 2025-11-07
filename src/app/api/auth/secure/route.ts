import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import crypto from "crypto"
import bcrypt from "bcryptjs"
import { RateLimiterMemory } from "rate-limiter-flexible"

const sessionStore = new Map<
  string,
  { userId: number; username: string; email: string; createdAt: number }
>()

export function getSessionStore() {
  return sessionStore
}

const loginSchema = z.object({
  username: z.string().min(1).max(255),
  password: z.string().min(1).max(255),
})

const rateLimiter = new RateLimiterMemory({
  keyPrefix: "login_attempts",
  points: 3,
  duration: 120,
  blockDuration: 120,
})

function getRateLimitKey(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0] : "unknown"
  return ip
}

function generateSecureToken(): string {
  return crypto.randomBytes(16).toString("hex")
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (
      typeof body.username !== "string" ||
      typeof body.password !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Neispravni podatci",
        },
        { status: 400 }
      )
    }

    const rateLimitKey = getRateLimitKey(req)

    let attempts = 1
    try {
      const resConsume = await rateLimiter.consume(rateLimitKey)
      attempts = resConsume.consumedPoints
    } catch (e: unknown) {
      const rejection = e as { msBeforeNext: number }
      const msBeforeNext = rejection.msBeforeNext / 1000
      return NextResponse.json(
        {
          success: false,
          message: `Previše pokušaja prijave. Pričekajte ${Math.ceil(
            msBeforeNext
          )} sekundi.`,
          rateLimited: true,
          attempts: 3,
        },
        { status: 429 }
      )
    }

    const validatedData = loginSchema.parse(body)
    const { username, password } = validatedData

    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1)

    if (result.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Neispravno korisničko ime ili lozinka",
          attempts,
        },
        { status: 401 }
      )
    }

    const user = result[0]
    let passwordValid = false

    if (user.password_hash) {
      passwordValid = await bcrypt.compare(password, user.password_hash)
    }

    if (!passwordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Neispravno korisničko ime ili lozinka",
          attempts,
        },
        { status: 401 }
      )
    }

    if (passwordValid) {
      const secureSessionToken = generateSecureToken()

      sessionStore.set(secureSessionToken, {
        userId: user.id,
        username: user.username,
        email: user.email || "",
        createdAt: Date.now(),
      })

      return NextResponse.json({
        success: true,
        message: "Prijava uspješna",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
        sessionToken: secureSessionToken,
        attempts,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Neispravni podaci za prijavu",
          attempts,
        },
        { status: 401 }
      )
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Neispravni podaci",
          errors: error.issues,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: "Došlo je do greške",
      },
      { status: 500 }
    )
  }
}
