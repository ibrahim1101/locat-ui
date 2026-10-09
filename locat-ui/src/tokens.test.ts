/** Token mirror guard: the kit CSS must keep the Liquid Titanium tokens. */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("src/index.css", "utf8");

describe("design tokens", () => {
  it("keeps the core titanium palette", () => {
    for (const token of ["--locat-background: #0A0B0D", "--locat-titanium: #D3D8DF", "--locat-steel: #8FB6D6", "--steel:", "--steel-deep:"])
      expect(css).toContain(token);
  });

  it("keeps the signature surfaces", () => {
    for (const utility of [".smoked-glass", ".titanium-panel", ".bubble-out", ".bubble-in", ".steel-button", ".locat-metal-button", ".text-steel", ".bg-steel"])
      expect(css).toContain(utility);
  });

  it("keeps light theme and accent variants", () => {
    expect(css).toContain('[data-theme="light"]');
    for (const accent of ["teal", "olive", "blue", "violet", "rose"])
      expect(css).toContain(`[data-accent="${accent}"]`);
  });
});
