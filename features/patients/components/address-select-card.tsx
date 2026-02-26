"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  Plus,
  Check,
  Phone,
  Building2,
  Star,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";
import { usePatientAddresses } from "../hooks";
import type { PatientAddress } from "@/types/address";

interface AddressSelectCardProps {
  onAddressSelect: (address: PatientAddress | null) => void;
  selectedAddressId?: string;
}

export function AddressSelectCard({
  onAddressSelect,
  selectedAddressId,
}: AddressSelectCardProps) {
  const { t } = useTranslation();
  const { data: addresses, isLoading } = usePatientAddresses();
  const [expanded, setExpanded] = useState(false);

  // Auto-select default address on load
  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      onAddressSelect(defaultAddr);
    }
  }, [addresses]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  // No addresses — show CTA to add
  if (!addresses || addresses.length === 0) {
    return (
      <Card className="border-warning-300 bg-warning-50 dark:bg-warning-900/10">
        <CardContent className="p-6">
          <div className="text-center">
            <MapPin className="h-10 w-10 mx-auto text-warning-600 mb-3" />
            <p className="font-medium text-warning-800 dark:text-warning-200">
              {t("addresses.noAddressRedirect")}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {t("addresses.noAddressesDescription")}
            </p>
            <Button asChild className="mt-4">
              <Link href="/patient/addresses">
                <Plus className="h-4 w-4 me-2" />
                {t("addresses.addAddress")}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPin className="h-5 w-5" />
          {t("addresses.selectAddress")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Selected address display */}
        {selectedAddress && !expanded && (
          <div className="flex items-start gap-3 p-3 rounded-lg border border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10">
            <div className="h-8 w-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-semibold text-sm">
                  {selectedAddress.label}
                </span>
                {selectedAddress.isDefault && (
                  <Badge variant="default" className="text-xs">
                    <Star className="h-3 w-3 me-1" />
                    {t("addresses.defaultBadge")}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {selectedAddress.address}
              </p>
              <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Phone className="h-3 w-3" />
                {selectedAddress.phoneNumber}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 text-xs"
              onClick={() => setExpanded(true)}
            >
              {t("addresses.changeAddress")}
              <ChevronDown className="h-3 w-3 ms-1" />
            </Button>
          </div>
        )}

        {/* Address list for selection */}
        {(expanded || !selectedAddress) && (
          <>
            {expanded && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground"
                onClick={() => setExpanded(false)}
              >
                <ChevronUp className="h-3 w-3 me-1" />
                {t("common.close")}
              </Button>
            )}
            <div className="space-y-2">
              {addresses.map((addr) => {
                const isSelected = addr.id === selectedAddressId;
                return (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => {
                      onAddressSelect(addr);
                      setExpanded(false);
                    }}
                    className={`w-full text-start p-3 rounded-lg border transition-colors ${
                      isSelected
                        ? "border-primary-300 dark:border-primary-700 bg-primary-50/50 dark:bg-primary-900/10"
                        : "border-border hover:border-primary-200 dark:hover:border-primary-800 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? "border-primary-600 bg-primary-600"
                            : "border-muted-foreground/30"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-medium text-sm">
                            {addr.label}
                          </span>
                          {addr.isDefault && (
                            <Badge variant="secondary" className="text-xs">
                              {t("addresses.defaultBadge")}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {addr.address}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {addr.phoneNumber}
                          </span>
                          {(addr.city || addr.area) && (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {[addr.city, addr.area]
                                .filter(Boolean)
                                .join(", ")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/patient/addresses">
                <Plus className="h-4 w-4 me-2" />
                {t("addresses.addNewAddress")}
              </Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
