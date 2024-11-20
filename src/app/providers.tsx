"use client";

import { NextUIProvider } from "@nextui-org/react";
import { APIProvider } from '@vis.gl/react-google-maps';
import { useEffect } from "react";

export default function Providers({ children }: Readonly<{ children: React.ReactNode }>) {

    const nonAlphaVersionLoaded = Boolean(
        globalThis &&
        globalThis.google?.maps?.version &&
        !globalThis.google?.maps?.version.endsWith('-alpha')
    );

    useEffect(() => {
        const int = setInterval(() => {
            if (document && document.getElementsByClassName("vAygCK-api-load-alpha-banner")[0]) {
                document.getElementsByClassName("vAygCK-api-load-alpha-banner")[0].remove();
                clearInterval(int);
            }
            console.log('Non-alpha version of Maps API loaded. Reloading...');
        }, 100);
    }, []);

    if (nonAlphaVersionLoaded) {
        location.reload();
        return;
    }

    return (
        <NextUIProvider>
            <APIProvider apiKey={'AIzaSyAOsk3zgPK7ZQWWWa7VTjg2zvU6WMla27U'} onLoad={() => console.log('Maps API has loaded.')} version={"alpha"}>
                {!nonAlphaVersionLoaded && children}
            </APIProvider>
        </NextUIProvider>
    );
}