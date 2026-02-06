export const isRunningInRNWebView = () => {
  if (typeof window === "undefined") return false;
  return !!window.ReactNativeWebView; // ✅ fiable
};


export function openSubscriptionScreen() {
    if (!isRunningInRNWebView()) return false;
    window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: "OPEN_SUBSCRIPTION_SCREEN" })
    );
    return true;
}
