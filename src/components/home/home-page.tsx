"use client";

import Image from "next/image";
// import { TileContainer } from "../tiles/TileContainer";

import mapsLogo from "@/assets/images/maps.png";
import mapsLogoText from "@/assets/images/maps-text.png";
import { cn } from "@nextui-org/react";
import { AutocompleteCustom } from "../tiles/autocomplete";
import { useCallback, useEffect, useRef, useState } from "react";
import { Map, MapMouseEvent } from "@vis.gl/react-google-maps";
import { Map3D, Map3DCameraProps } from "../map-3d";
import { MiniMap } from "../minimap";

const INITIAL_VIEW_PROPS = {
    center: { lat: 37.72809, lng: -119.64473, altitude: 1300 },
    range: 5000,
    heading: 61,
    tilt: 69,
    roll: 0
};

export default function HomePage() {

    const [viewProps, setViewProps] = useState(INITIAL_VIEW_PROPS);

    const [showLabels, setShowLabels] = useState(true);

    const handleCameraChange = useCallback((props: Map3DCameraProps) => {
        setViewProps(oldProps => ({ ...oldProps, ...props }));
    }, []);

    const handleMapClick = useCallback((ev: MapMouseEvent) => {
        if (!ev.detail.latLng) return;

        const { lat, lng } = ev.detail.latLng;
        setViewProps(p => ({ ...p, center: { lat, lng, altitude: 200 } }));
    }, []);

    const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

    const [currentLocation, setCurrentLocation] = useState<google.maps.places.PlaceResult | null>(null);

    const [predictionResults, setPredictionResults] = useState<
        Array<google.maps.places.AutocompletePrediction>
    >([]);

    useEffect(() => {
        if (currentLocation) {
            const timeout = setTimeout(() => {
                setViewProps(p => ({
                    ...p, center: {
                        lat: currentLocation.geometry.location.lat(),
                        lng: currentLocation.geometry.location.lng(),
                        altitude: 0
                    }
                }));
                setInterrupting(null);
            }, 100);

            setInterrupting(timeout);
        }
    }, [currentLocation]);

    const [interrupting, setInterrupting] = useState<NodeJS.Timeout | boolean>(null);
    const velocity = useRef(0.01);

    useEffect(() => {
        // increment heading by 1 every 100ms
        if (interrupting) {

            velocity.current = 0.01;
            return;

        }

        const interval = setInterval(() => {
            setViewProps(p => ({ ...p, heading: (p.heading + velocity.current) % 360 }));

            if (velocity.current < 0.15) {
                velocity.current = velocity.current + velocity.current * 0.01;
            }
        }, 60 / 1000);

        return () => clearInterval(interval);
    }, [interrupting, velocity]);

    const onInterrupt = useCallback(() => {
        setInterrupting(true);
    }, [interrupting]);

    const onUninterrupt = useCallback(() => {
        setInterrupting(false);
    }, [interrupting]);

    return (
        <>
            <div className="absolute top-0 left-0 w-full h-full" onWheel={onInterrupt} onMouseDown={onInterrupt} onTouchStart={onInterrupt}>
                <Map3D
                    {...viewProps}
                    onCameraChange={handleCameraChange}
                    defaultLabelsDisabled={interrupting !== true}
                />
                <MiniMap camera3dProps={viewProps} onMapClick={handleMapClick}></MiniMap>
                {/* <TileContainer lat={currentLocation ? currentLocation.geometry.location.lat() : 32.781311113132396} lng={currentLocation ? currentLocation.geometry.location.lng() : -96.79762963384655} /> */}
            </div>
            <div className="absolute top-0 left-0 -z-50 w-[200px] h-[200px] opacity-0">
                <Map
                    defaultZoom={3}
                    defaultCenter={{ lat: 22.54992, lng: 0 }}
                    gestureHandling={'greedy'}
                    disableDefaultUI={true}
                />
            </div>
            <div className={cn("relative z-10 w-screen h-screen flex justify-center items-center min-h-[100vh] pointer-events-none overflow-hidden duration-1000 transition-background", interrupting ? "transparent" : "bg-black/25")}>

                <div className={cn("flex desktop:flex-row phone:flex-col gap-2 transition-opacity duration-1000 max-w-full pointer-events-none")}>
                    <div className={cn("relative p-5 pb-0 flex flex-col justify-center gap-2 pointer-events-none", interrupting ? "h-screen" : "h-max")}>
                        <div className="p-5 flex flex-col gap-2 pointer-events-auto">
                            <h1 className={cn("text-6xl transition-opacity", interrupting ? "opacity-0 pointer-events-none h-0" : "")}><b>GeoGo</b></h1>
                            <div
                            className="w-[400px] max-w-full"
                                onClick={onUninterrupt}
                            >
                                <AutocompleteCustom
                                    onPlaceSelect={setCurrentLocation} setPredictionResults={setPredictionResults} selectedPlaceId={selectedPlaceId} setCurrentLocation={setCurrentLocation} />
                            </div>
                            <p className={cn("text-2xl transition-opacity", interrupting ? "opacity-0 pointer-events-none" : "")}>Explore the world in 3D</p>
                            <div className={cn("flex flex-row items-center justify-start gap-1 transition-opacity", interrupting ? "opacity-0 pointer-events-none" : "")}>
                                <p>Built with </p>
                                <Image src={mapsLogo} alt="Google Maps" className="max-h-5 object-contain w-max" />
                                <Image src={mapsLogoText} alt="Google Maps" className="max-h-5 object-contain w-max" />
                            </div>
                        </div>

                        <div className={cn("transition-all", interrupting ? "h-[100vh]" : "h-0")} />

                    </div>
                    <div className={cn("p-5 pt-0 flex flex-col justify-center gap-2 transition-opacitiy", predictionResults.length > 0 && interrupting !== true ? "phone:animate-growHeight desktop:animate-growWidth opacity-100" : "phone:animate-shrinkHeight desktop:animate-shrinkWidth opacity-0 phone:max-h-0 desktop:max-w-0")}>

                        <ul className="custom-list w-[400px] h-[400px] max-w-full max-h-[50vh] bg-black/50 rounded-lg p-3 pointer-events-auto overflow-y-auto">
                            {predictionResults.map(({ place_id, description }) => {
                                return (
                                    <li
                                        key={place_id}
                                        className="custom-list-item animate-fadeUp p-3 cursor-pointer hover:bg-white/15 transition-background rounded-lg"
                                        onClick={() => setSelectedPlaceId(place_id)}
                                    >
                                        {description}
                                    </li>
                                );
                            })}
                        </ul>

                    </div>
                </div>
            </div>

        </>
    );
}