"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  type Notification,
} from "@/services/notification-service";
import { useUserProfile, isAuthenticated } from "./use-auth";

export const useNotifications = () => {
  const { data: user } = useUserProfile();
  const loggedIn = isAuthenticated(user);

  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    enabled: loggedIn,
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 5,
    throwOnError: false,
  });
};

export const useUnreadNotificationCount = () => {
  const { data: notifications = [] } = useNotifications();
  return notifications.filter((n) => !n.isRead).length;
};

export const useUnreadNotifications = () => {
  const { data: notifications = [] } = useNotifications();
  return notifications.filter((n) => !n.isRead);
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId),
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      const previous = queryClient.getQueryData<Notification[]>([
        "notifications",
      ]);

      queryClient.setQueryData<Notification[]>(
        ["notifications"],
        (old) =>
          old?.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          ) ?? []
      );

      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(["notifications"], ctx.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      const previous = queryClient.getQueryData<Notification[]>([
        "notifications",
      ]);

      queryClient.setQueryData<Notification[]>(
        ["notifications"],
        (old) => old?.map((n) => ({ ...n, isRead: true })) ?? []
      );

      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(["notifications"], ctx.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => deleteNotification(notificationId),
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      const previous = queryClient.getQueryData<Notification[]>([
        "notifications",
      ]);

      queryClient.setQueryData<Notification[]>(
        ["notifications"],
        (old) => old?.filter((n) => n.id !== notificationId) ?? []
      );

      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(["notifications"], ctx.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export type { Notification };
