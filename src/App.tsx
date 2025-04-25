import "./App.css";
import { createSignal } from "solid-js";
import { AppState } from "./utils/states";
import Settings from "./components/Settings";
import ConvertedCam from "./components/ConvertedCam";
import Webcam from "./components/Webcam";

function App() {
  const appState = AppState.getInstance();
  appState.setState("imageId", createSignal(""));
  appState.setState("pixelSize", createSignal(256));

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
