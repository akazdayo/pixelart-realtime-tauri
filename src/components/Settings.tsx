import { AppState } from "../utils/states";

const Settings = () => {
    const appState = AppState.getInstance();
    const _settings = appState.getState("Settings");
    const [pixelSize, setPixelSize] = _settings.pixelSize;
    const [saturation, setSaturation] = _settings.saturation;
    const [edge, setEdge] = _settings.edge;
    const [morphology, setMorphology] = _settings.morphology;
    const [numOfColors, setNumOfColors] = _settings.numOfColors;

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
            <br />
            <label>
                Saturation:
                <input
                    type="number"
                    step="0.1"
                    value={saturation()}
                    onInput={(e) => setSaturation(parseFloat(e.currentTarget.value))}
                />
            </label>
            <br />
            <label>
                Edge:
                <input
                    type="checkbox"
                    checked={edge()}
                    onChange={(e) => setEdge(e.currentTarget.checked)}
                />
            </label>
            <br />
            <label>
                Morphology:
                <input
                    type="checkbox"
                    checked={morphology()}
                    onChange={(e) => setMorphology(e.currentTarget.checked)}
                />
            </label>
            <br />
            <label>
                Number of Colors:
                <input
                    type="number"
                    value={numOfColors()}
                    onInput={(e) => setNumOfColors(parseInt(e.currentTarget.value))}
                />
            </label>
        </div>
    )
}

export default Settings;