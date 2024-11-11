import { useLoader, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { Image } from "react-native";
import { loadCubeTextureAsync, TextureLoader } from "expo-three";

const px = require('@/assets/images/skybox/px.png');

import px2 from '@/assets/images/skybox/px.png';
import { CubeTexture, CubeTextureLoader } from "three";


// export function getLocalImgPath(path: string = ""): string {
//     // return Image.resolveAssetSource(require(path)).uri;
// }


export function SkyBox() {
    const { scene } = useThree();

    async function loadTexture() {

        let ready = 0;

        function updateReady() {
            ready++;
        }
        
        const px = new TextureLoader().load(require('@/assets/images/skybox/px.png'), updateReady);
        const nx = new TextureLoader().load(require('@/assets/images/skybox/nx.png'), updateReady);
        const py = new TextureLoader().load(require('@/assets/images/skybox/py.png'), updateReady);
        const ny = new TextureLoader().load(require('@/assets/images/skybox/ny.png'), updateReady);
        const pz = new TextureLoader().load(require('@/assets/images/skybox/pz.png'), updateReady);
        const nz = new TextureLoader().load(require('@/assets/images/skybox/nz.png'), updateReady);

        while (ready < 6) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // use loader
        const loader = new CubeTextureLoader();

        const texture = loader.load([
            px.image.src,
            nx.image.src,
            py.image.src,
            ny.image.src,
            pz.image.src,
            nz.image.src,
        ]);

        console.log('texture', texture, px.image.src);

        scene.background = texture;

    }

    loadTexture();


    return null;
}