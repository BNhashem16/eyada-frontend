import { describe, it, expect } from "vitest";
import { validateReturnUrl } from "../use-login";

describe("validateReturnUrl", () => {
  it("returns null for nullish input", () => {
    expect(validateReturnUrl(null)).toBeNull();
    expect(validateReturnUrl(undefined)).toBeNull();
    expect(validateReturnUrl("")).toBeNull();
  });

  it("accepts simple internal paths", () => {
    expect(validateReturnUrl("/patient/dashboard")).toBe("/patient/dashboard");
    expect(validateReturnUrl("/doctors/123")).toBe("/doctors/123");
    expect(validateReturnUrl("/patient/cart")).toBe("/patient/cart");
  });

  it("accepts paths with query strings and hashes", () => {
    expect(validateReturnUrl("/doctors?specialty=cardio")).toBe(
      "/doctors?specialty=cardio",
    );
    expect(validateReturnUrl("/patient/orders#tab-active")).toBe(
      "/patient/orders#tab-active",
    );
  });

  it("decodes percent-encoded paths", () => {
    expect(validateReturnUrl(encodeURIComponent("/doctors/abc-123"))).toBe(
      "/doctors/abc-123",
    );
  });

  it("rejects malformed percent-encoding", () => {
    expect(validateReturnUrl("%E0%A4%A")).toBeNull();
  });

  it("rejects protocol-relative URLs (open-redirect vector)", () => {
    expect(validateReturnUrl("//evil.com")).toBeNull();
    expect(validateReturnUrl("//evil.com/path")).toBeNull();
  });

  it("rejects backslash-prefixed URLs (open-redirect vector)", () => {
    expect(validateReturnUrl("/\\evil.com")).toBeNull();
  });

  it("rejects absolute URLs", () => {
    expect(validateReturnUrl("https://evil.com")).toBeNull();
    expect(validateReturnUrl("http://evil.com")).toBeNull();
  });

  it("rejects dangerous schemes", () => {
    expect(validateReturnUrl("javascript:alert(1)")).toBeNull();
    expect(validateReturnUrl("data:text/html,<script>")).toBeNull();
  });

  it("rejects auth-namespace paths to prevent loops", () => {
    expect(validateReturnUrl("/login")).toBeNull();
    expect(validateReturnUrl("/login?x=1")).toBeNull();
    expect(validateReturnUrl("/register")).toBeNull();
    expect(validateReturnUrl("/forgot-password")).toBeNull();
    expect(validateReturnUrl("/login/anything")).toBeNull();
  });

  it("rejects paths with newlines (header-injection vector)", () => {
    expect(validateReturnUrl("/path\nfoo")).toBeNull();
    expect(validateReturnUrl("/path\rfoo")).toBeNull();
  });

  it("rejects paths longer than 1024 characters", () => {
    expect(validateReturnUrl("/" + "a".repeat(1024))).toBeNull();
  });

  it("rejects paths that don't start with /", () => {
    expect(validateReturnUrl("patient/dashboard")).toBeNull();
    expect(validateReturnUrl("dashboard")).toBeNull();
  });
});
