import { AppRoutes } from "./routes/index.tsx"; 
import { BrowserRouter } from 'react-router-dom'; 
import "./style/global.css";

export function App() {
  return (
    <>
      <BrowserRouter>
      
        <AppRoutes />
      </BrowserRouter>
      
    </>
  );
}