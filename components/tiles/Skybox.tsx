import { useLoader, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { Image } from "react-native";
import { loadCubeTextureAsync, TextureLoader } from "expo-three";

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


// export function getLocalImgPath(path: string = ""): string {
//     // return Image.resolveAssetSource(require(path)).uri;
// }


export function SkyBox() {
    const { scene } = useThree();

    const configs = {
        day: {
            images: day,
            light: ,
        }
    }

    async function loadTexture() {

        let ready = 0;

        function updateReady() {
            ready++;
        }

        const cubes = sunrise.map((path) => new TextureLoader().load(path, updateReady));

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

    loadTexture();


    return null;
}