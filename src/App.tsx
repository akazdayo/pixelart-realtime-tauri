import "./App.css";
import { createSignal } from "solid-js";
import { AppState } from "./utils/states";
import ConvertedCam from "./components/ConvertedCam";
import Webcam from "./components/Webcam";

function App() {
  console.log("App component rendered");
  const appState = AppState.getInstance();
  console.log(appState);
  appState.setState("imageId", createSignal(""));
  appState.setState("oldImageId", createSignal(""));

  return (
    <main class="container">
      <h2>Original</h2>
      <Webcam />
      <ConvertedCam />
    </main>
  );
}

export default App;
