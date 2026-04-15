import { FC, ReactNode } from "react";
import { Navigate } from "react-router-dom";
import authStore from "../context/auth";
import { useStore } from "zustand";

type Props = {
  children: ReactNode;
  fallbackPath?: string;
  roles?: string[];
};

export const ProtectedRoute: FC<Props> = ({
  children,
  fallbackPath,
  roles,
}) => {
  const user = useStore(authStore, (state) => state.user);
  if (!user) {
    return <Navigate to={fallbackPath || "/"} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={fallbackPath || "/"} replace />;
  }
  return children;
};
