"use client";

import { Component, ReactNode } from "react";

interface RouteErrorBoundaryProps {
  children: ReactNode;
}

interface RouteErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class RouteErrorBoundary extends Component<RouteErrorBoundaryProps, RouteErrorBoundaryState> {
  constructor(props: RouteErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): RouteErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("[RouteErrorBoundary] Caught error:", error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = "/";
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-6">
          <div className="text-6xl mb-6">💥</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Oops! Something broke
          </h1>
          <p className="text-[#9B9B9B] mb-6 text-center max-w-md">
            {this.state.error?.message || "An unexpected error occurred. Please try refreshing the page."}
          </p>
          <div className="flex gap-3">
            <button
              onClick={this.handleReload}
              className="px-6 py-2.5 bg-[#FF007A] hover:bg-[#FF007A]/90 text-white rounded-2xl font-medium transition-colors"
            >
              Refresh Page
            </button>
            <button
              onClick={this.handleGoHome}
              className="px-6 py-2.5 bg-[#2B2B2B] hover:bg-[#3B3B3B] text-white rounded-2xl font-medium transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
