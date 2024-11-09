import { Loader3DTiles, LoaderProps, Runtime } from 'three-loader-3dtiles'
import { useLoader, useThree, useFrame } from '@react-three/fiber'
import { Loader, Vector2, WebGLRenderer } from 'three'

class Loader3DTilesBridge extends Loader {
    props: LoaderProps = {
        url: "",
        renderer: new WebGLRenderer(),
        viewport: {
            width: 1920,
            height: 1080,
            devicePixelRatio: 1
        },
    }

    load(url: string, onLoad: (result: { model: any, runtime: Runtime }) => void, onProgress?: (event: ProgressEvent<EventTarget>) => void, onError?: (error: Error) => void) {
        const loadTileset = async () => {
            try {
                this.props.url = url;
                const result = await Loader3DTiles.load({
                    ...this.props,
                    onProgress
                })
                onLoad(result);
            }
            catch (e) {
                console.log("Error loading 3d tiles!", e);
                if (onError) {
                    onError(e as Error);
                }
            }
        }
        loadTileset();
    }
    setProps(props: LoaderProps) {
        this.props = props;
    }
};

function Loader3DTilesR3FAsset(props: any) {
    const threeState = useThree();
    const loaderProps = {
        url: "",
        renderer: threeState.gl,
        viewport: getViewport(threeState.gl),
        options: {
            ...props
        }
    }

    // TODO: Getting type error
    // @ts-ignore
    const { model, runtime } = useLoader(Loader3DTilesBridge, props.url, (loader: Loader3DTilesBridge) => {
        loader.setProps(loaderProps);
    })

    useFrame(({ size, camera }, dt) => {
        runtime.update(dt, camera);
    });

    return (
        <group {...props} dispose={runtime.dispose}>
            <primitive object={model} />
        </group>
    )
}
function getViewport(renderer: WebGLRenderer) {
    const viewSize = renderer.getSize(new Vector2());
    return {
        width: viewSize.x,
        height: viewSize.y,
        devicePixelRatio: renderer.getPixelRatio()
    }
}

export { Loader3DTilesR3FAsset }