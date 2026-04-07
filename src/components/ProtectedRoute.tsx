import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

type Props = {
    children: React.ReactNode;
    adminOnly?: boolean;
};

export default function ProtectedRoute({ children, adminOnly = false }: Props) {
    const { profile, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-white">Carregando...</p>
            </div>
        );
    }

    if (!profile) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && profile.role !== "admin") {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
