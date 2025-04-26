import { createSignal } from 'solid-js';
import { AppState } from '../utils/states';
import { Window } from '@tauri-apps/api/window';

const ConvertedCam = () => {
    const [isFullscreen, setIsFullscreen] = createSignal(false);
    const appState = AppState.getInstance();
    const _settings = appState.getState("Settings");
    const [imageId,] = _settings.imageId;

    const toggleFullScreen = async () => {
        try {
            const mainWindow = Window.getCurrent();
            const currentFullscreen = await mainWindow.isFullscreen();
            await mainWindow.setFullscreen(!currentFullscreen);
            setIsFullscreen(!currentFullscreen);
        } catch (err) {
            console.error('フルスクリーン切り替えエラー:', err);
        }
    };

    return (
        <div style={{
            display: 'flex',
            'flex-direction': 'column',
            'align-items': 'center',
            width: '100%',
            height: '100%'
        }}>
            {!isFullscreen() && <h2>Converted</h2>}
            <img
                src={imageId()}
                alt="Converted"
                style={isFullscreen() ? {
                    width: '100vw',
                    height: '100vh',
                    'object-fit': 'contain', // Use kebab-case for CSS properties in SolidJS style objects
                    cursor: 'pointer',
                    position: 'fixed',
                    top: '0', // Ensure values are strings if needed
                    left: '0',
                    'z-index': 1000 // Use kebab-case
                } : {
                    'max-width': '100%',
                    height: 'auto',
                    'object-fit': 'contain',
                    cursor: 'pointer'
                }}
                onClick={() => toggleFullScreen()} // Use arrow function for event handlers in SolidJS
            />
        </div>
    );
}
export default ConvertedCam;