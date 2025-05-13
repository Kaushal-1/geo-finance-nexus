
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const ProtectedRoute = ({ children, redirectTo = "/signin" }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    // You could show a loading spinner here
    return <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-[#0a0e17] to-[#131b2e]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal mx-auto"></div>
        <p className="mt-3 text-teal">Loading...</p>
      </div>
    </div>;
  }

  if (!user) {
    return <Navigate to={redirectTo} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
