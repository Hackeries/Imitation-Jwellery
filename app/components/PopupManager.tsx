"use client";

import { useState, useEffect } from "react";
import SubscribePopup from "./SubscribePopup";
import { usePathname } from "next/navigation";

export default function PopupManager() {
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const isAuthPage =
      pathname.includes("/sign-in") || pathname.includes("/sign-up");
    const isCheckout = pathname.includes("/checkout");

    if (isAuthPage || isCheckout) return;

    const hasSeen = localStorage.getItem("hasSeenSubscribePopup");
    if (hasSeen) return;

    const storedUser = localStorage.getItem("authenticatedUser");
    if (storedUser) return;

    const storedDevice = localStorage.getItem("device_data");
    let deviceHasEmail = false;
    if (storedDevice) {
      try {
        const device = JSON.parse(storedDevice);
        if (device.email || device.contactEmail) {
          deviceHasEmail = true;
        }
      } catch (e) {
        console.error("Error parsing device data", e);
      }
    }

    if (deviceHasEmail) return;

    const timer = setTimeout(() => {
      setSubscribeOpen(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, [pathname]);

  const handleClose = () => {
    setSubscribeOpen(false);
    localStorage.setItem("hasSeenSubscribePopup", "true");
  };

  return <SubscribePopup open={subscribeOpen} onClose={handleClose} />;
}
