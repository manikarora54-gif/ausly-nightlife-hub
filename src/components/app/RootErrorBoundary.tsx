import { Component, type ErrorInfo, type ReactNode } from "react";

type ErrorSource = "react" | "runtime" | "promise" | null;

interface RootErrorBoundaryProps {
  children: ReactNode;
}

interface RootErrorBoundaryState {
  error: Error | null;
  source: ErrorSource;
}

const toError = (value: unknown): Error => {
  if (value instanceof Error) return value;
  if (typeof value === "string" && value.trim()) return new Error(value);

  try {
    return new Error(JSON.stringify(value));
  } catch {
    return new Error("Unknown application error");
  }
};

class RootErrorBoundary extends Component<
  RootErrorBoundaryProps,
  RootErrorBoundaryState
> {
  state: RootErrorBoundaryState = {
    error: null,
    source: null,
  };

  static getDerivedStateFromError(error: Error): RootErrorBoundaryState {
    return {
      error,
      source: "react",
    };
  }

  componentDidMount() {
    window.addEventListener("error", this.handleWindowError);
    window.addEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  componentWillUnmount() {
    window.removeEventListener("error", this.handleWindowError);
    window.removeEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[RootErrorBoundary] Render error", error, errorInfo);
  }

  private handleWindowError = (event: ErrorEvent) => {
    // Ignore resource-load failures like broken images/stylesheets.
    if (!event.error || (event.target && event.target !== window)) {
      return;
    }

    console.error("[RootErrorBoundary] Runtime error", event.error);
    this.setState({
      error: toError(event.error),
      source: "runtime",
    });
  };

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const error = toError(event.reason);
    console.error("[RootErrorBoundary] Unhandled promise rejection", error);
    this.setState({
      error,
      source: "promise",
    });
  };

  private handleReset = () => {
    this.setState({ error: null, source: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    const { error, source } = this.state;

    if (!error) {
      return this.props.children;
    }

    const sourceLabel =
      source === "react"
        ? "Render error"
        : source === "promise"
          ? "Async error"
          : "Runtime error";

    return (
      <div className="min-h-screen bg-background text-foreground">
        <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-6 py-16">
          <section className="w-full rounded-3xl border border-border bg-card p-8 shadow-sm">
            <span className="inline-flex rounded-full border border-border bg-muted px-3 py-1 text-sm text-muted-foreground">
              {sourceLabel}
            </span>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              The preview hit an error
            </h1>
            <p className="mt-3 text-muted-foreground">
              Instead of dropping to a white screen, the app now catches the
              crash and shows a recovery state.
            </p>

            <div className="mt-6 rounded-2xl border border-border bg-muted/50 p-4">
              <p className="text-sm font-medium">Latest error</p>
              <pre className="mt-2 overflow-auto whitespace-pre-wrap break-words text-sm text-muted-foreground">
                {error.message || error.name}
              </pre>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center justify-center rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-opacity hover:opacity-90"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Reload app
              </button>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Dev compile errors will also surface in the Vite overlay instead of
              failing silently.
            </p>
          </section>
        </main>
      </div>
    );
  }
}

export default RootErrorBoundary;
