"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { PUBLIC_ENDPOINTS } from "@/lib/api/endpoints";
import type { ContactLink } from "@/types";

export function useContactLinks() {
  return useQuery({
    queryKey: ["contact-links"],
    queryFn: async () => {
      return apiGet<ContactLink[]>(PUBLIC_ENDPOINTS.CONTACT_LINKS);
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
