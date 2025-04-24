import { createSignal } from "solid-js";
import logo from "./assets/logo.svg";
import "./App.css";
import Webcam from "./components/Webcam";

function App() {
  return (
    <main class="container">
      <h2>Webcam Feed</h2>
      <Webcam />
    </main>
  );
}

export default App;
