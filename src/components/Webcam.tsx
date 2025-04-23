import { createSignal, onCleanup, onMount } from 'solid-js';

const Webcam = () => {
    let videoRef: HTMLVideoElement | undefined;
    let canvasRef: HTMLCanvasElement | undefined;
    const [error, setError] = createSignal<string | null>(null);
    let frameInterval: number | undefined;

    const captureFrame = () => {
        if (videoRef && canvasRef) {
            const context = canvasRef.getContext('2d');
            if (context) {
                canvasRef.width = videoRef.videoWidth;
                canvasRef.height = videoRef.videoHeight;
                context.drawImage(videoRef, 0, 0);
                const base64Data = canvasRef.toDataURL('image/jpeg');
                console.log('Captured frame:', base64Data);
            }
        }
    };

    onMount(async () => {
        let stream: MediaStream | null = null;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef) {
                videoRef.srcObject = stream;
                // ビデオの読み込みが完了したらフレーム取得を開始
                videoRef.onloadedmetadata = () => {
                    frameInterval = window.setInterval(captureFrame, 100); // 1秒ごとにフレームを取得
                };
            }
        } catch (err) {
            console.error("Error accessing webcam:", err);
            setError("Webカメラへのアクセスに失敗しました。許可を確認してください。");
        }

        onCleanup(() => {
            if (stream) {
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
                    <video ref={videoRef} autoplay playsinline style={{ width: '100%', "max-width": '600px' }} />
                    <canvas ref={canvasRef} />
                </>
            )}
        </div>
    );
};

export default Webcam;