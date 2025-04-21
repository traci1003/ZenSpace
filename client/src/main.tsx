import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ZenSpaceProvider } from "./lib/zenSpaceProvider";

createRoot(document.getElementById("root")!).render(
  <ZenSpaceProvider>
    <App />
  </ZenSpaceProvider>
);
