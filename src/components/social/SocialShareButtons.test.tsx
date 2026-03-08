import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import SocialShareButtons from "@/components/social/SocialShareButtons";

describe("SocialShareButtons", () => {
  it("renders three share buttons", () => {
    render(
      <BrowserRouter>
        <SocialShareButtons title="Test Venue" />
      </BrowserRouter>
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(3);
  });

  it("has correct titles for accessibility", () => {
    render(
      <BrowserRouter>
        <SocialShareButtons title="Test Venue" />
      </BrowserRouter>
    );
    expect(screen.getByTitle("Copy link")).toBeInTheDocument();
    expect(screen.getByTitle("Share on WhatsApp")).toBeInTheDocument();
    expect(screen.getByTitle("Share on Twitter")).toBeInTheDocument();
  });
});
