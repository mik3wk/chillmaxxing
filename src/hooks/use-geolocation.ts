import { useState, useEffect, useCallback } from "react";
import { UserLocation } from "../types";

type GeoStatus = "idle" | "loading" | "granted" | "denied" | "error";

export function useGeolocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [status, setStatus] = useState<GeoStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("error");
      setErrorMsg("Geolocation is not supported by your browser");
      return;
    }

    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setStatus("granted");
        setErrorMsg(null);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setStatus(error.code === error.PERMISSION_DENIED ? "denied" : "error");
        setErrorMsg(error.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // Try to get location on mount if we already have permission
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "granted") {
          requestLocation();
        }
      });
    }
  }, [requestLocation]);

  return { location, status, errorMsg, requestLocation };
}
