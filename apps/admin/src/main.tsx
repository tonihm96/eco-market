import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router";

import { Layout } from "@/components/Layout";
import { authClient } from "@/lib/auth-client";
import { Categories } from "@/pages/Categories";
import { Dashboard } from "@/pages/Dashboard";
import { Login } from "@/pages/Login";
import { Orders } from "@/pages/Orders";
import { Products } from "@/pages/Products";
import { Users } from "@/pages/Users";

import "./index.css";

const queryClient = new QueryClient();

const RequireAdmin = () => {
  const { data: session, isPending } = authClient.useSession();
  if (isPending) return null;
  if (session?.user.role !== "admin") return <Navigate to="/login" replace />;
  return <Outlet />;
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<RequireAdmin />}>
            <Route element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="products" element={<Products />} />
              <Route path="orders" element={<Orders />} />
              <Route path="categories" element={<Categories />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
