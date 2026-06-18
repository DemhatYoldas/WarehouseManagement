import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Pagination from '@mui/material/Pagination';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import QrCodeIcon from '@mui/icons-material/QrCode';
import {
  getMovements, stockIn, stockOut,
  getProducts, getShelves, getProductByBarcode, getAllStock, COMPANY_ID
} from '../api';

interface Product { id: number; name: string; barcode: string; unitType: string; }
interface Shelf { id: number; name: string; section?: { name: string }; sectionId: number; }
interface Movement {
  id: number;
  movementType: string;
  quantity: number;
  movementDate: string;
  notes?: string;
  product?: Product;
  shelf?: Shelf;
}

const emptyForm = { productId: 0, shelfId: 0, quantity: '', notes: '' };

export default function StockPage() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState('');
  const [tabValue, setTabValue] = useState(0);

  const [inModalOpen, setInModalOpen] = useState(false);
  const [outModalOpen, setOutModalOpen] = useState(false);
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [barcode, setBarcode] = useState('');
  const [barcodeResult, setBarcodeResult] = useState<Product | null>(null);
  const [barcodeStock, setBarcodeStock] = useState<number>(0);
  const [barcodeError, setBarcodeError] = useState('');

  const load = async (p = page) => {
    setLoading(true);
    try {
      const res = await getMovements(COMPANY_ID, p, 25, filterType || undefined);
      setMovements(res.data.data);
      setTotalPages(res.data.totalPages || 1);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => {
    getProducts(COMPANY_ID, 1, 1000).then(res => setProducts(res.data.data));
    getShelves(COMPANY_ID).then(res => setShelves(res.data.data));
  }, []);

  useEffect(() => { load(); }, [page, filterType]);

  const handleStockIn = async () => {
    if (!form.productId) { alert('Ürün seçiniz.'); return; }
    if (!form.shelfId) { alert('Raf seçiniz.'); return; }
    if (!form.quantity || Number(form.quantity) <= 0) { alert('Geçerli miktar giriniz.'); return; }
    try {
      await stockIn({
        ProductId: form.productId,
        ShelfId: form.shelfId,
        Quantity: Number(form.quantity),
        Notes: form.notes || null,
        CompanyId: COMPANY_ID,
      });
      setInModalOpen(false);
      setForm(emptyForm);
      load();
    } catch (e: any) {
      alert('Hata: ' + (e.response?.data?.message || e.message));
    }
  };

  const handleStockOut = async () => {
    if (!form.productId) { alert('Ürün seçiniz.'); return; }
    if (!form.shelfId) { alert('Raf seçiniz.'); return; }
    if (!form.quantity || Number(form.quantity) <= 0) { alert('Geçerli miktar giriniz.'); return; }
    try {
      await stockOut({
        ProductId: form.productId,
        ShelfId: form.shelfId,
        Quantity: Number(form.quantity),
        Notes: form.notes || null,
        CompanyId: COMPANY_ID,
      });
      setOutModalOpen(false);
      setForm(emptyForm);
      load();
    } catch (e: any) {
      alert('Hata: ' + (e.response?.data?.message || e.message));
    }
  };

  const handleBarcodeSearch = async () => {
    setBarcodeError('');
    setBarcodeResult(null);
    setBarcodeStock(0);
    if (!/^\d{4}$/.test(barcode)) {
      setBarcodeError('Barkod 4 haneli sayı olmalıdır.');
      return;
    }
    try {
      const res = await getProductByBarcode(barcode, COMPANY_ID);
      const product = res.data.data;
      setBarcodeResult(product);

      const stockRes = await getAllStock(COMPANY_ID);
      const total = stockRes.data.data
        .filter((s: any) => s.productId === product.id)
        .reduce((sum: number, s: any) => sum + s.quantity, 0);
      setBarcodeStock(total);
    } catch {
      setBarcodeError('Ürün bulunamadı.');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>📋 Stok Hareketleri</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" color="info" startIcon={<QrCodeIcon />}
            onClick={() => {
              setBarcode(''); setBarcodeResult(null);
              setBarcodeError(''); setBarcodeStock(0);
              setBarcodeModalOpen(true);
            }}>
            Barkod Sorgula
          </Button>
          <Button variant="contained" color="success" startIcon={<TrendingUpIcon />}
            onClick={() => { setForm(emptyForm); setInModalOpen(true); }}>
            Stok Giriş
          </Button>
          <Button variant="contained" color="warning" startIcon={<TrendingDownIcon />}
            onClick={() => { setForm(emptyForm); setOutModalOpen(true); }}>
            Stok Çıkış
          </Button>
        </Box>
      </Box>

      {/* Filtre Tabları */}
      <Box sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={(_, v) => {
          setTabValue(v);
          setFilterType(v === 0 ? '' : v === 1 ? 'IN' : 'OUT');
          setPage(1);
        }}>
          <Tab label="Tümü" />
          <Tab label="📥 Girişler" />
          <Tab label="📤 Çıkışlar" />
        </Tabs>
      </Box>

      {/* Tablo */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead sx={{ bgcolor: '#1976d2' }}>
            <TableRow>
              {['Tarih', 'Ürün', 'Bölüm / Raf', 'Tip', 'Miktar', 'Not'].map(h => (
                <TableCell key={h} sx={{ color: 'white', fontWeight: 'bold' }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center"><CircularProgress /></TableCell>
              </TableRow>
            ) : movements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Hareket bulunamadı.</TableCell>
              </TableRow>
            ) : movements.map(m => (
              <TableRow key={m.id} hover>
                <TableCell>{new Date(m.movementDate).toLocaleString('tr-TR')}</TableCell>
                <TableCell>{m.product?.name || '-'}</TableCell>
                <TableCell>{m.shelf?.section?.name} / {m.shelf?.name}</TableCell>
                <TableCell>
                  <Chip
                    label={m.movementType === 'IN' ? 'Giriş' : 'Çıkış'}
                    color={m.movementType === 'IN' ? 'success' : 'warning'}
                    size="small"
                    icon={m.movementType === 'IN' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                  />
                </TableCell>
                <TableCell>{m.quantity}</TableCell>
                <TableCell>{m.notes || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
      </Box>

      {/* Stok Giriş Modal */}
      <Dialog open={inModalOpen} onClose={() => setInModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: '#e8f5e9' }}>📥 Stok Giriş</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Ürün</InputLabel>
              <Select value={form.productId} label="Ürün"
                onChange={e => setForm({ ...form, productId: Number(e.target.value) })}>
                <MenuItem value={0} disabled>Ürün seçin</MenuItem>
                {products.map(p => (
                  <MenuItem key={p.id} value={p.id}>{p.name} ({p.barcode})</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Raf</InputLabel>
              <Select value={form.shelfId} label="Raf"
                onChange={e => setForm({ ...form, shelfId: Number(e.target.value) })}>
                <MenuItem value={0} disabled>Raf seçin</MenuItem>
                {shelves.map(s => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.section?.name} — {s.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Miktar" type="number" value={form.quantity}
              onChange={e => setForm({ ...form, quantity: e.target.value })} fullWidth />
            <TextField label="Not (opsiyonel)" value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInModalOpen(false)}>İptal</Button>
          <Button variant="contained" color="success" onClick={handleStockIn}>Giriş Yap</Button>
        </DialogActions>
      </Dialog>

      {/* Stok Çıkış Modal */}
      <Dialog open={outModalOpen} onClose={() => setOutModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: '#fff3e0' }}>📤 Stok Çıkış</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Ürün</InputLabel>
              <Select value={form.productId} label="Ürün"
                onChange={e => setForm({ ...form, productId: Number(e.target.value) })}>
                <MenuItem value={0} disabled>Ürün seçin</MenuItem>
                {products.map(p => (
                  <MenuItem key={p.id} value={p.id}>{p.name} ({p.barcode})</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Raf</InputLabel>
              <Select value={form.shelfId} label="Raf"
                onChange={e => setForm({ ...form, shelfId: Number(e.target.value) })}>
                <MenuItem value={0} disabled>Raf seçin</MenuItem>
                {shelves.map(s => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.section?.name} — {s.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Miktar" type="number" value={form.quantity}
              onChange={e => setForm({ ...form, quantity: e.target.value })} fullWidth />
            <TextField label="Not (opsiyonel)" value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOutModalOpen(false)}>İptal</Button>
          <Button variant="contained" color="warning" onClick={handleStockOut}>Çıkış Yap</Button>
        </DialogActions>
      </Dialog>

      {/* Barkod Sorgula Modal */}
      <Dialog open={barcodeModalOpen} onClose={() => setBarcodeModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>🔍 Barkod ile Ürün Sorgula</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                label="4 Haneli Barkod" value={barcode}
                onChange={e => setBarcode(e.target.value.replace(/\D/g, ''))}
                onKeyDown={e => e.key === 'Enter' && handleBarcodeSearch()}
                fullWidth slotProps={{ htmlInput: { maxLength: 4, inputMode: 'numeric' } }}
              />
              <Button variant="contained" onClick={handleBarcodeSearch}>Ara</Button>
            </Box>
            {barcodeError && (
              <Typography color="error">{barcodeError}</Typography>
            )}
            {barcodeResult && (
              <Paper sx={{ p: 2, bgcolor: '#e8f5e9' }}>
                <Typography sx={{ fontWeight: 'bold', fontSize: 18 }}>
                  {barcodeResult.name}
                </Typography>
                <Typography variant="body2">Barkod: {barcodeResult.barcode}</Typography>
                <Typography variant="body2">Birim: {barcodeResult.unitType}</Typography>
                <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold', color: '#388e3c', fontSize: 16 }}>
                  Toplam Stok: {barcodeStock} {barcodeResult.unitType}
                </Typography>
              </Paper>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBarcodeModalOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}