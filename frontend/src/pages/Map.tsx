import { useEffect, useRef, useState } from "react"

import type { ExamSession } from "@/components/exam/types"
import api from "@/utils/api"
import { type ApiExam, mapExamListFromApi } from "@/utils/mapExamResponse"

const mapStyles = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#181818" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "poi.park", elementType: "labels.text.stroke", stylers: [{ color: "#1b1b1b" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#373737" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
  { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#4e4e4e" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] },
]

const GOOGLE_SCRIPT_ID = "google-maps-script"

interface LatLngLiteral {
  lat: number
  lng: number
}

interface GoogleMapInstance {
  panTo: (center: LatLngLiteral) => void
  setZoom: (zoom: number) => void
}

interface GoogleMarkerInstance {
  setMap: (map: GoogleMapInstance | null) => void
}

interface GoogleMapsAPI {
  Map: new (
    element: HTMLElement,
    options: {
      center: LatLngLiteral
      zoom: number
      disableDefaultUI?: boolean
      styles?: unknown
    }
  ) => GoogleMapInstance
  Marker: new (options: { position: LatLngLiteral; map: GoogleMapInstance; title?: string }) => GoogleMarkerInstance
}

declare global {
  interface Window {
    initExamMap?: () => void
    google?: {
      maps?: GoogleMapsAPI
    }
  }
}

function loadGoogleMaps(apiKey: string, onReady: () => void) {
  if (typeof window === "undefined") return

  if (window.google?.maps) {
    onReady()
    return
  }

  window.initExamMap = () => {
    onReady()
    delete window.initExamMap
  }

  const existingScript = document.getElementById(GOOGLE_SCRIPT_ID)
  if (existingScript) {
    existingScript.addEventListener("load", onReady, { once: true })
    return
  }

  const script = document.createElement("script")
  script.id = GOOGLE_SCRIPT_ID
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initExamMap`
  script.async = true
  script.defer = true
  script.onerror = () => console.error("Failed to load Google Maps script")
  document.head.appendChild(script)
}

export default function MapPage() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<GoogleMapInstance | null>(null)
  const markersRef = useRef<GoogleMarkerInstance[]>([])
  const [isReady, setIsReady] = useState(false)
  const [sessions, setSessions] = useState<ExamSession[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY
    if (!apiKey) {
      console.warn("Missing VITE_GOOGLE_MAPS_KEY. Map will not load.")
      return
    }

    loadGoogleMaps(apiKey, () => setIsReady(true))
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function fetchSessions() {
      setIsLoading(true)
      setError(null)

      try {
        const { data } = await api.get<ApiExam[]>("/exams", { signal: controller.signal })
        setSessions(mapExamListFromApi(data))
      } catch (fetchError) {
        if ((fetchError as Error).name === "CanceledError") {
          return
        }
        console.error("Failed to load exam sessions for map", fetchError)
        setError("Unable to load exam locations right now.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSessions()

    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!isReady || !mapContainerRef.current) return

    const maps = window.google?.maps
    if (!maps) return

    const firstSessionWithCoordinates = sessions.find(
      (session) => Number.isFinite(session.location.latitude) && Number.isFinite(session.location.longitude)
    )

    const initialCenter: LatLngLiteral = firstSessionWithCoordinates
      ? {
          lat: firstSessionWithCoordinates.location.latitude,
          lng: firstSessionWithCoordinates.location.longitude,
        }
      : { lat: 20, lng: 0 }

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new maps.Map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 4,
        disableDefaultUI: true,
        styles: mapStyles,
      })
    } else {
      mapInstanceRef.current.panTo(initialCenter)
    }
  }, [isReady, sessions])

  useEffect(() => {
    const map = mapInstanceRef.current
    const maps = window.google?.maps
    if (!map || !maps) return

    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []

    sessions.forEach((session) => {
      if (!Number.isFinite(session.location.latitude) || !Number.isFinite(session.location.longitude)) {
        return
      }

      const marker = new maps.Marker({
        position: {
          lat: session.location.latitude,
          lng: session.location.longitude,
        },
        map,
        title: session.title,
      })

      markersRef.current.push(marker)
    })
  }, [sessions])

  return (
    <main className="space-y-4">
      <header className="space-y-1">
        <center>
        <h1 className="text-2xl font-semibold tracking-tight" style={{marginTop:"30px"}}>Exam Sessions Map</h1>
        <p className="text-sm text-muted-foreground">View All Exam Session Locations.</p>
        </center>
      </header>

      <div className="rounded-2xl border border-border/0 bg-[#e1e5fe]/0 p-10 shadow-sm">
        {error ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : (
          <>
            {isLoading ? <p className="pb-3 text-sm text-muted-foreground">Loading Exam Locations or Check Internet Connection…</p> : null}
            <div ref={mapContainerRef} className="h-[720px] w-full rounded-xl" />
          </>
        )}
      </div>
    </main>
  )
}
