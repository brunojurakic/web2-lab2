import { NextRequest, NextResponse } from "next/server"
import { getSessionStore } from "../route"

export async function POST(req: NextRequest) {
  try {
    const { sessionToken } = await req.json()
    const sessionStore = getSessionStore()
    const session = sessionStore.get(sessionToken)

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Neispravan ili nepostojeći session token",
        },
        { status: 401 }
      )
    }

    const SESSION_TIMEOUT = 60 * 60 * 1000
    if (Date.now() - session.createdAt > SESSION_TIMEOUT) {
      sessionStore.delete(sessionToken)
      return NextResponse.json(
        {
          success: false,
          message: "Session je istekao",
        },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Session je valjan",
      user: {
        id: session.userId,
        username: session.username,
        email: session.email,
      },
    })
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
