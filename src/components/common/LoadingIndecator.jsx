"use client"
import React, { useEffect } from 'react';

function LoadingIndecator() {
    // Use useEffect to hide overflow when the component is mounted (loading is true)
    useEffect(() => {
        // Hide the scrollbar and disable scrolling
        document.body.style.overflow = 'hidden';

        // Cleanup function to reset the overflow when the component is unmounted (loading is false)
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen fixed inset-0 bg-main z-50">
            <div className='flex-col items-center justify-center'>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.3}
                    stroke="currentColor"
                    className="w-28 h-28 text-sinaBlue animate-spin mx-auto"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                    />
                </svg>
                <p className="text-3xl font-light mb-10">
                    loading...</p>
            </div>
        </div>
    );
}

export default LoadingIndecator;
