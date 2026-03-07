"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Only initialize outside the component if we're on the client
// and we have a valid key.
if (
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_POSTHOG_KEY &&
    process.env.NEXT_PUBLIC_POSTHOG_HOST
) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        capture_pageview: false, // We handle this manually in the router
        capture_pageleave: true,
    });
}

function PostHogPageView() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (pathname) {
            let url = window.origin + pathname;
            if (searchParams && searchParams.toString()) {
                url = url + "?" + searchParams.toString();
            }
            posthog.capture("$pageview", { $current_url: url });
        }
    }, [pathname, searchParams]);

    return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
    const [isAvailable, setIsAvailable] = useState(false);

    useEffect(() => {
        if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
            Promise.resolve().then(() => setIsAvailable(true));
        }
    }, []);

    // If PostHog isn't configured, we just render the children normally without throwing.
    // This ensures local dev doesn't break if keys are missing.
    if (!isAvailable) {
        return <>{children}</>;
    }

    return (
        <PHProvider client={posthog}>
            <PostHogPageView />
            {children}
        </PHProvider>
    );
}
