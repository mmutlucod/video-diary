import { getTrimErrorMessage } from "./trim-error";

describe("getTrimErrorMessage", () => {
  it("maps a known error code to its message", () => {
    expect(getTrimErrorMessage({ code: "INVALID_END" })).toContain("süresini aşıyor");
  });

  it("falls back for an unknown code", () => {
    expect(getTrimErrorMessage({ code: "SOMETHING_NEW" })).toBe(
      "Video kaydedilemedi. Tekrar dene.",
    );
  });

  it("falls back for non-object errors", () => {
    expect(getTrimErrorMessage("boom")).toBe("Video kaydedilemedi. Tekrar dene.");
    expect(getTrimErrorMessage(null)).toBe("Video kaydedilemedi. Tekrar dene.");
  });
});