"use client"

import { useEffect, useRef, useState } from "react"

const DEMO_URN = "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2UtZGVtby1idWNrZXQvZW5naW5lLmR3Zw" // URN de démo Autodesk

declare global {
  interface Window {
    Autodesk: any;
  }
}

export default function ForgeViewer() {
  const viewerRef = useRef<HTMLDivElement>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Récupérer le token depuis le backend (scope openid)
    fetch("http://localhost:3001/api/forge/token?scope=openid")
      .then(res => res.json())
      .then(data => setToken(data.access_token))
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (!token || !viewerRef.current) return

    // Charger le script du viewer Autodesk
    const script = document.createElement("script")
    script.src = "https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/viewer3D.min.js"
    script.onload = () => {
      const options = {
        env: "AutodeskProduction",
        accessToken: token,
      }
      window.Autodesk.Viewing.Initializer(options, () => {
        const viewer = new window.Autodesk.Viewing.GuiViewer3D(viewerRef.current)
        viewer.start()
        window.Autodesk.Viewing.Document.load(
          "urn:" + DEMO_URN,
          (doc: any) => {
            const defaultModel = doc.getRoot().getDefaultGeometry()
            viewer.loadDocumentNode(doc, defaultModel)
          },
          (err: any) => {
            console.error("Erreur de chargement du modèle :", err)
          }
        )
      })
    }
    document.body.appendChild(script)
    // Nettoyage
    return () => {
      if (viewerRef.current) viewerRef.current.innerHTML = ""
    }
  }, [token])

  return (
    <div>
      <div ref={viewerRef} style={{ width: "100%", height: "600px", background: "#222" }} />
      {!token && <div>Chargement du viewer Autodesk...</div>}
    </div>
  )
} 