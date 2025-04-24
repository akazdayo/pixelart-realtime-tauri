import "./App.css";
import { createSignal } from "solid-js";
import { AppState } from "./utils/states";
import ConvertedCam from "./components/ConvertedCam";
import Webcam from "./components/Webcam";

function App() {
  const appState = AppState.getInstance();
  appState.setState("imageId", createSignal(""));

  return (
    <main class="container">
      <h2>Original</h2>
      <Webcam />
      <ConvertedCam />
    </main>
  );
}

export default App;
