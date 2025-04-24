import { AppState } from '../utils/states';

const ConvertedCam = () => {
    const appState = AppState.getInstance();
    const [imageId] = appState.getState("imageId");

    return (
        <div>
            <h2>Converted</h2>
            <img src={imageId()} alt="Converted" />
        </div>
    );

}
export default ConvertedCam;