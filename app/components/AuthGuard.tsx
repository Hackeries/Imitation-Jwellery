"use client";

import { useUserProfile, isAuthenticated } from "@/hooks/use-auth";
import LoginToContinueModal from "@/app/components/LoginToContinue";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { data: user, isLoading } = useUserProfile();
  const userIsAuthenticated = isAuthenticated(user);

  const hasToken =
    typeof window !== "undefined" &&
    !!(localStorage.getItem("token") || localStorage.getItem("authToken"));

  const isChecking = isLoading || hasToken;

  if (!isChecking && !userIsAuthenticated) {
    return (
      <LoginToContinueModal
        open={true}
        onClose={() => {}}
        forceLoginForm={true}
      />
    );
  }

  return <>{children}</>;
}
