import { useState } from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme, AppBar, Toolbar, Typography, Tabs, Tab } from '@mui/material';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import DashboardPage from './pages/DashboardPage';
import ProductPage from './pages/ProductPage';
import SectionPage from './pages/SectionPage';
import StockPage from './pages/StockPage';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#ff6f00' },
    background: { default: '#f5f5f5' },
  },
});

export default function App() {
  const [tab, setTab] = useState(0);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <WarehouseIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Akıllı Depo Yönetimi
          </Typography>
        </Toolbar>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="inherit" indicatorColor="secondary">
          <Tab label="Dashboard" />
          <Tab label="Ürünler" />
          <Tab label="Bölüm & Raflar" />
          <Tab label="Stok Hareketleri" />
        </Tabs>
      </AppBar>
      <Box sx={{ p: 3 }}>
        {tab === 0 && <DashboardPage />}
        {tab === 1 && <ProductPage />}
        {tab === 2 && <SectionPage />}
        {tab === 3 && <StockPage />}
      </Box>
    </ThemeProvider>
  );
}