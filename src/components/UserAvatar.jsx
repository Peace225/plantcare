// src/components/UserAvatar.jsx
import { useEffect, useState } from "react"
import { listenAuth } from "../lib/firebase.js"

function initialsFromEmail(email) {
  if (!email) return "?"
  const base = email.split("@")[0].replace(/\W+/g, " ").trim()
  const parts = base.split(" ").filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export default function UserAvatar({ size = 36, className = "" }) {
  const [user, setUser] = useState(null)
  useEffect(() => listenAuth(setUser), [])

  const style = { width: size, height: size }

  if (user?.photoURL) {
    return (
      <img
        src={user.photoURL}
        alt="avatar"
        style={style}
        className={`rounded-full object-cover border ${className}`}
      />
    )
  }

  return (
    <div
      style={style}
      className={`rounded-full border bg-gray-100 text-gray-700 flex items-center justify-center text-sm font-medium ${className}`}
      title={user?.email || "Invité"}
    >
      {initialsFromEmail(user?.email)}
    </div>
  )
}
