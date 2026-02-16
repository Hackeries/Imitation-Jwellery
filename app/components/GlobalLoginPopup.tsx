"use client";

import { useState, useEffect } from "react";
import LoginToContinueModal from "./LoginToContinue";
import { onLoginRequired } from "@/lib/auth-events";

export default function GlobalLoginPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    return onLoginRequired(() => setOpen(true));
  }, []);

  return <LoginToContinueModal open={open} onClose={() => setOpen(false)} />;
}
