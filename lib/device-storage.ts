const DEVICE_ID_KEY = "privora_device_id";

const cyrb53 = (str: string, seed = 0) => {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

const generateSystemFingerprint = (): string => {
  if (typeof window === "undefined") return "server-side-id";

  try {
    const { screen, navigator } = window;
    const specs = [
      navigator.userAgent,
      navigator.language,
      screen.colorDepth,
      screen.width + "x" + screen.height,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency || "unknown",
      navigator.maxTouchPoints || 0,
    ];

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.textBaseline = "top";
        ctx.font = "14px 'Arial'";
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = "#069";
        ctx.fillText("Privora_Fingerprint_v1", 2, 15);
        ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
        ctx.fillText("Privora_Fingerprint_v1", 4, 17);
        specs.push(canvas.toDataURL());
      }
    } catch (e) {
    }

    const rawString = specs.join("||");
    const hash = cyrb53(rawString);

    return `dev-${hash.toString(16)}`;
  } catch (error) {
    return `fallback-${Date.now()}`;
  }
};

export const getLocal = <T>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch (e) {
    return fallback;
  }
};

export const setLocal = <T>(key: string, value: T): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // ignore
  }
};

export const getDeviceId = (): string => {
  if (typeof window === "undefined") return "server";

  try {
    const systemId = generateSystemFingerprint();
    const storedId = localStorage.getItem(DEVICE_ID_KEY);

    if (storedId !== systemId) {
      localStorage.setItem(DEVICE_ID_KEY, systemId);
    }

    return systemId;
  } catch (error) {
    return `temp-${Date.now()}`;
  }
};
