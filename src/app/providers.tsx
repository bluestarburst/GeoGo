"use client";

import { NextUIProvider } from "@nextui-org/react";
import {APIProvider} from '@vis.gl/react-google-maps';

export default function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <NextUIProvider>
            <APIProvider apiKey={'AIzaSyAOsk3zgPK7ZQWWWa7VTjg2zvU6WMla27U'}  onLoad={() => console.log('Maps API has loaded.')}>
            {children}
            </APIProvider>
        </NextUIProvider>
    );
}