import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const role = useSelector((state) => state.auth.role);
    console.log("role", role); 

    if (!role) {
        // Not logged in
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(role)) {
        // Logged in but not authorized
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
