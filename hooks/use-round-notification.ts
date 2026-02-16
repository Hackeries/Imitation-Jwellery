"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchRoundNotifications,
  type RoundNotification,
} from "@/services/round-notification-service";

export const useRoundNotifications = () => {
  return useQuery({
    queryKey: ["round-notifications"],
    queryFn: () => fetchRoundNotifications(),
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    throwOnError: false,
  });
};

export type { RoundNotification };
