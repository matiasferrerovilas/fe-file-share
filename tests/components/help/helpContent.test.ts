import { describe, it, expect } from "vitest";
import i18n from "../../../src/i18n/config";
import { getHelpSections } from "../../../src/components/help/helpContent";

describe("getHelpSections", () => {
  it("includes a section for every feature the app actually has", () => {
    const sections = getHelpSections(i18n.t);
    const keys = sections.map((s) => s.key);

    expect(keys).toEqual([
      "workspace",
      "navigation",
      "upload",
      "organize",
      "selection",
      "share",
      "favorites",
      "recent",
      "trash",
    ]);
  });

  it("gives favorites, recent and trash a non-empty title and at least one paragraph", () => {
    const sections = getHelpSections(i18n.t);
    const newSections = sections.filter((s) => ["favorites", "recent", "trash"].includes(s.key));

    expect(newSections).toHaveLength(3);
    newSections.forEach((section) => {
      expect(section.title).not.toBe("");
      expect(section.content.length).toBeGreaterThan(0);
    });
  });
});
