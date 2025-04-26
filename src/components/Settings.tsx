import { AppState } from "../utils/states";

const Settings = () => {
    const appState = AppState.getInstance();
    const _settings = appState.getState("Settings");
    const [pixelSize, setPixelSize] = _settings.pixelSize;

    return (
        <div>
            <h2>Settings</h2>
            <label>
                Pixel Size:
                <input
                    type="number"
                    value={pixelSize()}
                    onInput={(e) => setPixelSize(parseInt(e.currentTarget.value))}
                />
            </label>
        </div>
    )
}

export default Settings;