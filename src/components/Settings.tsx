import { AppState } from "../utils/states";

const Settings = () => {
    const appState = AppState.getInstance();
    const _settings = appState.getState("Settings");
    const [pixelSize, setPixelSize] = _settings.pixelSize;
    const [saturation, setSaturation] = _settings.saturation;
    const [edge, setEdge] = _settings.edge;
    const [morphology, setMorphology] = _settings.morphology;
    const [numOfColors, setNumOfColors] = _settings.numOfColors;
    const [gaussian, setGaussian] = _settings.gaussian;
    const [median, setMedian] = _settings.median;

    return (
        <div class="settings-container">
            <h2>Settings</h2>
            <div class="setting-item">
                <label for="pixelSize">Pixel Size:</label>
                <input
                    id="pixelSize"
                    type="number"
                    value={pixelSize()}
                    onInput={(e) => setPixelSize(parseInt(e.currentTarget.value))}
                    class="setting-input"
                />
            </div>
            <div class="setting-item">
                <label for="saturation">Saturation:</label>
                <input
                    id="saturation"
                    type="number"
                    step="0.1"
                    value={saturation()}
                    onInput={(e) => setSaturation(parseFloat(e.currentTarget.value))}
                    class="setting-input"
                />
            </div>
            <div class="setting-item setting-item-checkbox">
                <label for="edge">Edge:</label>
                <input
                    id="edge"
                    type="checkbox"
                    checked={edge()}
                    onChange={(e) => setEdge(e.currentTarget.checked)}
                    class="setting-checkbox"
                />
            </div>
            <div class="setting-item setting-item-checkbox">
                <label for="morphology">Morphology:</label>
                <input
                    id="morphology"
                    type="checkbox"
                    checked={morphology()}
                    onChange={(e) => setMorphology(e.currentTarget.checked)}
                    class="setting-checkbox"
                />
            </div>
            <div class="setting-item setting-item-checkbox">
                <label for="gaussian">Gaussian:</label>
                <input
                    id="gaussian"
                    type="checkbox"
                    checked={gaussian()}
                    onChange={(e) => setGaussian(e.currentTarget.checked)}
                    class="setting-checkbox"
                />
            </div>
            <div class="setting-item setting-item-checkbox">
                <label for="median">Median:</label>
                <input
                    id="median"
                    type="checkbox"
                    checked={median()}
                    onChange={(e) => setMedian(e.currentTarget.checked)}
                    class="setting-checkbox"
                />
            </div>
            <div class="setting-item">
                <label for="numOfColors">Number of Colors:</label>
                <input
                    id="numOfColors"
                    type="number"
                    value={numOfColors()}
                    onInput={(e) => setNumOfColors(parseInt(e.currentTarget.value))}
                    class="setting-input"
                />
            </div>
        </div>
    )
}

export default Settings;