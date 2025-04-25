import { AppState } from "../utils/states";

const Settings = () => {
    const appState = AppState.getInstance();
    const [pixelSize, setPixelSize] = appState.getState("pixelSize");

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