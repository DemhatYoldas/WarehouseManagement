import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import WarningIcon from '@mui/icons-material/Warning';
import { getDashboard, COMPANY_ID } from '../api';

interface DashboardData {
  totalProducts: number;
  totalStock: number;
  todayIn: number;
  todayOut: number;
  expiringIn7Days: number;
  expiringIn15Days: number;
  expiringIn30Days: number;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  return (
    <Card sx={{ height: '100%', borderLeft: `5px solid ${color}` }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color }}>{value}</Typography>
            {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
          </Box>
          <Box sx={{ color, opacity: 0.8, fontSize: 40 }}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard(COMPANY_ID).then(res => {
      setData(res.data.data);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
      <CircularProgress />
    </Box>
  );
  if (!data) return null;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>📊 Depo Özeti</Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard title="Toplam Ürün Çeşidi" value={data.totalProducts}
            icon={<InventoryIcon fontSize="large" />} color="#1976d2" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard title="Toplam Stok Miktarı" value={data.totalStock}
            icon={<WarehouseIcon fontSize="large" />} color="#388e3c" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard title="Bugün Giriş" value={data.todayIn}
            icon={<TrendingUpIcon fontSize="large" />} color="#0288d1" subtitle="adet hareket" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard title="Bugün Çıkış" value={data.todayOut}
            icon={<TrendingDownIcon fontSize="large" />} color="#f57c00" subtitle="adet hareket" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard title="7 Günde Dolacak" value={data.expiringIn7Days}
            icon={<WarningIcon fontSize="large" />} color="#d32f2f" subtitle="kritik ürün" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard title="30 Günde Dolacak" value={data.expiringIn30Days}
            icon={<WarningIcon fontSize="large" />} color="#f9a825" subtitle="yaklaşan ürün" />
        </Grid>
      </Grid>
    </Box>
  );
}