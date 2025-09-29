// src/lib/db.js
import { db, auth } from "./firebase.js"
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore"

// 🔹 Lister toutes les plantes de l’utilisateur
export async function listPlants() {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error("Utilisateur non connecté")
  const snap = await getDocs(collection(db, `users/${uid}/plants`))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// 🔹 Récupérer une plante
export async function getPlant(id) {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error("Utilisateur non connecté")
  const ref = doc(db, `users/${uid}/plants/${id}`)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error("Plante introuvable")
  return { id: snap.id, ...snap.data() }
}

// 🔹 Créer une plante
export async function createPlant(data) {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error("Utilisateur non connecté")
  return await addDoc(collection(db, `users/${uid}/plants`), {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdAtServer: serverTimestamp(),
  })
}

// 🔹 Mettre à jour une plante
export async function updatePlant(id, data) {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error("Utilisateur non connecté")
  const ref = doc(db, `users/${uid}/plants/${id}`)
  await updateDoc(ref, {
    ...data,
    updatedAt: new Date().toISOString(),
  })
}

// 🔹 Supprimer une plante
export async function deletePlant(id) {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error("Utilisateur non connecté")
  await deleteDoc(doc(db, `users/${uid}/plants/${id}`))
}

// 🔹 Marquer comme arrosée (ancien bouton Arroser)
// ⚠️ Conseil : utiliser addWatering() à la place pour garder un historique
export async function markWatered(id) {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error("Utilisateur non connecté")
  const ref = doc(db, `users/${uid}/plants/${id}`)
  const next = new Date()
  next.setDate(next.getDate() + 3)
  await updateDoc(ref, {
    lastWateredAt: new Date().toISOString(),
    nextWateringAt: next.toISOString(),
    updatedAt: new Date().toISOString(),
  })
}

// 🔹 Abonnement temps réel aux plantes
export function subscribePlants(callback) {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error("Utilisateur non connecté")
  const colRef = collection(db, `users/${uid}/plants`)
  const q = query(colRef, orderBy("createdAt", "desc"))
  return onSnapshot(q, (snap) => {
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    callback(rows)
  })
}

//
// ---------------- HISTORIQUE D’ARROSAGE ----------------
//

// 🔹 Lister les arrosages d’une plante
export async function listWaterings(plantId) {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error("Utilisateur non connecté")
  const snap = await getDocs(
    collection(db, `users/${uid}/plants/${plantId}/waterings`)
  )
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => new Date(b.wateredAt) - new Date(a.wateredAt))
}

// 🔹 Ajouter un arrosage
export async function addWatering(plantId, amountMl = null) {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error("Utilisateur non connecté")
  const base = `users/${uid}/plants/${plantId}`

  // 1) Ajout dans la sous-collection waterings
  await addDoc(collection(db, `${base}/waterings`), {
    wateredAt: new Date().toISOString(),
    ...(amountMl ? { amountMl: Number(amountMl) } : {}),
    createdAtServer: serverTimestamp(),
  })

  // 2) Mise à jour de la plante (prochain arrosage par défaut = +3 jours)
  const plantRef = doc(db, base)
  const next = new Date()
  next.setDate(next.getDate() + 3)
  await updateDoc(plantRef, {
    lastWateredAt: new Date().toISOString(),
    nextWateringAt: next.toISOString(),
    updatedAt: new Date().toISOString(),
  })
}

// 🔹 Abonnement temps réel à l’historique d’une plante
export function subscribeWaterings(plantId, callback) {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error("Utilisateur non connecté")
  const q = query(
    collection(db, `users/${uid}/plants/${plantId}/waterings`),
    orderBy("wateredAt", "desc")
  )
  return onSnapshot(q, (snap) => {
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    callback(rows)
  })
}
