import { createSignal, onCleanup, onMount } from 'solid-js';

const Webcam = () => {
    let videoRef: HTMLVideoElement | undefined;
    const [error, setError] = createSignal<string | null>(null);

    onMount(async () => {
        let stream: MediaStream | null = null;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef) {
                videoRef.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing webcam:", err);
            setError("Webカメラへのアクセスに失敗しました。許可を確認してください。");
        }

        onCleanup(() => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        });
    });

    return (
        <div>
            {error() ? (
                <p style={{ color: 'red' }}>{error()}</p>
            ) : (
                <video ref={videoRef} autoplay playsinline style={{ width: '100%', "max-width": '600px' }} />
            )}
        </div>
    );
};

export default Webcam;