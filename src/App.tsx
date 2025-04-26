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
    "pixelSize": createSignal(256),
    "saturation": createSignal(1),
    "edge": createSignal(false),
    "morphology": createSignal(false),
    "numOfColors": createSignal(16),
  }
  appState.setState("Settings", _settings);

  return (
    <main class="container">
      <h2>Original</h2>

      <Webcam />
      <ConvertedCam />
      <Settings />
    </main>
  );
}

export default App;
