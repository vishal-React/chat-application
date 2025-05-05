import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyUser } from "./ApiInstance";

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const userVerify = async (token) => {
    try {
      const res = await verifyUser({ token });
      console.log(res);
    } catch (error) {
      console.log(error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    userVerify(token);
  }, [navigate]);

  if (loading) {
    return <h2>Loading...</h2>;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
