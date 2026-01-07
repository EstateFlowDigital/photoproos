"use client";

import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  label?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", this.props.label || "Boundary", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4 text-sm text-foreground">
          <div className="font-semibold">Something went wrong.</div>
          <div className="mt-1 text-foreground-muted">
            {this.props.label ? `Context: ${this.props.label}. ` : null}
            Check the console for details.
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
