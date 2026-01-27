import { NextResponse } from "next/server"

import { verifyEmailProvider } from "@/lib/mailer"

export async function GET() {
  const status = await verifyEmailProvider()
  return NextResponse.json(status, {
    status: status.ok ? 200 : 500,
  })
}
