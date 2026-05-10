import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Infinite OS Component Crash:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-brand-panel text-slate-100 text-center rounded-2xl border border-rose-600">
          <h2 className="text-rose-500 font-bold text-lg">Module Offline</h2>
          <p className="mt-2 text-sm text-slate-300">
            This component encountered an error. Your session data is safely stored.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-5 py-2.5 bg-rose-600 text-white rounded-lg cursor-pointer font-bold hover:bg-rose-700 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
