import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import DesktopNavLinks from "@/components/layout/navbar/DesktopNavLinks";

const mockLinks = [
  { href: "/discover?type=restaurants", label: "Restaurants", icon: "🍽️" },
  { href: "/movies", label: "Movies", icon: "🎬" },
];

describe("DesktopNavLinks", () => {
  it("renders all provided nav links", () => {
    render(
      <BrowserRouter>
        <DesktopNavLinks links={mockLinks} isActiveLink={() => false} />
      </BrowserRouter>
    );
    expect(screen.getByText("Restaurants")).toBeInTheDocument();
    expect(screen.getByText("Movies")).toBeInTheDocument();
  });

  it("applies active styles to the active link", () => {
    render(
      <BrowserRouter>
        <DesktopNavLinks
          links={mockLinks}
          isActiveLink={(path) => path === "/movies"}
        />
      </BrowserRouter>
    );
    const moviesLink = screen.getByText("Movies").closest("a");
    expect(moviesLink?.className).toContain("bg-primary");
  });
});
