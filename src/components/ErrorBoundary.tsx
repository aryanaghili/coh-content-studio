import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg shadow-sm w-full h-full min-h-[300px] flex flex-col justify-center items-center text-center">
          <div className="text-red-600 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <h3 className="font-serif text-xl text-red-900 mb-2">{this.props.fallbackTitle || 'Something went wrong in this workspace.'}</h3>
          <p className="text-sm text-red-800/80 mb-6 max-w-md">
            The workspace could not load because of a temporary app error. Your saved content has not been deleted.
          </p>
          <div className="flex gap-3">
            <button
              onClick={this.handleReload}
              className="px-4 py-2 bg-red-700 text-white rounded text-sm font-semibold hover:bg-red-800 transition"
            >
              Reload Workspace
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white text-red-700 border border-red-200 rounded text-sm font-semibold hover:bg-red-50 transition"
            >
              Reload Entire App
            </button>
          </div>
          {import.meta.env.DEV && this.state.error && (
            <div className="mt-6 p-4 bg-white/50 border border-red-200 rounded text-left text-xs font-mono text-red-900 max-w-xl overflow-auto overflow-x-auto w-full">
              <p className="font-bold mb-1">Developer Error:</p>
              {this.state.error.toString()}
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
