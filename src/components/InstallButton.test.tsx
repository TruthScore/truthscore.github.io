import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Hero from "./Hero";
import Features from "./Features";
import Nav from "./Nav";
import { CHROME_STORE_URL } from "@/lib/config";

afterEach(cleanup);

describe("Add to Chrome buttons (E#91)", () => {
  it.each([
    ["Hero", <Hero />],
    ["Features", <Features />],
    ["Nav", <Nav />],
  ])("%s links every Add to Chrome button to the Web Store listing", (_name, el) => {
    render(<MemoryRouter>{el}</MemoryRouter>);
    const links = screen.getAllByRole("link", { name: /add to chrome/i });
    expect(links.length).toBeGreaterThan(0);
    for (const a of links) {
      expect(a.getAttribute("href")).toBe(CHROME_STORE_URL);
      expect(a.getAttribute("rel")).toContain("noopener");
    }
  });
});
