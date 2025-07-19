import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "../components/auth/LoginPage";
import ManagerPage from "../pages/managerDashboard/ManagerPage";
import EmployeePage from "../pages/EmployeePage";
import CustomerPage from "../pages/CustomerMain/CustomerPage";
import RoleProtectedRoute from "../components/RoleProtectedRoute";
import Signup from "../pages/CustomerSignup/CustomerSignup";
import AddFood from "../components/FoodManagment/AddFood";
import EditDeleteFood from "../components/FoodManagment/EditDeleteFood";
import AddEmployee from "../components/EmployeeManagement/AddEmployee";
import EditDeleteEmployee from "../components/EmployeeManagement/EditDeleteEmployee";
import Logout from "../components/Logout"; // Import the Logout component
import PendingOrder from "../components/OrderManagment/PendinOrder";
import CompletedOrder from "../components/OrderManagment/CompletedOrder";
import Main from "../components/Main/Main";
import AddAddressPage from "../components/AddressModal/AddressModal"; // Adjust path as needed
import AddDiscount from "../components/DiscountManagment/DiscountAdd"
import ListDiscount from "../components/DiscountManagment/ListDiscount"
import OrderList from "../components/OrderListUser/OrderListUser"
import CompletedOrders from "../components/OrderListUser/CompletedOrderList" // Assuming you saved the component in 'components/CompletedOrders'
import TopSoldDish from "../components/TopSoldDishes/TopSoldDishes"
import DateRangeOrder from "../components/OrdersInDateRangeView/OrdersInDateRangeView"
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<RoleProtectedRoute requiredRole="manager" />}>
        <Route path="/manager" element={<ManagerPage />}>
          <Route path="/manager/add-food" element={<AddFood />} />
          <Route path="/manager/edit-food" element={<EditDeleteFood />} />
          <Route path="/manager/add-employee" element={<AddEmployee />} />
          <Route path="/manager/add-discount" element={<AddDiscount />} />
          <Route path="/manager/discountes" element={<ListDiscount />} />
          <Route path="/manager/top-sold-dish" element={<TopSoldDish />} />
          <Route path="/manager/date-range-order" element={<DateRangeOrder />} />
          <Route
            path="/manager/edit-employee"
            element={<EditDeleteEmployee />}
          />
        </Route>
      </Route>
      <Route path="/Logout" element={<Logout />} />

      <Route element={<RoleProtectedRoute requiredRole="employee" />}>
        <Route path="/employee" element={<EmployeePage />}>
          <Route path="/employee/pending-order" element={<PendingOrder />} />
          <Route
            path="/employee/completed-order"
            element={<CompletedOrder />}
          />
        </Route>
      </Route>

      <Route element={<RoleProtectedRoute requiredRole="customer" />}>
      <Route path="/customer/orders" element={<OrderList />} />
      <Route path="/customer/orders/completed" element={<CompletedOrders />} />
        <Route path="/customer" element={<CustomerPage />}>
        <Route path="/customer/add-address" element={<AddAddressPage />} />
        </Route>
      </Route>
      <Route path="/" element={<Main />} />
    </Routes>
  );
};

export default AppRoutes;
