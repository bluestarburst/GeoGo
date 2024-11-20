"use client";

import Image from "next/image";
import { TileContainer } from "../tiles/TileContainer";

import mapsLogo from "@/assets/images/maps.png";
import { cn, Input } from "@nextui-org/react";
import { AutocompleteCustom } from "../tiles/autocomplete";
import { useState } from "react";
import { Map } from "@vis.gl/react-google-maps";

export default function HomePage() {

    const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);

    const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

    const [currentLocation, setCurrentLocation] = useState<google.maps.places.PlaceResult | null>(null);

    const [predictionResults, setPredictionResults] = useState<
        Array<google.maps.places.AutocompletePrediction>
    >([]);

    return (
        <>
            <div className="absolute top-0 left-0 w-full h-full">
                <TileContainer lat={currentLocation ? currentLocation.geometry.location.lat() : 32.781311113132396} lng={currentLocation ? currentLocation.geometry.location.lng() : -96.79762963384655} />
            </div>
            <div className="absolute -z-50 opacity-0">
                <Map
                    defaultZoom={3}
                    defaultCenter={{ lat: 22.54992, lng: 0 }}
                    gestureHandling={'greedy'}
                    disableDefaultUI={true}
                />
            </div>
            <div className="relative z-10 w-screen h-screen flex justify-center items-center min-h-[100vh]">

                <div className="flex flex-row gap-2">
                    <div className="p-5 flex flex-col gap-2">
                        <h1 className="text-6xl"><b>GeoGo</b></h1>
                        <AutocompleteCustom onPlaceSelect={setSelectedPlace} setPredictionResults={setPredictionResults} selectedPlaceId={selectedPlaceId} setCurrentLocation={setCurrentLocation} />
                        <p className="text-2xl">Explore the world in 3D</p>
                        <div className="flex flex-row items-center justify-start gap-1">
                            <p>Built with </p>
                            <Image src={mapsLogo} alt="Google Maps" className="max-h-5 object-contain w-max" />
                        </div>

                    </div>
                    <div className={cn("p-5 flex flex-col gap-2 transition-opacitiy", predictionResults.length > 0 ? "animate-growWidth opacity-100" : "animate-shrinkWidth opacity-0 max-w-0")}>

                        <ul className="custom-list w-[400px] bg-black/50 rounded-lg p-3">
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