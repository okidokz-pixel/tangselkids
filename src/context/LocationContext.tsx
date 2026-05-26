"use client";
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export type LocationStatus = "idle" | "loading" | "granted" | "denied" | "unavailable";

type LocationContextType = {
  userLat: number | null;
  userLng: number | null;
  locationStatus: LocationStatus;
  requestLocation: () => void;
};

const CACHE_KEY = "tkGeoLocation";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

type CachedLocation = { lat: number; lng: number; ts: number };

const LocationContext = createContext<LocationContextType>({
  userLat: null, userLng: null, locationStatus: "idle", requestLocation: () => {},
});

export function LocationProvider({ children }: { children: ReactNode }) {
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return;
      const cached: CachedLocation = JSON.parse(raw);
      if (Date.now() - cached.ts < CACHE_TTL_MS) {
        setUserLat(cached.lat);
        setUserLng(cached.lng);
        setLocationStatus("granted");
      }
    } catch {}
  }, []);

  const requestLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationStatus("unavailable");
      return;
    }
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLat(latitude);
        setUserLng(longitude);
        setLocationStatus("granted");
        try {
          const payload: CachedLocation = { lat: latitude, lng: longitude, ts: Date.now() };
          localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
        } catch {}
      },
      () => {
        setLocationStatus("denied");
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: CACHE_TTL_MS },
    );
  }, []);

  return (
    <LocationContext.Provider value={{ userLat, userLng, locationStatus, requestLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}
