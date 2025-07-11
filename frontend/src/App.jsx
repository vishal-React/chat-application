import React from "react";
import Home from "./component/Home";
import Login from "./component/Login";
import { Toaster } from "react-hot-toast";
import Profile from "./component/Profile";
import ProtectedRoute from "./component/ProtectedRoute";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import AuthProvider from "./AuthContext";

const App = () => {
  const ProtectedLayout = () => (
    <ProtectedRoute>
      <Outlet />
    </ProtectedRoute>
  );

  const router = createBrowserRouter([
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/",
      element: <ProtectedLayout />,
      children: [
        { index: true, element: <Home /> },
        { path: "profile", element: <Profile /> },
      ],
    },
  ]);
  return (
    <>
      <AuthProvider>
        <Toaster />
        <RouterProvider router={router} />
      </AuthProvider>
    </>
  );
};

export default App;
