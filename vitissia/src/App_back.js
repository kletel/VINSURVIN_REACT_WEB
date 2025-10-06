import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate,useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Vin from "./pages/Vin";
import "./styles.css";

// Importer les styles de PrimeReact
import 'primereact/resources/themes/saga-blue/theme.css';  // Thème de PrimeReact
import 'primereact/resources/primereact.min.css';          // Styles de base de PrimeReact

import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import { Rating } from 'primereact/rating';
import { Toolbar } from 'primereact/toolbar';
import { InputTextarea } from 'primereact/inputtextarea';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { RadioButton } from 'primereact/radiobutton';
import { InputNumber } from 'primereact/inputnumber';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { PrimeReactProvider } from 'primereact/api';

function App() {
  //const isLoggedIn = !!sessionStorage.getItem('isLoggedIn');
  const isLoggedIn = !!sessionStorage.getItem('token');
 //console.log("isLoggedIn: ", isLoggedIn);
 const location = useLocation(); // Obtenir le chemin actuel
  return (
    <Router>
      {location.pathname !== "/login" && <Navbar />} {/* <Navbar /> */}
      <Routes>
        <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vin/:UUID_" element={<Vin />} />
        <Route path="/" element={<Dashboard />} />
        {/* ...other routes... */}
      </Routes>
    </Router>
  );
}

export default App;
