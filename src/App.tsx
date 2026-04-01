import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import Login from "./pages/Login";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Invoice from "./pages/Invoice";
import Admin from "./pages/Admin";
import Index from "./pages/Index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login/:tableId" element={<Login />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/invoice/:orderId" element={<Invoice />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  </QueryClientProvider>
);

export default App;