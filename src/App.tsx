import { AppRoutes } from "./routes/index.tsx"; 
import { BrowserRouter } from 'react-router-dom'; 
import "./style/global.css";
import "./style/theme.css";

export function App() {
  return (
    <>
      <BrowserRouter>
      
        <AppRoutes />
      </BrowserRouter>
      
    </>
  );
}