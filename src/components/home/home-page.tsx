"use client";

import Image from "next/image";
// import { TileContainer } from "../tiles/TileContainer";

import mapsLogo from "@/assets/images/maps.png";
import mapsLogoText from "@/assets/images/maps-text.png";

import diver from "@/assets/images/guesses/diver.png";
import dallas from "@/assets/images/guesses/dallas.png";
import paris from "@/assets/images/guesses/paris.png";
import fuji from "@/assets/images/guesses/fuji.png";

import { Button, cn, Slider, Switch } from "@nextui-org/react";
import { AutocompleteCustom } from "../tiles/autocomplete";
import { createRef, useCallback, useEffect, useRef, useState } from "react";
import { Map, MapMouseEvent } from "@vis.gl/react-google-maps";
import { Map3D, Map3DCameraProps } from "../map-3d";
import { MiniMap } from "../minimap";
import { Camera, ChevronRight } from "lucide-react";

import html2canvas from 'html2canvas';
import { useCallbackRef } from "../utility-hooks";

const INITIAL_VIEW_PROPS = {
    center: { lat: 37.72809, lng: -119.64473, altitude: 1300 },
    range: 5000,
    heading: 61,
    tilt: 69,
    roll: 0
};

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

const games = [{
    img: diver,
    lat: 35.624482197457496,
    lng: 139.77382949942435,
    alt: 13.074589226932446,
    heading: 12.05157293734417,
    tilt: 76.47917175255368,
},
{
    img: dallas,
    lat: 32.78039030080041,
    lng: -96.7997865082336,
    alt: 228.72309605044114,
    heading: -25.847574272435526,
    tilt: 65.90800647480012,
},
{
    img: paris,
    lat: 48.85838777341982,
    lng: 2.2943179598216323,
    alt: 132.44005153269651,
    heading: -45.39558738954526,
    tilt: 93.23419514450136,
},
{
    img: fuji,
    lat: 35.36664388268882,
    lng: 138.7820793295789,
    alt: 1887.7734524279738,
    heading: 35.60667370897562,
    tilt: 79.61999805876013,
}];


export default function HomePage() {

    const [currentGame, setCurrentGame] = useState(games[0]);
    const [didWin, setDidWin] = useState(false);

    function generateNewGame() {
        setDidWin(false);
        let newGame = games[Math.floor(Math.random() * games.length)];
        while (newGame === currentGame) {
            newGame = games[Math.floor(Math.random() * games.length)];
        }
        setCurrentGame(newGame);
    }

    useEffect(() => {
        generateNewGame();
    }, []);

    const ref = createRef<google.maps.maps3d.Map3DElement>();
    const [viewProps, setViewProps] = useState(INITIAL_VIEW_PROPS);
    const [showLabels, setShowLabels] = useState(true);
    const [moving, setMoving] = useState(false);
    const hoverOptions = useRef(false);
    const [showingHint, setShowingHint] = useState(false);

    const handleCameraChange = useCallback((props: Map3DCameraProps) => {
        setViewProps(oldProps => ({ ...oldProps, ...props }));

        // if close enough to the current game, show hint
        if (
            getDistanceFromLatLonInKm(props.center.lat, props.center.lng, currentGame.lat, currentGame.lng) < 0.3 
            // Math.abs(currentGame.alt - props.center.altitude) < 100 &&
            // Math.abs(currentGame.heading - props.heading) < 15
            // Math.abs(currentGame.tilt - props.tilt) < 20
        ) {
            setShowingHint(true);
            setDidWin(true);
        }
    }, [didWin, showingHint, currentGame]);

    const handleMapClick = useCallback((ev: MapMouseEvent) => {
        if (!ev.detail.latLng) return;

        const { lat, lng } = ev.detail.latLng;
        setViewProps(p => ({ ...p, center: { lat, lng, altitude: 200 } }));
    }, []);

    const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

    const [currentLocation, setCurrentLocation] = useState<google.maps.places.PlaceResult | null>(null);
    const [lastLocation, setLastLocation] = useState<google.maps.places.PlaceResult | null>(null);

    const newestCoords = useRef({ lat: INITIAL_VIEW_PROPS.center.lat, lng: INITIAL_VIEW_PROPS.center.lng });
    const lastCoords = useRef({ lat: INITIAL_VIEW_PROPS.center.lat, lng: INITIAL_VIEW_PROPS.center.lng, range: INITIAL_VIEW_PROPS.range });

    const [predictionResults, setPredictionResults] = useState<
        Array<google.maps.places.AutocompletePrediction>
    >([]);

    useEffect(() => {
        if (currentLocation) {
            if (lastLocation) {
                lastCoords.current = {
                    lat: lastLocation.geometry.location.lat(),
                    lng: lastLocation.geometry.location.lng(),
                    range: viewProps.range
                };
            }

            setInterrupting(true);
            setMoving(true);

            velocity.current = 0;
            setTimeout(() => {
                console.log('interrupting');
                setInterrupting(true);
            }, 100);

            // the longer the distance, the larger the max range 
            // const maxRange = Math.max(
            //     Math.abs(currentLocation.geometry.location.lat() - lastCoords.current.lat),
            //     Math.abs(currentLocation.geometry.location.lng() - lastCoords.current.lng)
            // ) * 10000;
            // the longer the distance, the larger the max range exponentially
            const maxRange = Math.pow(Math.abs(currentLocation.geometry.location.lat() - lastCoords.current.lat) + Math.abs(currentLocation.geometry.location.lng() - lastCoords.current.lng), 1.25) * 3000;

            const timeout = setInterval(() => {
                // move towards the current location

                const percent = 1 - Math.abs(newestCoords.current.lat - currentLocation.geometry.location.lat()) / Math.abs(lastCoords.current.lat - currentLocation.geometry.location.lat());

                console.log(percent);


                // const range = Math.max((1 - (Math.abs(0.4 - percent) / 0.4)) * maxRange, 400)
                // make the curve smoother by using a quadratic function
                const range = Math.max((1 - Math.pow(Math.abs(0.4 - percent) / 0.4, 2)) * maxRange, 400)


                const altitude = Math.max((1 - (Math.abs(0.5 - percent) / 0.5)) * maxRange / 1000, 500);
                // make altitude smoother by using a quadratic function
                // const altitude = Math.max((1 - Math.pow(Math.abs(0.5 - percent) / 0.5, 2)) * 1000, 200);

                console.log('percent', percent, 'range', range);

                // if newestCoords is close enough to currentLocation, stop
                if (
                    Math.abs(newestCoords.current.lat - currentLocation.geometry.location.lat()) < 0.01 &&
                    Math.abs(newestCoords.current.lng - currentLocation.geometry.location.lng()) < 0.01
                ) {
                    setLastLocation(currentLocation);
                    clearInterval(timeout);
                    setMoving(false);
                    // setInterrupting(false);
                    return;
                }

                // if (velocity.current < 0.000000001) {
                //     velocity.current += velocity.current * 0.01;
                // }

                // use quadratic function to make the velocity smoother and really slow at the end
                velocity.current = Math.max(0.000001, velocity.current - Math.pow(velocity.current, 2) * 0.000001);

                newestCoords.current = {
                    lat: newestCoords.current.lat + (currentLocation.geometry.location.lat() - lastCoords.current.lat) * velocity.current,
                    lng: newestCoords.current.lng + (currentLocation.geometry.location.lng() - lastCoords.current.lng) * velocity.current
                };

                console.log('range', range);

                setViewProps(p => ({
                    ...p, center: {
                        lat: newestCoords.current.lat,
                        lng: newestCoords.current.lng,
                        altitude: altitude,
                    },
                    range: range,
                    tilt: 65,
                }));
            }, 30 / 1000);

        }
    }, [currentLocation]);

    const [interrupting, setInterrupting] = useState<NodeJS.Timeout | boolean>(null);
    const velocity = useRef(0.01);

    useEffect(() => {
        // increment heading by 1 every 100ms
        if (interrupting || moving) {
            velocity.current = 0.01;
            return;
        }

        const interval = setInterval(() => {
            setViewProps(p => ({ ...p, heading: (p.heading + velocity.current) % 360 }));

            if (velocity.current < 0.1) {
                velocity.current = velocity.current + velocity.current * 0.01;
            }
        }, 60 / 1000);

        return () => clearInterval(interval);
    }, [interrupting, velocity, moving]);

    const onInterrupt = useCallback(() => {
        console.log(viewProps);
        setInterrupting(true);
    }, [interrupting, viewProps]);

    const onUninterrupt = useCallback(() => {
        setInterrupting(false);
    }, [interrupting]);

    return (
        <>
            <div className="absolute top-0 left-0 w-full h-full" id="3dmap" onWheel={onInterrupt} onMouseDown={onInterrupt} onTouchStart={onInterrupt}>
                <Map3D
                    ref={ref}
                    {...viewProps}
                    onCameraChange={handleCameraChange}
                    defaultLabelsDisabled={interrupting !== true || !showLabels}
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
                        <div className="relative p-5 flex flex-col gap-2 pointer-events-auto">
                            <h1 className={cn("text-6xl transition-opacity", interrupting ? "opacity-0 pointer-events-none h-0" : "")}><b>GeoGo</b></h1>
                            <div
                                className="w-[400px] max-w-full flex gap-1"
                                onMouseDown={onUninterrupt}
                            >
                                <AutocompleteCustom
                                    disabled={moving}
                                    onPlaceSelect={setCurrentLocation} setPredictionResults={setPredictionResults} selectedPlaceId={selectedPlaceId} setCurrentLocation={setCurrentLocation} />
                                <Button className="w-0 p-0 min-w-14" onClick={async () => {
                                    // import('html2canvas').then(html2canvas => {html2canvas.default(document.body as HTMLElement).then(canvas => {
                                    //     try {
                                    //         const dataURL = canvas.toDataURL('image/png');
                                    //         const a = document.createElement('a');
                                    //         a.href = dataURL;
                                    //         a.download = '3dmap.png';
                                    //         a.click();
                                    //     } catch (e) {
                                    //         console.error(e);
                                    //     }
                                    // })});


                                }}>
                                    <Camera size={24} />
                                </Button>
                            </div>

                            <p className={cn("text-2xl transition-opacity", interrupting ? "opacity-0 pointer-events-none h-0" : "")}>Explore the world in 3D</p>
                            <div className={cn("flex flex-row items-center justify-start gap-1 transition-opacity", interrupting ? "opacity-0 pointer-events-none h-0" : "")}>
                                <p>Built with </p>
                                <Image src={mapsLogo} alt="Google Maps" className="max-h-5 object-contain w-max" />
                                <Image src={mapsLogoText} alt="Google Maps" className="max-h-5 object-contain w-max" />
                            </div>
                            {interrupting && <div
                                className="w-[400px] max-w-full bg-black/50 rounded-lg p-3 transition-opacity pointer-events-auto hover:opacity-100 sm:opacity-5 lg:opacity-0 -mt-3"
                            >
                                <div className="flex flex-row items-center">
                                    <Switch
                                        aria-label="Show Labels"
                                        checked={showLabels}
                                        defaultSelected={showLabels}
                                        defaultChecked={showLabels}
                                        onChange={() => setShowLabels(!showLabels)}
                                    />
                                    <p>Show Labels</p>
                                </div>

                            </div>}
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

            <div className="absolute left-0 top-0 p-5 h-screen w-screen max-w-full flex flex-col justify-center items-start pointer-events-none">
                <div className={cn("p-2 rounded-lg flex flex-row max-w-full justify-center transition-transform items-center", showingHint && interrupting && !moving ? "translate-x-[0%]" : "translate-x-[-97%]")}>
                    <div className="bg-white max-w-full p-2 rounded-lg flex flex-row justify-center items-center gap-1 pointer-events-auto">
                        <div className="flex flex-col justify-center items-center gap-2 w-max max-w-full">
                            <Image src={currentGame.img} alt="Google Maps" className="object-fill w-max max-h-[400px] max-w-full rounded-lg" />
                            <div className="flex flex-row justify-between w-full">
                                <p className="text-black">{didWin ? "You found it!" : "Use the map to find the exact location of this image!"}</p>
                                <p className="text-black">{getDistanceFromLatLonInKm(viewProps.center.lat, viewProps.center.lng, currentGame.lat, currentGame.lng).toFixed(2)}km away</p>
                            </div>
                            <Button
                                onClick={generateNewGame}
                            >
                                New Game
                            </Button>
                        </div>
                    </div>
                    <div
                        onClick={() => {
                            setShowingHint(!showingHint);
                        }}
                        className={cn("bg-white py-2 rounded-r-lg flex flex-row justify-center items-center gap-1 pointer-events-auto cursor-pointer", showingHint && interrupting && !moving ? "" : "")}>
                        <ChevronRight className="text-black" size={24} />
                    </div>
                </div>
            </div>

        </>
    );
}