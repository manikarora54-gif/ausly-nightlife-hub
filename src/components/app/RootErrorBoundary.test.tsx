import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import RootErrorBoundary from "./RootErrorBoundary";

const Boom = () => {
  throw new Error("Boom");
};

describe("RootErrorBoundary", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders children when no error exists", () => {
    render(
      <RootErrorBoundary>
        <div>Healthy app</div>
      </RootErrorBoundary>
    );

    expect(screen.getByText("Healthy app")).toBeInTheDocument();
  });

  it("renders the fallback UI when a child throws", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <RootErrorBoundary>
        <Boom />
      </RootErrorBoundary>
    );

    expect(screen.getByText("The preview hit an error")).toBeInTheDocument();
    expect(screen.getByText("Boom")).toBeInTheDocument();
  });
});
