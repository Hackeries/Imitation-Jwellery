"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchUserProfile,
  updateUserProfile,
  logoutUser,
  registerDevice,
  requestOtp,
  verifyOtp,
  type User,
} from "@/services/auth-service";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const hasAuthToken = () => {
  if (typeof window === "undefined") return false;
  const token =
    localStorage.getItem("token") || localStorage.getItem("authToken");
  return !!token;
};

const getStoredUser = (): User | null => {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("authenticatedUser");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const useUserProfile = () => {
  const queryClient = useQueryClient();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      const storedUser = getStoredUser();
      if (storedUser && !queryClient.getQueryData(["auth", "me"])) {
        queryClient.setQueryData(["auth", "me"], storedUser);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [queryClient]);

  const shouldFetch = isMounted ? hasAuthToken() : false;

  return useQuery<User | null>({
    queryKey: ["auth", "me"],
    queryFn: fetchUserProfile,
    enabled: shouldFetch,
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    retry: false,
    throwOnError: false,
  });
};

export const isAuthenticated = (user?: User | null): boolean =>
  !!user && !!user._id && user._id !== "guest";

export const useDeviceRegistration = () => {
  const queryClient = useQueryClient();
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    const register = async () => {
      try {
        const result = await registerDevice();
        if (result.customer) {
          queryClient.setQueryData<User | null>(
            ["auth", "me"],
            result.customer,
          );
        }
      } catch (err) {
        console.error("Device sync skipped:", err);
      }
    };

    register();
  }, [queryClient]);
};

export const useRequestOtp = () => {
  return useMutation({
    mutationFn: async (mobile: string) => {
      const result = await requestOtp(mobile);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
  });
};

export const useVerifyOtp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { mobile: string; otp: string }) => {
      return verifyOtp(params.mobile, params.otp);
    },
    onSuccess: (data: { user: User }) => {
      queryClient.setQueryData<User | null>(["auth", "me"], data.user);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("authToken");
        localStorage.removeItem("authenticatedUser");
      }

      queryClient.setQueryData<User | null>(["auth", "me"], null);
      queryClient.removeQueries({ queryKey: ["wishlist"] });
      queryClient.removeQueries({ queryKey: ["cart"] });
      queryClient.removeQueries({ queryKey: ["orders"] });
      queryClient.removeQueries({ queryKey: ["orders-infinite"] });
      queryClient.removeQueries({ queryKey: ["order"] });
      queryClient.removeQueries({ queryKey: ["addresses"] });

      toast.success("Signed out successfully", {
        description: "We hope to see you again soon!",
      });

      router.push("/");
      router.refresh();
    },
    onError: () => {
      toast.error("Failed to sign out. Please try again.");
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: Partial<{ fullName: string; email: string; mobile: string }>,
    ) => updateUserProfile(payload),
    onSuccess: (user) => {
      queryClient.setQueryData<User | null>(["auth", "me"], user);
      toast.success("Profile updated successfully");
    },
  });
};

export const useIsLoggedIn = (): boolean => {
  const { data: user } = useUserProfile();
  return isAuthenticated(user);
};
