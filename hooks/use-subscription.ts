"use client";

import { useMutation } from "@tanstack/react-query";
import {
  subscribeNewsletter,
  type SubscribeData,
} from "@/services/subscription-service";

export const useSubscribe = () => {
  return useMutation({
    mutationFn: (data: SubscribeData) => subscribeNewsletter(data),
  });
};
