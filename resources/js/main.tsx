import './styles/index.css';
import { createRoot } from 'react-dom/client';
import DashboardRoot from './DashboardRoot';
import React from 'react';
import { ThemeProvider } from 'next-themes';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: any) {
        return { hasError: true, error };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-10 text-red-600 bg-red-50 h-screen flex flex-col items-center justify-center">
                    <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
                    <pre className="bg-white p-4 rounded border border-red-200 font-mono text-sm max-w-2xl overflow-auto">
                        {this.state.error?.toString()}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Reload Page
                    </button>
                    <button
                        onClick={() => {
                            // Emergency logout
                            document.cookie.split(";").forEach((c) => {
                                document.cookie = c
                                    .replace(/^ +/, "")
                                    .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                            });
                            localStorage.clear();
                            window.location.href = "/";
                        }}
                        className="mt-2 text-sm text-red-500 hover:underline"
                    >
                        Clear Cache & Reset
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

import { BrowserRouter } from 'react-router-dom';

const root = createRoot(document.getElementById('root')!);
root.render(
    <ErrorBoundary>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <BrowserRouter>
                <DashboardRoot />
            </BrowserRouter>
        </ThemeProvider>
    </ErrorBoundary>
);
