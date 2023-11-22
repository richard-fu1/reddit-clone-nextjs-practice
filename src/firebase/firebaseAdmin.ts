import { initializeApp, getApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

const privateKey = process.env['PRIVATE_KEY'] ?? ''
const clientEmail = process.env['CLIENT_EMAIL']
const projectId = process.env['PROJECT_ID']

if (!privateKey || !clientEmail || !projectId) {
  console.log(
    `Failed to load Firebase credentials. Follow the instructions in the README to set your Firebase credentials inside environment variables.`
  )
}

const firebaseAdminConfig = {
  credential: cert({
    privateKey: privateKey.replace(/\\n/g, '\n'),
    clientEmail,
    projectId,
  }),
  databaseURL: `https://${projectId}.firebaseio.com`,
}

const firebaseAdmin = !getApps().length
  ? initializeApp(firebaseAdminConfig)
  : getApp()
const auth = getAuth(firebaseAdmin)
const firestore = getFirestore(firebaseAdmin)

const verifyUser = async (token: string | undefined) => {
  if (token && token.length > 0) {
    await auth.verifyIdToken(token)
  }
}

export { firebaseAdmin, auth, firestore, verifyUser }
