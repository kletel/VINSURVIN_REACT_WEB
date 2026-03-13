export const isRunningInRNWebView = () => {
  if (typeof window === "undefined") return false;
  if (window.ReactNativeWebView) return true;

  // Fallback: utile quand le bridge RN est injecté avec un léger délai.
  try {
    const appHost =
      sessionStorage.getItem("APP_HOST") || localStorage.getItem("APP_HOST");
    const rnEnv =
      sessionStorage.getItem("RN_ENV") || localStorage.getItem("RN_ENV");
    return appHost === "rn" || rnEnv === "rn";
  } catch {
    return false;
  }
};


export function openSubscriptionScreen() {
    if (typeof window === "undefined") return false;
    const bridge = window.ReactNativeWebView;
    if (!bridge || typeof bridge.postMessage !== "function") return false;
    bridge.postMessage(JSON.stringify({ type: "OPEN_SUBSCRIPTION_SCREEN" }));
    return true;
}
