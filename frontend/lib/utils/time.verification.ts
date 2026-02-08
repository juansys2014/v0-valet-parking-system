/**
 * Snippet de verificación para formatDurationMs y durationMs.
 * Ejecutar con: npx tsx lib/utils/time.verification.ts
 * (o desde frontend: npx tsx lib/utils/time.verification.ts)
 */
import { formatDurationMs, durationMs, formatDuration } from "./time"

function runVerification() {
  const checks: { name: string; pass: boolean }[] = []

  // formatDurationMs
  checks.push({
    name: "formatDurationMs(90_000) === '1m'",
    pass: formatDurationMs(90_000) === "1m",
  })
  checks.push({
    name: "formatDurationMs(3660000) === '1h 1m'",
    pass: formatDurationMs(3_660_000) === "1h 1m",
  })
  checks.push({
    name: "formatDurationMs(null) === '—'",
    pass: formatDurationMs(null) === "—",
  })
  checks.push({
    name: "formatDurationMs(undefined) === '—'",
    pass: formatDurationMs(undefined) === "—",
  })
  checks.push({
    name: "formatDurationMs(-100) === '—'",
    pass: formatDurationMs(-100) === "—",
  })
  checks.push({
    name: "formatDurationMs(0) === '0m'",
    pass: formatDurationMs(0) === "0m",
  })

  // durationMs (delivered - checkin)
  const t1 = new Date("2025-02-08T10:00:00Z")
  const t2 = new Date("2025-02-08T11:30:00Z") // 90 min después
  checks.push({
    name: "durationMs(t1, t2) === 90*60*1000",
    pass: durationMs(t1, t2) === 90 * 60 * 1000,
  })
  checks.push({
    name: "durationMs(t2, t1) === null (negativo)",
    pass: durationMs(t2, t1) === null,
  })
  checks.push({
    name: "durationMs(t1, null) === null",
    pass: durationMs(t1, null) === null,
  })
  checks.push({
    name: "durationMs(null, t2) === null",
    pass: durationMs(null, t2) === null,
  })
  checks.push({
    name: "durationMs con string ISO",
    pass: durationMs("2025-02-08T10:00:00Z", "2025-02-08T12:00:00Z") === 2 * 60 * 60 * 1000,
  })

  // formatDuration (combinado)
  checks.push({
    name: "formatDuration(t1, t2) === '1h 30m'",
    pass: formatDuration(t1, t2) === "1h 30m",
  })
  checks.push({
    name: "formatDuration(t1, null) === '—'",
    pass: formatDuration(t1, null) === "—",
  })

  const failed = checks.filter((c) => !c.pass)
  if (failed.length > 0) {
    console.error("Verificación fallida:\n", failed.map((c) => "  - " + c.name).join("\n"))
    process.exit(1)
  }
  console.log("Verificación OK:", checks.length, "checks")
}

runVerification()
