"use client";

import { useState } from "react";
import { Settings, Loader2, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  usePlatformCommission,
  usePlatformCommissionHistory,
  useCreatePlatformCommission,
  useUpdatePlatformCommission,
} from "@/features/admin/hooks/use-admin-prescriptions";
import { useTranslation } from "@/lib/i18n";

export function PlatformCommissionPageContent() {
  const { t } = useTranslation();
  const { data: activeConfig, isLoading } = usePlatformCommission();
  const { data: history } = usePlatformCommissionHistory();
  const createCommission = useCreatePlatformCommission();
  const updateCommission = useUpdatePlatformCommission();

  const [percentage, setPercentage] = useState("");
  const [minCommission, setMinCommission] = useState("");
  const [maxCommission, setMaxCommission] = useState("");

  const handleSave = async () => {
    const data = {
      commissionPercentage: parseFloat(percentage),
      minCommission: minCommission ? parseFloat(minCommission) : undefined,
      maxCommission: maxCommission ? parseFloat(maxCommission) : undefined,
    };

    if (activeConfig) {
      await updateCommission.mutateAsync({
        configId: activeConfig.id,
        ...data,
      });
    } else {
      await createCommission.mutateAsync(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
          <Settings className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          {t("prescription.commissionConfig")}
        </h1>
      </div>

      {/* Current Config */}
      <Card>
        <CardHeader>
          <CardTitle>{t("prescription.commissionConfig")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <>
              {activeConfig && (
                <div className="p-4 rounded-lg bg-muted mb-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">
                        {Number(activeConfig.commissionPercentage)}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("prescription.commissionPercentage")}
                      </p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {Number(activeConfig.minCommission)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("prescription.minCommission")}
                      </p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {activeConfig.maxCommission
                          ? Number(activeConfig.maxCommission)
                          : "\u221E"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("prescription.maxCommission")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>{t("prescription.commissionPercentage")}</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    value={percentage}
                    onChange={(e) => setPercentage(e.target.value)}
                    placeholder={
                      activeConfig
                        ? String(Number(activeConfig.commissionPercentage))
                        : "10"
                    }
                  />
                </div>
                <div>
                  <Label>{t("prescription.minCommission")}</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={minCommission}
                    onChange={(e) => setMinCommission(e.target.value)}
                    placeholder={
                      activeConfig
                        ? String(Number(activeConfig.minCommission))
                        : "0"
                    }
                  />
                </div>
                <div>
                  <Label>{t("prescription.maxCommission")}</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={maxCommission}
                    onChange={(e) => setMaxCommission(e.target.value)}
                    placeholder={
                      activeConfig?.maxCommission
                        ? String(Number(activeConfig.maxCommission))
                        : ""
                    }
                  />
                </div>
              </div>

              <Button
                onClick={handleSave}
                disabled={
                  !percentage ||
                  createCommission.isPending ||
                  updateCommission.isPending
                }
              >
                {createCommission.isPending || updateCommission.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {t("prescription.saveCommission")}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* History */}
      {history && history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              {t("prescription.commissionHistory")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {history.map((config: any) => (
                <div
                  key={config.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <span className="font-medium">
                      {Number(config.commissionPercentage)}%
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">
                      (Min: {Number(config.minCommission)}
                      {config.maxCommission &&
                        `, Max: ${Number(config.maxCommission)}`}
                      )
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(config.effectiveFrom).toLocaleDateString()}
                    </span>
                    {config.isActive ? (
                      <Badge variant="success">
                        {t("prescription.effective")}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        {config.effectiveTo
                          ? new Date(config.effectiveTo).toLocaleDateString()
                          : ""}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
