import { createSignal, onCleanup, onMount, For } from 'solid-js';
import { invoke } from "@tauri-apps/api/core";
import { AppState } from '../utils/states';

interface DeviceInfo {
    deviceId: string;
    label: string;
}

const Webcam = () => {
    const appState = AppState.getInstance();
    const [_, setImageId] = appState.getState("imageId");
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
                const frame = canvasRef.toDataURL('image/png');
                const mosaic = await invoke("apply_mosaic", { image: frame, size: 128 });
                const image_id = await invoke("upload_file", { img: mosaic });
                const colors = await invoke("kmeans", { id: image_id, k: 8 });
                await invoke("apply_colors", { id: image_id, colors: colors });
                const image = await invoke("get_image", { id: image_id });
                setImageId(`data:image/png;base64,${image}`);
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