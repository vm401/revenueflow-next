import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    if (!token) {
      navigate("/signin");
    }
  }, [navigate]);

  const token = localStorage.getItem("auth-token");
  if (!token) {
    return null;
  }

  return <>{children}</>;
}