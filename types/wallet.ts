import type { SettlementStatus } from "./enums";

export interface WalletSummary {
  balance: number;
  totalEarned: number;
  totalSettled: number;
  pendingSettlementAmount: number;
}

export type WalletTransactionType =
  | "CREDIT"
  | "DEBIT"
  | "SETTLEMENT"
  | "REFUND"
  | "COMMISSION";

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: WalletTransactionType;
  amount: number;
  balance: number;
  referenceType: string | null;
  referenceId: string | null;
  description: string | null;
  createdAt: string;
}

export interface Settlement {
  id: string;
  walletId: string;
  amount: number;
  status: SettlementStatus;
  bankDetails: Record<string, unknown> | null;
  processedAt: string | null;
  processedBy: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  wallet?: {
    pharmacy: {
      id: string;
      name: { ar: string; en: string };
    };
  };
}

export interface RequestSettlementDto {
  amount: number;
  bankDetails?: Record<string, unknown>;
  notes?: string;
}

export interface ProcessSettlementDto {
  status: SettlementStatus;
  notes?: string;
}
