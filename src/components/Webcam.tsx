import { createSignal, onCleanup, onMount, For } from 'solid-js';
import { invoke } from "@tauri-apps/api/core";
import { AppState } from '../utils/states';

interface DeviceInfo {
    deviceId: string;
    label: string;
}

const Webcam = () => {
    const appState = AppState.getInstance();
    const _settings = appState.getState("Settings");
    const [, setImageId] = _settings.imageId;
    const [pixelSize,] = _settings.pixelSize;
    const [saturation,] = _settings.saturation;
    const [edge,] = _settings.edge;
    const [numOfColors,] = _settings.numOfColors;
    const [morphology,] = _settings.morphology;
    const [gaussian,] = _settings.gaussian;
    const [median,] = _settings.median;
    let videoRef: HTMLVideoElement | undefined;
    let canvasRef: HTMLCanvasElement | undefined;
    const [error, setError] = createSignal<string | null>(null);
    let frameInterval: number | undefined;
    const [devices, setDevices] = createSignal<DeviceInfo[]>([]);
    const [selectedDevice, setSelectedDevice] = createSignal<string>('');
    const [processing, setProcessing] = createSignal(false);

    const captureFrame = async () => {
        if (videoRef && canvasRef && !processing()) {
            setProcessing(true);
            const context = canvasRef.getContext('2d');
            if (context) {
                setProcessing(true);
                canvasRef.width = videoRef.videoWidth;
                canvasRef.height = videoRef.videoHeight;
                context.drawImage(videoRef, 0, 0);
                let frame = canvasRef.toDataURL('image/png');
                if (frame.startsWith("data:image/png;base64,")) {
                    frame = frame.replace("data:image/png;base64,", "");
                }
                // モザイク前処理
                const image_id = await invoke("upload_file", { img: frame });
                if (gaussian()) { await invoke("apply_gaussian", { id: image_id }); }
                if (median()) { await invoke("apply_median", { id: image_id, size: 5 }); }
                await invoke("apply_saturation", { id: image_id, value: saturation() || 1 });
                if (edge()) { await invoke("apply_edge", { id: image_id }); }
                if (morphology()) { await invoke("apply_morphology", { id: image_id }); };
                frame = await invoke("get_image", { id: image_id });

                // モザイク後
                const downscale = await invoke("apply_downscale", { image: frame, size: pixelSize() || 128 });
                await invoke("set_image", { id: image_id, image: downscale });
                const colors = await invoke("kmeans", { id: image_id, k: numOfColors() || 8 });
                await invoke("apply_colors", { id: image_id, colors: colors });
                const image = await invoke("get_image", { id: image_id });
                console.log(videoRef.videoHeight, videoRef.videoWidth);
                const upscale = await invoke("apply_upscale", { image: image, width: videoRef.videoWidth, height: videoRef.videoHeight })
                setImageId(`data:image/png;base64,${upscale}`);
            }
            setProcessing(false);
        }
    };

    const getDevices = async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ video: true }); // 権限を要求
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices
                .filter(device => device.kind === 'videoinput')
                .map(device => ({
                    deviceId: device.deviceId,
                    label: device.label || `Camera ${device.deviceId}`
                }));
            setDevices(videoDevices);
            if (videoDevices.length > 0) {
                setSelectedDevice(videoDevices[0].deviceId);
            }
        } catch (err) {
            console.error("Error getting devices:", err);
            setError("カメラデバイスの取得に失敗しました。");
        }
    };

    const startStream = async (deviceId: string) => {
        if (!deviceId) return;

        let stream: MediaStream | null = null;
        try {
            if (videoRef?.srcObject) {
                const oldStream = videoRef.srcObject as MediaStream;
                oldStream.getTracks().forEach(track => track.stop());
            }

            stream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: { exact: deviceId } }
            });

            if (videoRef) {
                videoRef.srcObject = stream;
                videoRef.onloadedmetadata = () => {
                    frameInterval = window.setInterval(captureFrame, 10);
                };
            }
        } catch (err) {
            console.error("Error accessing webcam:", err);
            setError("Webカメラへのアクセスに失敗しました。許可を確認してください。");
        }
    };

    onMount(async () => {
        await getDevices();
        if (selectedDevice()) {
            await startStream(selectedDevice());
        }

        onCleanup(() => {
            if (videoRef?.srcObject) {
                const stream = videoRef.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
            if (frameInterval) {
                clearInterval(frameInterval);
            }
        });
    });

    return (
        <div>
            {error() ? (
                <p style={{ color: 'red' }}>{error()}</p>
            ) : (
                <>
                    <div style={{ margin: '10px 0' }}>
                        <select
                            value={selectedDevice()}
                            onChange={(e) => {
                                setSelectedDevice(e.currentTarget.value);
                                startStream(e.currentTarget.value);
                            }}
                        >
                            <For each={devices()}>
                                {(device) => (
                                    <option value={device.deviceId}>
                                        {device.label}
                                    </option>
                                )}
                            </For>
                        </select>
                    </div>
                    <video ref={videoRef} autoplay playsinline style={{ width: '100%', "max-width": '600px' }} />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                </>
            )}
        </div>
    );
};

export default Webcam;