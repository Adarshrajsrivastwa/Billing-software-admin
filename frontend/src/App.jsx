import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import TopBarNotification from "./pages/TopBarComponents/TopBarNotification";
import TopBarMail from "./pages/TopBarComponents/TopBarMail";

import Dashboard from "./pages/Dashboard";

import AddProject from "./pages/Add-Project/AddProject";
import AllProjects from "./pages/All-Projects/AllProjects.jsx";
import ProjectBilling from "./pages/project-Billing/ProjectBilling.jsx";

import AddClient from "./pages/Add-Client/AddClient.jsx";
import AllClients from "./pages/All-Clients/AllClients.jsx";
import AddItem from "./pages/Add-Item/AddItem.jsx";
import AllItems from "./pages/All-Items/AllItems.jsx";
import AddCategory from "./pages/Add-Category/AddCategory.jsx";
import AllCategories from "./pages/All-Categories/AllCategories.jsx";
import Quatation from "./pages/Quotation/Quotation.jsx";
import UserManagement from "./pages/UserManagement/UserManagement.jsx";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <TopBarNotification />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mail"
          element={
            <ProtectedRoute>
              <TopBarMail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/add"
          element={
            <ProtectedRoute>
              <AddProject />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/all"
          element={
            <ProtectedRoute>
              <AllProjects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/billing"
          element={
            <ProtectedRoute>
              <ProjectBilling />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients/add"
          element={
            <ProtectedRoute>
              <AddClient />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients/all"
          element={
            <ProtectedRoute>
              <AllClients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/catalog/add"
          element={
            <ProtectedRoute>
              <AddItem />
            </ProtectedRoute>
          }
        />
        <Route
          path="/catalog/all"
          element={
            <ProtectedRoute>
              <AllItems />
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories/add"
          element={
            <ProtectedRoute>
              <AddCategory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories/all"
          element={
            <ProtectedRoute>
              <AllCategories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quotation"
          element={
            <ProtectedRoute>
              <Quatation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
