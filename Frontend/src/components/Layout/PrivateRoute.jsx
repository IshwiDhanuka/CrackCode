
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  console.log("Token in PrivateRoute:", token); 

  if (!token || token === "undefined" || token.trim() === "") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
