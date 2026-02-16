"use client";

import { useEffect, useRef } from "react";
import { registerDevice } from "@/services/auth-service";

export default function AppInitializer() {
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    const initApp = async () => {
      try {
        const { device, customer } = await registerDevice();
        if (device) {
          localStorage.setItem("device_data", JSON.stringify(device));
        }
        if (customer) {
          localStorage.setItem("authenticatedUser", JSON.stringify(customer));
          localStorage.setItem("hasSeenSubscribePopup", "true");
        } else {
          localStorage.removeItem("authenticatedUser");
        }
      } catch (error) {
        console.error("App Initialization Failed:", error);
      }
    };

    initApp();
  }, []);

  return null;
}
