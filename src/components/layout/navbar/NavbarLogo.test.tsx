import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import NavbarLogo from "@/components/layout/navbar/NavbarLogo";

describe("NavbarLogo", () => {
  it("renders the Ausly brand name", () => {
    render(
      <BrowserRouter>
        <NavbarLogo />
      </BrowserRouter>
    );
    expect(screen.getByText("Ausly")).toBeInTheDocument();
  });

  it("links to the homepage", () => {
    render(
      <BrowserRouter>
        <NavbarLogo />
      </BrowserRouter>
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/");
  });
});
