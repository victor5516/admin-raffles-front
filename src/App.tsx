import { Routes, Route, Outlet } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { DashboardPage } from "@/pages/DashboardPage";
import { RafflesListPage } from "@/pages/RafflesListPage";
import { CreateRafflePage } from "@/pages/CreateRafflePage";
import { EditRafflePage } from "@/pages/EditRafflePage";
import { PaymentMethodsPage } from "@/pages/PaymentMethodsPage";
import { CreatePaymentMethodPage } from "@/pages/CreatePaymentMethodPage";
import { EditPaymentMethodPage } from "@/pages/EditPaymentMethodPage";
import { CurrenciesPage } from "@/pages/CurrenciesPage";
import { CreateCurrencyPage } from "@/pages/CreateCurrencyPage";
import { EditCurrencyPage } from "@/pages/EditCurrencyPage";
import { OrdersPage } from "@/pages/OrdersPage";
import { OrdersTablePage } from "@/pages/OrdersTablePage";
import { CustomersPage } from "@/pages/CustomersPage";
import { CustomerDetailPage } from "@/pages/CustomerDetailPage";
import { AdminsPage } from "@/pages/AdminsPage";
import { CreateAdminPage } from "@/pages/CreateAdminPage";
import { EditAdminPage } from "@/pages/EditAdminPage";
import { LoginPage } from "@/pages/LoginPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoleProtectedRoute } from "@/components/RoleProtectedRoute";
import { AdminRole } from "@/services/auth.service";

function DashboardLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Routes accessible to both SUPER_ADMIN and VERIFIER */}
          <Route path="/" element={<DashboardPage />} />
          <Route path="/ordenes" element={<OrdersPage />} />
          <Route path="/ordenes/:currency" element={<OrdersTablePage />} />

          {/* Routes that require SUPER_ADMIN */}
          <Route element={<RoleProtectedRoute allowedRoles={[AdminRole.SUPER_ADMIN]} />}>
            <Route path="/rifas" element={<RafflesListPage />} />
            <Route path="/rifas/crear" element={<CreateRafflePage />} />
            <Route path="/rifas/editar/:uid" element={<EditRafflePage />} />
            <Route path="/payment-methods" element={<PaymentMethodsPage />} />
            <Route path="/payment-methods/crear" element={<CreatePaymentMethodPage />} />
            <Route path="/payment-methods/editar/:uid" element={<EditPaymentMethodPage />} />
            <Route path="/divisas" element={<CurrenciesPage />} />
            <Route path="/divisas/crear" element={<CreateCurrencyPage />} />
            <Route path="/divisas/editar/:uid" element={<EditCurrencyPage />} />
            <Route path="/clientes" element={<CustomersPage />} />
            <Route path="/clientes/:uid" element={<CustomerDetailPage />} />
            <Route path="/admins" element={<AdminsPage />} />
            <Route path="/admins/crear" element={<CreateAdminPage />} />
            <Route path="/admins/editar/:uid" element={<EditAdminPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
