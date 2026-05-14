import React from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { hasStoredToken, syncTokenToSession } from "../hooks/useAuth";

export default function RequireAuthForCave({ children, redirectTo = "/sommelier" }) {
    const { id } = useParams();
    const location = useLocation();
    syncTokenToSession();
    const isLoggedIn = hasStoredToken();

    const requiresLogin = id === "cave";

    if (requiresLogin && !isLoggedIn) {
        return <Navigate to={redirectTo} replace state={{ from: location }} />;
    }
    return children;
}
