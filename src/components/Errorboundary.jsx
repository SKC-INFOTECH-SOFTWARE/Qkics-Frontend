// src/components/ErrorBoundary.jsx
import { Component } from "react";
import { BiSolidError } from "react-icons/bi";

/**
 * ErrorBoundary — catches any uncaught render/lifecycle errors in its subtree.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <SomeComponent />
 *   </ErrorBoundary>
 *
 * Or with a custom fallback:
 *   <ErrorBoundary fallback={<p>Something went wrong.</p>}>
 *     <SomeComponent />
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to console in dev; swap for a real error-reporting service in prod
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Allow a custom fallback to be passed as a prop
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="text-5xl">
            <BiSolidError size={70}/>
          </div>
          <h2 className="text-xl font-bold text-neutral-500 dark:text-neutral-400">
            Something went wrong
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md">
            An unexpected error occurred. Try refreshing the page, or click the
            button below to recover.
          </p>
          {/* {process.env.NODE_ENV === "development" && this.state.error && (
            <pre className="mt-2 text-left text-xs bg-neutral-100 dark:bg-neutral-900 text-red-500 p-4 rounded-xl overflow-auto max-w-lg w-full">
              {this.state.error.toString()}
            </pre>
          )} */}
          <button
            onClick={this.handleReset}
            className="mt-2 px-6 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}