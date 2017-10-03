import firebase from 'firebase'
import Config from 'react-native-config'

const config = {
  apiKey: Config.FB_API_KEY,
  authDomain: Config.FB_AUTH_DOMAIN,
  databaseURL: Config.FB_DATABASE_URL,
  storageBucket: Config.FB_STORAGE_BUCKET,
  messagingSenderId: Config.FB_MESSAGING_SENDER_ID,
}
firebase.initializeApp(config)

export const firebaseDb = firebase.database()
export const firebaseAuth = firebase.auth()
