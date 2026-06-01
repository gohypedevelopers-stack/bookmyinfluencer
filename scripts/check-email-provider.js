require("dotenv").config()

const nodemailer = require("nodemailer")

function compactPassword(value) {
  return value ? String(value).replace(/\s/g, "") : ""
}

async function main() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com"
  const port = Number(process.env.SMTP_PORT || 465)
  const user = process.env.SMTP_USER
  const pass = compactPassword(process.env.SMTP_PASS)

  console.log("[email:check] SMTP config", {
    host,
    port,
    secure: port === 465,
    user: user || null,
    passSet: Boolean(pass),
    passLength: pass.length,
    from: process.env.FROM_EMAIL || process.env.SMTP_FROM || user || null,
  })

  if (!user || !pass) {
    throw new Error("Missing SMTP_USER or SMTP_PASS")
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })

  await transporter.verify()
  console.log("[email:check] SMTP login OK")
}

main().catch((error) => {
  const responseCode = error && typeof error === "object" ? error.responseCode : undefined
  const code = error && typeof error === "object" ? error.code : undefined
  const message = error instanceof Error ? error.message : String(error)

  if (code === "EAUTH" || responseCode === 535 || /username and password not accepted/i.test(message)) {
    console.error(
      "[email:check] Gmail rejected SMTP credentials. Create a new Google App Password for SMTP_USER, set it as SMTP_PASS, and restart the dev server."
    )
  } else {
    console.error("[email:check]", message)
  }

  process.exit(1)
})
