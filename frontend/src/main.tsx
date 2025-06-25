import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import ToolBarContextProvider from "./contexts/toolbar-context.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ToolBarContextProvider>
      <App />
    </ToolBarContextProvider>
  </StrictMode>
);
