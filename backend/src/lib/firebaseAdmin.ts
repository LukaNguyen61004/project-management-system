import { readFileSync, existsSync } from "fs"
import { dirname, join } from "path"
import { fileURLToPath } from "url"
import admin from "firebase-admin"

const __dirname = dirname(fileURLToPath(import.meta.url))

const LOCAL_SERVICE_ACCOUNT_FILE =
  "project-managment-system-484e2-firebase-adminsdk-fbsvc-5de575a2be.json"

function loadServiceAccount(): admin.ServiceAccount | null {
  const fromEnv = process.env.FIREBASE_SERVICE_ACCOUNT
  if (fromEnv) {
    try {
      return JSON.parse(fromEnv) as admin.ServiceAccount
    } catch {
      console.error("[firebase-admin] FIREBASE_SERVICE_ACCOUNT is not valid JSON")
      return null
    }
  }

  const localPath = join(__dirname, "../..", LOCAL_SERVICE_ACCOUNT_FILE)
  if (existsSync(localPath)) {
    return JSON.parse(readFileSync(localPath, "utf-8")) as admin.ServiceAccount
  }

  return null
}

const serviceAccount = loadServiceAccount()

if (serviceAccount && !admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
} else if (!serviceAccount) {
  console.warn(
    "[firebase-admin] Not configured — set FIREBASE_SERVICE_ACCOUNT on server or add local JSON file. Google login disabled."
  )
}

export function isFirebaseAdminReady(): boolean {
  return admin.apps.length > 0
}

export default admin
