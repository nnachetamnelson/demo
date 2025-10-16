import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

interface Props {
  children: JSX.Element;
}

export default function ProtectedRoute({ children }: Props) {
  const { accessToken } = useAuth();
  const savedToken = localStorage.getItem("accessToken");

  if (!accessToken && !savedToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
