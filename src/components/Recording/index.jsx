
"use client"
import React from 'react'
import { useSession } from 'next-auth/react'
import RecordingContainer from "../Recording/RecordingContainer"
import { useRouter } from 'next/navigation';

function RecordingPage() {
    const { data: session, status } = useSession()
    // console.log("tokensss", session)
    const router = useRouter();
    return (
        <div>
            <RecordingContainer/>
        </div>
    )
}

export default RecordingPage