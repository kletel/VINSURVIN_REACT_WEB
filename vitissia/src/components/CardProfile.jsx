import React, { useContext } from 'react'; // Ajout de useContext
import { ThemeContext } from '../context/ThemeContext'; // Ajout de ThemeContext
import { Box, Typography, Avatar, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import * as AiIcons from "react-icons/ai";
import "../styles/Navbar.css";
import useAuth from "../hooks/useAuth";
import ThemeToggle from './ThemeToggle';



/*
const StyledCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '20px',
  background: 'rgba(255, 255, 255, 0.3)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  textAlign: 'center',
  minWidth: '250px',
  maxWidth: '300px',
}));
*/



const Card = ({ nomComplet }) => {
  const { logout } = useAuth();
  const isLoggedIn = !!sessionStorage.getItem('token');
  const { darkMode } = useContext(ThemeContext);

  const StyledCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: '20px',
    background: darkMode ? 'rgba(0, 0, 0, 0.79)' : 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    minWidth: '250px',
    maxWidth: '300px',
  }));

  const StyledAvatar = styled(Avatar)({
    width: 80,
    height: 80,
    margin: '0 auto 16px auto',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  });

  return (
    <StyledCard elevation={0}>
      <StyledAvatar src="/images/default-avatar.jpg" alt="Profile" />
      <Typography variant="h6" fontWeight="bold" gutterBottom style={{ color: darkMode ? 'white' : 'black' }}>
        {nomComplet}
      </Typography>
      <Typography variant="body2"  style={{ color: darkMode ? 'white' : 'black' }}> {/*color="text.secondary"*/}
        Amateur de vin
      </Typography>
      {/* TOGGLE THÈME ICI */}
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
        <ThemeToggle />
      </Box>

      {isLoggedIn ? (
        <button onClick={logout} style={{
          background: darkMode ? 'white' : 'black',
          border: 'none',
          cursor: 'pointer',
          color: darkMode ? 'black' : 'white',
          padding: '10px 20px',
          borderRadius: '5px',
          marginTop: '20px',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          display: 'flex',
          fontSize: '16px',
          transition: 'all 0.3s ease',
        }}
          onMouseEnter={(e) => e.target.style.background = 'red'}
          onMouseLeave={(e) =>e.target.style.background = darkMode ? 'white' : 'black'}>
          <AiIcons.AiOutlineLogout />  Déconnexion
        </button>
      ) : (
        <button onClick={() => window.location.href = '/login'} style={{
          background: darkMode ? 'white' : 'black',
          border: 'none',
          cursor: 'pointer',
          color: darkMode ? 'black' : 'white',
          padding: '10px 20px',
          borderRadius: '5px',
          marginTop: '20px',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          display: 'flex',
          fontSize: '16px',
          transition: 'all 0.3s ease',
        }}
          onMouseEnter={(e) => e.target.style.background = darkMode ? '#e5e7eb' : '#111827'}
          onMouseLeave={(e) => e.target.style.background = darkMode ? 'white' : 'black'}>
          <AiIcons.AiOutlineLogout />  Se connecter
        </button>
      )}

      <p style={{ color : darkMode ? 'white': 'black', marginTop : '8px'}} >Mode actuel : {darkMode ? 'Sombre' : 'Clair'}</p>
    </StyledCard>

  );
};

export default Card;
