import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { Switch } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

const ThemeToggle = () => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);

  return (
    <div className="flex items-center gap-2">
      <span className={darkMode ? "text-white": "text-black"}><LightModeIcon /></span>
      <Switch checked={darkMode} onChange={toggleTheme} color="default" />
      <span className={darkMode ? "text-white": "text-black"}><DarkModeIcon /></span>
    </div>
  );
};

export default ThemeToggle;
