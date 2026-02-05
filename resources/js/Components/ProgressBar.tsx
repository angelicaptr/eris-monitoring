import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

// Configure NProgress
NProgress.configure({
    showSpinner: false,
    speed: 400,
    minimum: 0.2
});

export function ProgressBar() {
    const location = useLocation();

    useEffect(() => {
        // Start progress bar on route change
        NProgress.start();

        // Finish progress bar after a short delay to simulate content load is complete
        // Since React Router is client-side, it's instant, but we want the visual feedback.
        const timer = setTimeout(() => {
            NProgress.done();
        }, 500);

        return () => {
            clearTimeout(timer);
            NProgress.done();
        };
    }, [location.pathname]); // Run on path change

    return null; // This component renders nothing itself
}
