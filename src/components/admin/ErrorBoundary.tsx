import React from 'react';

interface State {
  hasError: boolean;
  error?: Error | null;
  info?: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<{ children?: React.ReactNode }, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Unhandled error caught by ErrorBoundary:', error, info);
    this.setState({ error, info });
  }

  render() {
    if (this.state.hasError) {
      const message = this.state.error?.message || '';
      const isAuthError = /invalid|credential|unauthor/i.test(message);

      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#fff8f8]">
          <div className="max-w-3xl w-full bg-white rounded-2xl border border-rose-50 p-8 shadow-lg">
            <h2 className="text-lg font-black text-rose-600">{isAuthError ? 'Invalid credentials' : 'Something went wrong'}</h2>
            <p className="text-sm text-slate-500 mt-2">
              {isAuthError
                ? 'The email or password you entered is incorrect. Please try again.'
                : 'An unexpected error occurred while rendering this page. Details are shown below for debugging.'}
            </p>

            <div className="mt-4 bg-rose-50 border border-rose-100 p-3 rounded text-xs text-rose-600">
              <div className="font-bold">{message}</div>
              {!isAuthError && (
                <pre className="mt-2 text-[12px] whitespace-pre-wrap">{this.state.info?.componentStack || ''}</pre>
              )}
            </div>

            <div className="mt-4 flex gap-3">
              <button className="px-4 py-2 bg-rose-600 text-white rounded" onClick={() => window.location.reload()}>Reload</button>
              <button className="px-4 py-2 bg-white border rounded" onClick={() => this.setState({ hasError: false, error: null, info: null })}>Dismiss</button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}

export default ErrorBoundary;
