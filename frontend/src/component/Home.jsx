import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const { userData } = useContext(AuthContext);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      Home page
      <br />
      <br />
      <h3>{`Hii, ${userData.username} Wellcome to Our Chat Application!`}</h3>
      <br />
      <br />
      <button onClick={handleLogout}>Logut</button>
    </>
  );
};

export default Home;
