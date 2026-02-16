type AuthEventCallback = () => void;

let listeners: AuthEventCallback[] = [];

export const onLoginRequired = (cb: AuthEventCallback) => {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
};

export const triggerLoginRequired = () => {
  listeners.forEach((cb) => cb());
};
