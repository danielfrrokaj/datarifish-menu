import { AppBar, Toolbar, Typography, Button, Select, MenuItem, IconButton, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';

const Navbar = () => {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (event: any) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <AppBar position="static" sx={{ minHeight: { xs: '48px' } }}>
      <Toolbar sx={{ 
        width: '100%', 
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: { xs: '48px' },
        px: 2,
        position: 'relative'
      }}>
        {/* Left side */}
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          flex: '0 0 auto'
        }}>
          <Typography 
            variant="h6" 
            component={Link} 
            to="/" 
            sx={{ 
              textDecoration: 'none', 
              color: 'inherit',
              display: { xs: 'none', sm: 'block' }
            }}
          >
            Detari Fish
          </Typography>
        </Box>

        {/* Center */}
        <Box sx={{ 
          display: { xs: 'none', sm: 'flex' },
          alignItems: 'center',
          gap: 2,
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1
        }}>
          <Button 
            color="inherit" 
            component={Link} 
            to="/menu"
            sx={{ minWidth: 'auto' }}
          >
            {t('menu')}
          </Button>
          <Button 
            color="inherit" 
            component={Link} 
            to="/admin"
            sx={{ minWidth: 'auto' }}
          >
            {t('admin')}
          </Button>
        </Box>

        {/* Right side */}
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          ml: 'auto',
          flex: '0 0 auto'
        }}>
          <Select
            value={i18n.language}
            onChange={handleLanguageChange}
            sx={{ 
              color: 'inherit',
              '& .MuiSelect-icon': { color: 'inherit' },
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
              minWidth: '60px',
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
            variant="standard"
          >
            <MenuItem value="en">EN</MenuItem>
            <MenuItem value="al">AL</MenuItem>
            <MenuItem value="it">IT</MenuItem>
          </Select>
          <IconButton
            component={Link}
            to="/menu"
            color="inherit"
            sx={{ 
              padding: '4px',
              width: '32px',
              height: '32px',
              display: { xs: 'flex', sm: 'none' }
            }}
          >
            <RestaurantMenuIcon fontSize="small" />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 