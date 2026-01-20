export function isRunningInRNWebView() {
    return typeof window !== "undefined" && !!window.ReactNativeWebView;
}

export function openSubscriptionScreen() {
    if (!isRunningInRNWebView()) return false;
    window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: "OPEN_SUBSCRIPTION_SCREEN" })
    );
    return true;
}
