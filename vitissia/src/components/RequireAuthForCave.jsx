import React from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";

export default function RequireAuthForCave({ children, redirectTo = "/sommelier" }) {
    const { id } = useParams();
    const location = useLocation();
    const isLoggedIn = !!sessionStorage.getItem("token");

    const requiresLogin = id === "cave";

    if (requiresLogin && !isLoggedIn) {
        return <Navigate to={redirectTo} replace state={{ from: location }} />;
    }
    return children;
}
