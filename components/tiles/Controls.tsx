import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  PerspectiveCamera,
  OrbitControls,
  PointerLockControls,
} from "@react-three/drei";
import { THREE } from "expo-three";

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
  const moveUp = useRef(false);
  const moveDown = useRef(false);

  const { camera, scene } = useThree();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
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
        case "e":
        case " ":
          moveUp.current = true;
          break;
        case "q":
        case "Shift":
          moveDown.current = true;
          break;
        case "Escape":
          moveForward.current = false;
          moveBackward.current = false;
          moveLeft.current = false;
          moveRight.current = false;
          moveUp.current = false;
          moveDown.current = false;
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
        case "e":
        case " ":
          moveUp.current = false;
          break;
        case "q":
        case "Shift":
          moveDown.current = false;
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);


    // add fog to the scene
    scene.fog = new THREE.Fog("#E7E8D7", 100, 1000);
    const light = new THREE.DirectionalLight(0xffffff, 10);
    light.position.set(0, 0, 10);
    scene.add(light);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    const speed = 50 * delta;

    // get forward from camera in world space
    const forward = camera.getWorldDirection(new THREE.Vector3());
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0));
    right.normalize();

    if (moveForward.current) {
      cameraRef.current.position.sub(forward.multiplyScalar(speed));
    }
    if (moveBackward.current) {
      cameraRef.current.position.add(forward.multiplyScalar(speed));
    }
    if (moveLeft.current) {
      cameraRef.current.position.add(right.multiplyScalar(speed));
    }
    if (moveRight.current) {
      cameraRef.current.position.sub(right.multiplyScalar(speed));
    }
    if (moveUp.current) {
      cameraRef.current.position.y -= speed;
    }
    if (moveDown.current) {
      cameraRef.current.position.y += speed;
    }
  });

  const [lastTouch, setLastTouch] = useState({ x: -1, y: -1 });
  const zoom = useRef(0);
  const zooming = useRef(false);

  const onTouchStart = useCallback((event: TouchEvent) => {
    setLastTouch({ x: event.touches[0].clientX, y: event.touches[0].clientY });

    if (event.touches.length === 2) {
      zooming.current = true;
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      zoom.current = distance;
      setLastTouch({ x: (touch1.clientX + touch2.clientX) / 2, y: (touch1.clientY + touch2.clientY) / 2 });
    }
  }, [zoom, zooming]);


  const onTouchEnd = useCallback((event: TouchEvent) => {
    setLastTouch({ x: -1, y: -1 });

    if (zooming.current && event.touches.length == 0) {
      zooming.current = false;
    }
  }, [zooming]);


  const onTouchZoom = useCallback((event: TouchEvent) => {
    event.preventDefault();

    if (event.touches.length < 2) {
      return;
    }

    zooming.current = true;

    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const delta = zoom.current - distance;
    camera.translateZ(delta * 0.1);
    zoom.current = distance;

    const avgX = (touch1.clientX + touch2.clientX) / 2;
    const avgY = (touch1.clientY + touch2.clientY) / 2;
    setLastTouch({ x: avgX, y: avgY });

    const posDx = lastTouch.x - avgX;
    const posDy = lastTouch.y - avgY;

    const xspeed = 0.1;
    const yspeed = 0.1;
    // translate camera left/right
    camera.translateX(posDx * xspeed);
    // translate camera up/down
    camera.translateY(-posDy * yspeed);


  }, [camera, zoom, zooming, lastTouch.x, lastTouch.y]);

  const onTouchMove = useCallback((event: TouchEvent) => {
    event.preventDefault();

    if (event.touches.length === 2 || zooming.current) {
      onTouchZoom(event);
      return;
    }

    if (lastTouch.x === -1) {
      setLastTouch({ x: event.touches[0].clientX, y: event.touches[0].clientY });
      return;
    }

    const touch = event.touches[0];
    const x = touch.clientX;
    const y = touch.clientY;
    const dx = lastTouch.x - x;
    const dy = lastTouch.y - y;
    setLastTouch({ x, y });

    const xspeed = 0.001;
    const yspeed = 0.001;
    // rotate camera left/right around the world y axis
    camera.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), -dx * xspeed);


    // rotate camera up/down perpendicular to the camera's right vector but capped at 45 degrees up/down
    const up = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3();
    right.crossVectors(camera.getWorldDirection(new THREE.Vector3()), up);
    right.normalize();

    const angle = camera.getWorldDirection(new THREE.Vector3()).angleTo(up);
    if (angle > Math.PI / 6 && dy < 0) {
      camera.rotateOnWorldAxis(right, -dy * yspeed);
    } else if (angle < Math.PI - Math.PI / 6 && dy > 0) {
      camera.rotateOnWorldAxis(right, -dy * yspeed);
    }
  }, [lastTouch.x, lastTouch.y, zooming, onTouchZoom]);

  useEffect(() => {
    // add touch controls
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchstart", onTouchStart);
    document.addEventListener("touchend", onTouchEnd);
    return () => {
      // remove touch controls
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [onTouchMove]);

  return (
    <>
      <PointerLockControls onUnlock={_ => {
        moveForward.current = false;
        moveBackward.current = false;
        moveLeft.current = false;
        moveRight.current = false;
        moveUp.current = false;
        moveDown.current = false;
      }}
        ref={controlsRef} />
      {children}
    </>
  );
}

