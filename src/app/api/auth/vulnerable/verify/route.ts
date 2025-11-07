import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { sessionToken } = await req.json()
    const match = sessionToken.match(/^user-(\d+)$/)

    if (!match) {
      return NextResponse.json(
        {
          success: false,
          message: "Neispravan session token format",
        },
        { status: 401 }
      )
    }

    const userId = parseInt(match[1])
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (result.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Session hijacking uspio, pristup tuđem računu bez lozinke.",
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
          message: "Korisnik nije pronađen",
        },
        { status: 404 }
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
