import { rawClient } from "@/db"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`
    const result = await rawClient.unsafe(query)

    if (result.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Prijava uspješna",
        user: {
          id: result[0].id,
          username: result[0].username,
          email: result[0].email,
        },
        queryExecuted: query,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Neispravni podaci za prijavu",
          queryExecuted: query,
        },
        { status: 401 },
      )
    }
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Došlo je do greške",
        error: error instanceof Error ? error.message : "Nepoznata greška",
      },
      { status: 500 },
    )
  }
}
