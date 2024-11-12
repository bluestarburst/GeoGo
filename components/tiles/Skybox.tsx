import { useLoader, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { Image } from "react-native";
import { loadCubeTextureAsync, TextureLoader, THREE } from "expo-three";

import { CubeTexture, CubeTextureLoader } from "three";

const day = [
    require('@/assets/images/skybox/day/px.png'),
    require('@/assets/images/skybox/day/nx.png'),
    require('@/assets/images/skybox/day/py.png'),
    require('@/assets/images/skybox/day/ny.png'),
    require('@/assets/images/skybox/day/pz.png'),
    require('@/assets/images/skybox/day/nz.png'),
];

const sunrise = [
    require('@/assets/images/skybox/sunrise/px.png'),
    require('@/assets/images/skybox/sunrise/nx.png'),
    require('@/assets/images/skybox/sunrise/py.png'),
    require('@/assets/images/skybox/sunrise/ny.png'),
    require('@/assets/images/skybox/sunrise/pz.png'),
    require('@/assets/images/skybox/sunrise/nz.png'),
];

const sunset = [
    require('@/assets/images/skybox/sunset/px.png'),
    require('@/assets/images/skybox/sunset/nx.png'),
    require('@/assets/images/skybox/sunset/py.png'),
    require('@/assets/images/skybox/sunset/ny.png'),
    require('@/assets/images/skybox/sunset/pz.png'),
    require('@/assets/images/skybox/sunset/nz.png'),
];

// export function getLocalImgPath(path: string = ""): string {
//     // return Image.resolveAssetSource(require(path)).uri;
// }


export function SkyBox({
    currentSkybox = "day"
}: {
    currentSkybox?: "day" | "sunrise" | "sunset";
}) {
    const { scene } = useThree();

    const configs = {
        day: {
            images: day,
            fog: new THREE.Fog("#E7E8D7", 10, 1000),
            light: new THREE.DirectionalLight(0xffffff, 10)
        },
        sunrise: {
            images: sunrise, // use pinkish white for fog
            fog: new THREE.Fog("#493749", 10, 1000),
            light: new THREE.DirectionalLight("#ffabbd", 5)
        },
        sunset: {
            images: sunset,
            fog: new THREE.Fog("#5A3607", 10, 1000),
            light: new THREE.DirectionalLight("#e6ba85", 2)
        }
    }

    async function loadTexture() {

        let ready = 0;

        function updateReady() {
            ready++;
        }

        const cubes = configs[currentSkybox].images.map((path) => new TextureLoader().load(path, updateReady));

        while (ready < 6) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // use loader
        const loader = new CubeTextureLoader();

        const texture = loader.load([
            cubes[0].image.src,
            cubes[1].image.src,
            cubes[2].image.src,
            cubes[3].image.src,
            cubes[4].image.src,
            cubes[5].image.src,
        ]);

        scene.background = texture;

        

    }

    useEffect(() => {
        loadTexture();

        // add fog to the scene
        scene.fog = configs[currentSkybox].fog;
        const light = configs[currentSkybox].light;
        light.position.set(0, 0, 10);
        scene.add(light);

        return () => {
            scene.background = null;
            scene.fog = null;
            scene.remove(light);
        }
    }, [currentSkybox]);


    return null;
}