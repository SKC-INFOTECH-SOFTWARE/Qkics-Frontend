import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import "./tailwind.css";
import { AlertProvider } from "./context/AlertContext";
import { ConfirmProvider } from "./context/ConfirmContext";


// 🆕 ADD THIS:
import { Provider } from "react-redux";
import { store } from "./redux/store";

createRoot(document.getElementById("root")).render(
  
    <Provider store={store}>   {/* <-- NEW */}
      <BrowserRouter>
        <AlertProvider>
          <ConfirmProvider>
         
              <App />
           
          </ConfirmProvider>
        </AlertProvider>
      </BrowserRouter>
    </Provider>

);
