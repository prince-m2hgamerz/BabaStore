import { describe, it, expect } from "vitest";
import { formatDownloads, formatBytes, formatDate } from "./format";

describe("formatDownloads", () => {
  it("formats billions", () => {
    expect(formatDownloads(1_500_000_000)).toBe("1.5B");
    expect(formatDownloads(10_000_000_000)).toBe("10B");
  });

  it("formats millions", () => {
    expect(formatDownloads(5_200_000)).toBe("5.2M");
    expect(formatDownloads(50_000_000)).toBe("50M");
  });

  it("formats thousands", () => {
    expect(formatDownloads(1500)).toBe("2K");
    expect(formatDownloads(9900)).toBe("10K");
  });

  it("returns raw number for small values", () => {
    expect(formatDownloads(0)).toBe("0");
    expect(formatDownloads(42)).toBe("42");
    expect(formatDownloads(999)).toBe("999");
  });
});

describe("formatBytes", () => {
  it("returns 'Not set' for null", () => {
    expect(formatBytes(null)).toBe("Not set");
  });

  it("formats bytes as MB", () => {
    expect(formatBytes(5_242_880)).toBe("5 MB");
    expect(formatBytes(1_048_576)).toBe("1 MB");
  });

  it("formats bytes as GB", () => {
    expect(formatBytes(2_147_483_648)).toBe("2.00 GB");
  });
});

describe("formatDate", () => {
  it("formats a date string", () => {
    const result = formatDate("2024-06-15T00:00:00Z");
    expect(result).toBe("Jun 15, 2024");
  });
});
