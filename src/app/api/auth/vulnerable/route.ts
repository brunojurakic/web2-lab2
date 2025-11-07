import { db } from "@/db"
import { users } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()
    const userCheck = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1)

    if (userCheck.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Korisničko ime ne postoji",
        },
        { status: 401 }
      )
    }

    const result = await db
      .select()
      .from(users)
      .where(and(eq(users.username, username), eq(users.password, password)))
      .limit(1)

    if (result.length > 0) {
      const weakSessionToken = `user-${result[0].id}`

      return NextResponse.json({
        success: true,
        message: "Prijava uspješna",
        user: {
          id: result[0].id,
          username: result[0].username,
          email: result[0].email,
        },
        sessionToken: weakSessionToken,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Lozinka je netočna",
        },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      {
        success: false,
        message: "Došlo je do greške",
      },
      { status: 500 }
    )
  }
}
