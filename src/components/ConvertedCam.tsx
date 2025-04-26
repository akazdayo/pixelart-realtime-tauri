import { AppState } from '../utils/states';

const ConvertedCam = () => {
    const appState = AppState.getInstance();
    const _settings = appState.getState("Settings");
    const [imageId,] = _settings.imageId;

    return (
        <div>
            <h2>Converted</h2>
            <img src={imageId()} alt="Converted" />
        </div>
    );

}
export default ConvertedCam;