import { describe, expect, it } from "vitest";
import { errorLabel, validText } from "../src/domain";
describe("text validation mirrors database character semantics", () => {
  it("accepts Unicode characters within limits and rejects whitespace", () => {
    expect(validText("😃".repeat(120), 120)).toBe(true);
    expect(validText("x".repeat(121), 120)).toBe(false);
    expect(validText("\n\t\u00a0", 1000)).toBe(false);
  });
  it("explains an uncertain write without claiming it was not saved", () => {
    expect(errorLabel(Error("network"))).toContain("pode ter sido salvo");
  });
});
