import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { useTheme } from "./lib/theme";

// Initialize theme on load
const theme = useTheme.getState().theme;
if (theme === 'dark') document.documentElement.classList.add('dark');

createRoot(document.getElementById("root")!).render(<App />);
