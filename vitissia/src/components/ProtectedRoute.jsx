import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginRequiredModal from './LoginRequiredModal';

export default function ProtectedRoute({ children }) {
  const isLoggedIn = !!sessionStorage.getItem('token');
  const navigate = useNavigate();
  const [show, setShow] = useState(!isLoggedIn);

  const handleLogin = () => {
    setShow(false);
    navigate('/login');
  };

  const handleCancel = () => {
    setShow(false);
  };

  return (
    <>
      {!isLoggedIn && (
        <LoginRequiredModal visible={show} onLogin={handleLogin} onCancel={handleCancel} />
      )}
      {isLoggedIn ? children : null}
    </>
  );
}
