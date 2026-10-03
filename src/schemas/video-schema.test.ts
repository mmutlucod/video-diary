import { DESCRIPTION_MAX_LENGTH, NAME_MAX_LENGTH } from "@/constants/app";

import { videoFormSchema } from "./video-schema";

describe("videoFormSchema", () => {
  it("accepts valid input and trims whitespace", () => {
    const result = videoFormSchema.safeParse({
      name: "  Sahil  ",
      description: "  güzel bir gün  ",
    });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ name: "Sahil", description: "güzel bir gün" });
  });

  it("rejects an empty name", () => {
    const result = videoFormSchema.safeParse({ name: "", description: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a name made only of whitespace", () => {
    const result = videoFormSchema.safeParse({ name: "   ", description: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a name longer than the limit", () => {
    const result = videoFormSchema.safeParse({
      name: "a".repeat(NAME_MAX_LENGTH + 1),
      description: "",
    });
    expect(result.success).toBe(false);
  });

  it("allows an empty description", () => {
    const result = videoFormSchema.safeParse({ name: "ok", description: "" });
    expect(result.success).toBe(true);
  });

  it("rejects a description longer than the limit", () => {
    const result = videoFormSchema.safeParse({
      name: "ok",
      description: "a".repeat(DESCRIPTION_MAX_LENGTH + 1),
    });
    expect(result.success).toBe(false);
  });
});