"use client";

import Image from "next/image";
import { TileContainer } from "../tiles/TileContainer";

import mapsLogo from "@/assets/images/maps.png";
import { Input } from "@nextui-org/react";

export default function HomePage() {
    return (
        <>
            <div className="absolute top-0 left-0 w-full h-full">
                <TileContainer />
            </div>
            <div className="relative z-10 w-full h-full flex justify-center items-center min-h-[100vh]">
                <div className="p-5 flex flex-col gap-2">
                    <h1 className="text-6xl"><b>GeoGo</b></h1>
                    <Input className="w-full max-w-[350px]" type="location" label="Email" />
                    <p className="text-2xl">Explore the world in 3D</p>
                    <div className="flex flex-row items-center justify-start gap-1">
                        <p>Built with </p>
                        <Image src={mapsLogo} alt="Google Maps" className="max-h-5 object-contain w-max" />
                    </div>
                </div>
            </div>

        </>
    );
}