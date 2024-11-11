// import * as ReactDOM from 'react-dom/client'
import { useState, useEffect, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
    PerspectiveCamera,
    OrbitControls,
    PointerLockControls,
} from "@react-three/drei";
import { ErrorBoundary } from "react-error-boundary";
import { Matrix4, Euler } from "three";

import { Loader3DTilesR3FAsset } from "./GoogleTiles";
import { Controls } from "./Controls";

export function TileContainer() {
    const camera = useRef(null);

    return (
        <div
            id="canvas-container"
            style={{
                width: "100%",
                height: "100%",
            }}
        >
            <Canvas style={{ background: "#272730", width: "100%", height: "100%" }}>
                <Controls cameraRef={camera}>
                    <PerspectiveCamera ref={camera}>
                        <ErrorBoundary
                            fallbackRender={() => (
                                <mesh>
                                    <sphereGeometry />
                                    <meshBasicMaterial color="red" />
                                </mesh>
                            )}
                        >
                            <Suspense
                                fallback={
                                    <mesh>
                                        <sphereGeometry />
                                        <meshBasicMaterial color="yellow" />
                                    </mesh>
                                }
                            >
                                <group rotation={new Euler(Math.PI / 2, 0, 0)}>
                                    <Loader3DTilesR3FAsset

                                        dracoDecoderPath={
                                            "https://unpkg.com/three@0.160.0/examples/jsm/libs/draco"
                                        }
                                        basisTranscoderPath={
                                            "https://unpkg.com/three@0.160.0/examples/jsm/libs/basis"
                                        }
                                        rotation={new Euler(-Math.PI / 2, 0, 0)}
                                        googleApiKey={"AIzaSyAOsk3zgPK7ZQWWWa7VTjg2zvU6WMla27U"}
                                        // url="https://int.nyt.com/data/3dscenes/ONA360/TILESET/0731_FREEMAN_ALLEY_10M_A_36x8K__10K-PN_50P_DB/tileset_tileset.json"
                                        url="https://tile.googleapis.com/v1/3dtiles/root.json"
                                        maximumScreenSpaceError={48}
                                        resetTransform={true}
                                    />
                                </group>
                            </Suspense>
                        </ErrorBoundary>
                    </PerspectiveCamera>


                    {/* <OrbitControls camera={camera.current ?? undefined} /> */}
                </Controls>
            </Canvas>
        </div>
    );
}