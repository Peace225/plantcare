import { storage, auth } from "./firebase.js"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { updateProfile } from "firebase/auth"

// Upload avatar utilisateur
export async function uploadUserAvatar(file) {
  const user = auth.currentUser
  if (!user) throw new Error("Utilisateur non connecté")
  const path = `users/${user.uid}/profile.jpg`
  const r = ref(storage, path)
  await uploadBytes(r, file)
  const url = await getDownloadURL(r)
  await updateProfile(user, { photoURL: url })
  return url
}

// Upload image d'une plante -> retourne l'URL publique
export async function uploadPlantImage(uid, file) {
  if (!uid) throw new Error("Utilisateur non connecté")
  // nom unique: timestamp + nom original
  const safeName = file.name?.replace(/[^\w.\-]+/g, "_") || "image.jpg"
  const path = `users/${uid}/plants/${Date.now()}-${safeName}`
  const r = ref(storage, path)
  await uploadBytes(r, file)           // <-- upload dans le backend
  return await getDownloadURL(r)       // <-- URL à stocker dans Firestore
}
