import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

const replaceMock = vi.fn();
const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: pushMock }),
  usePathname: () => "/patient/cart",
}));

vi.mock("../store", () => ({
  useUser: vi.fn(),
  useIsAuthenticated: vi.fn(),
  useIsAuthLoading: vi.fn(),
  useIsHydrated: vi.fn(),
}));

vi.mock("@/lib/i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: "en" as const,
    isRtl: false,
    dir: "ltr" as const,
  }),
}));

const toastWarningMock = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  toastWarning: (title: string, desc?: string) => toastWarningMock(title, desc),
}));

import { ProtectedRoute } from "../guards";
import {
  useUser,
  useIsAuthenticated,
  useIsAuthLoading,
  useIsHydrated,
} from "../store";

const mockedUseUser = vi.mocked(useUser);
const mockedUseIsAuthenticated = vi.mocked(useIsAuthenticated);
const mockedUseIsAuthLoading = vi.mocked(useIsAuthLoading);
const mockedUseIsHydrated = vi.mocked(useIsHydrated);

describe("ProtectedRoute — login required toast", () => {
  beforeEach(() => {
    replaceMock.mockReset();
    pushMock.mockReset();
    toastWarningMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("redirects to /login with returnUrl AND fires the warning toast once when not authenticated", async () => {
    mockedUseUser.mockReturnValue(null);
    mockedUseIsAuthenticated.mockReturnValue(false);
    mockedUseIsAuthLoading.mockReturnValue(false);
    mockedUseIsHydrated.mockReturnValue(true);

    render(
      <ProtectedRoute>
        <div>secret</div>
      </ProtectedRoute>,
    );

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith(
        `/login?returnUrl=${encodeURIComponent("/patient/cart")}`,
      );
    });

    expect(toastWarningMock).toHaveBeenCalledTimes(1);
    expect(toastWarningMock).toHaveBeenCalledWith(
      "auth.loginRequiredTitle",
      "auth.loginRequiredDesc",
    );
    expect(screen.queryByText("secret")).not.toBeInTheDocument();
  });

  it("does not fire toast or redirect while still hydrating", async () => {
    mockedUseUser.mockReturnValue(null);
    mockedUseIsAuthenticated.mockReturnValue(false);
    mockedUseIsAuthLoading.mockReturnValue(false);
    mockedUseIsHydrated.mockReturnValue(false);

    render(
      <ProtectedRoute>
        <div>secret</div>
      </ProtectedRoute>,
    );

    expect(replaceMock).not.toHaveBeenCalled();
    expect(toastWarningMock).not.toHaveBeenCalled();
  });

  it("does not fire toast for an authenticated user", () => {
    mockedUseUser.mockReturnValue({
      id: "1",
      email: "p@example.com",
      fullName: "Patient",
      role: "PATIENT",
    } as unknown as ReturnType<typeof useUser>);
    mockedUseIsAuthenticated.mockReturnValue(true);
    mockedUseIsAuthLoading.mockReturnValue(false);
    mockedUseIsHydrated.mockReturnValue(true);

    render(
      <ProtectedRoute>
        <div>secret</div>
      </ProtectedRoute>,
    );

    expect(toastWarningMock).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();
    expect(screen.getByText("secret")).toBeInTheDocument();
  });
});
