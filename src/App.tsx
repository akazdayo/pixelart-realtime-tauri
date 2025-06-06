import "./App.css";
import { createSignal } from "solid-js";
import { AppState } from "./utils/states";
import Settings from "./components/Settings";
import ConvertedCam from "./components/ConvertedCam";
import Webcam from "./components/Webcam";

function App() {
  const appState = AppState.getInstance();
  const _settings = {
    "imageId": createSignal(""),
    "pixelSize": createSignal(128),
    "saturation": createSignal(1.5),
    "edge": createSignal(true),
    "morphology": createSignal(true),
    "numOfColors": createSignal(16),
    "gaussian": createSignal(true),
    "median": createSignal(false),
  }
  appState.setState("Settings", _settings);

  return (
    <main class="container">
      <h2>Original</h2>

      <Webcam />
      <div class="cam-settings-container">
        <ConvertedCam />
        <Settings />
      </div>
    </main>
  );
}

export default App;
