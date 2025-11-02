import { db } from "@/db"
import { users } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const loginSchema = z.object({
  username: z.string().min(1).max(255),
  password: z.string().min(1).max(255),
})

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
          message: "Neispravni parametri",
        },
        { status: 400 },
      )
    }

    const validatedData = loginSchema.parse(body)
    const { username, password } = validatedData

    const result = await db
      .select()
      .from(users)
      .where(and(eq(users.username, username), eq(users.password, password)))
      .limit(1)

    if (result.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Prijava uspješna (sigurna verzija)",
        user: {
          id: result[0].id,
          username: result[0].username,
          email: result[0].email,
        },
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Neispravni podaci za prijavu",
        },
        { status: 401 },
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
        { status: 400 },
      )
    }

    console.error("Login error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Došlo je do greške",
      },
      { status: 500 },
    )
  }
}
