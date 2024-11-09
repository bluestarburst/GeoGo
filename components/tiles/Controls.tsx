import { useState, useEffect, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  PerspectiveCamera,
  OrbitControls,
  PointerLockControls,
} from "@react-three/drei";

export function Controls({
  children,
  cameraRef,
}: {
  children: React.ReactNode;
  cameraRef: React.MutableRefObject<any>;
}) {
  const controlsRef = useRef<any>(null);
  const moveForward = useRef(false);
  const moveBackward = useRef(false);
  const moveLeft = useRef(false);
  const moveRight = useRef(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      console.log(event.key);
      switch (event.key) {
        case "w":
          moveForward.current = true;
          break;
        case "s":
          moveBackward.current = true;
          break;
        case "a":
          moveLeft.current = true;
          break;
        case "d":
          moveRight.current = true;
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.key) {
        case "w":
          moveForward.current = false;
          break;
        case "s":
          moveBackward.current = false;
          break;
        case "a":
          moveLeft.current = false;
          break;
        case "d":
          moveRight.current = false;
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    const speed = 500 * delta;

    if (moveForward.current) {
      cameraRef.current.position.x += speed;
    }
    if (moveBackward.current) {
      cameraRef.current.position.x -= speed;
    }
    if (moveLeft.current) {
      cameraRef.current.position.z -= speed;
    }
    if (moveRight.current) {
      cameraRef.current.position.z += speed;
    }
  });

  return (
    <>
      {/* <PointerLockControls ref={controlsRef} /> */}
      {children}
    </>
  );
}
