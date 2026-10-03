import { formatDuration } from "./time";

describe("formatDuration", () => {
  it("formats seconds as m:ss", () => {
    expect(formatDuration(5)).toBe("0:05");
    expect(formatDuration(65)).toBe("1:05");
  });

  it("rounds fractional seconds", () => {
    expect(formatDuration(4.6)).toBe("0:05");
  });

  it("clamps negative values to zero", () => {
    expect(formatDuration(-3)).toBe("0:00");
  });
});