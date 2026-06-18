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
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryIcon from '@mui/icons-material/Category';
import {
  getProducts, createProduct, updateProduct, deleteProduct,
  getCategories, createCategory, COMPANY_ID
} from '../api';

interface Category { id: number; name: string; }
interface Product {
  id: number; name: string; barcode: string; imageUrl?: string;
  expiryDate?: string; categoryId: number; category?: Category;
  unitType: string; unitsPerBox?: number;
}

const emptyForm = {
  id: 0, name: '', barcode: '', imageUrl: '', expiryDate: '',
  categoryId: 0, unitType: 'Adet', unitsPerBox: ''
};

function getExpiryColor(expiryDate?: string): 'error' | 'warning' | 'success' | 'default' {
  if (!expiryDate) return 'default';
  const days = Math.floor((new Date(expiryDate).getTime() - Date.now()) / 86400000);
  if (days <= 7) return 'error';
  if (days <= 15) return 'warning';
  if (days <= 30) return 'success';
  return 'default';
}

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<number | ''>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [newCategoryName, setNewCategoryName] = useState('');

  const loadCategories = () =>
    getCategories(COMPANY_ID).then(res => setCategories(res.data.data));

  const load = async (p = page) => {
    setLoading(true);
    try {
      const res = await getProducts(
        COMPANY_ID, p, 25, search || undefined,
        filterCategory ? filterCategory : undefined
      );
      setProducts(res.data.data);
      setTotalPages(res.data.totalPages || 1);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { loadCategories(); }, []);
  useEffect(() => { load(); }, [page, filterCategory]);

  const handleSearch = () => { setPage(1); load(1); };

  const openAdd = () => {
    setForm(emptyForm);
    setSelectedProduct(null);
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setSelectedProduct(p);
    setForm({
      id: p.id, name: p.name, barcode: p.barcode,
      imageUrl: p.imageUrl || '',
      expiryDate: p.expiryDate?.split('T')[0] || '',
      categoryId: p.categoryId, unitType: p.unitType,
      unitsPerBox: p.unitsPerBox?.toString() || ''
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) { alert('Ürün adı zorunludur.'); return; }
    if (!form.barcode || form.barcode.length !== 4 || !/^\d{4}$/.test(form.barcode)) {
      alert('Barkod 4 haneli sayı olmalıdır.'); return;
    }
    if (!form.categoryId) { alert('Kategori seçiniz.'); return; }

    const payload = {
      Name: form.name,
      Barcode: form.barcode,
      ImageUrl: form.imageUrl || null,
      ExpiryDate: form.expiryDate || null,
      CategoryId: Number(form.categoryId),
      UnitType: form.unitType,
      UnitsPerBox: form.unitType === 'Koli' && form.unitsPerBox
        ? Number(form.unitsPerBox) : null,
      CompanyId: COMPANY_ID,
    };

    try {
      if (selectedProduct) {
        await updateProduct({ ...payload, Id: form.id });
      } else {
        await createProduct(payload);
      }
      setModalOpen(false);
      setForm(emptyForm);
      load();
    } catch (e: any) {
      alert('Hata: ' + (e.response?.data?.message || e.message));
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    await deleteProduct({ Id: selectedProduct.id, CompanyId: COMPANY_ID });
    setDeleteModalOpen(false);
    load();
  };

  const handleSaveCategory = async () => {
    if (!newCategoryName) { alert('Kategori adı zorunludur.'); return; }
    await createCategory({ Name: newCategoryName, CompanyId: COMPANY_ID });
    setCategoryModalOpen(false);
    setNewCategoryName('');
    loadCategories();
  };

  return (
    <Box>
      {/* Başlık */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>📦 Ürün Yönetimi</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<CategoryIcon />}
            onClick={() => { setNewCategoryName(''); setCategoryModalOpen(true); }}>
            Kategori Ekle
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
            Yeni Ürün
          </Button>
        </Box>
      </Box>

      {/* Arama ve Filtre */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Ürün adı veya barkod ara..." size="small" value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          sx={{ flexGrow: 1 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Kategori</InputLabel>
          <Select value={filterCategory} label="Kategori"
            onChange={e => { setFilterCategory(e.target.value as number | ''); setPage(1); }}>
            <MenuItem value="">Tümü</MenuItem>
            {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </Select>
        </FormControl>
        <Button variant="outlined" onClick={handleSearch}>Ara</Button>
      </Box>

      {/* Tablo */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead sx={{ bgcolor: '#1976d2' }}>
            <TableRow>
              {['Barkod', 'Ürün Adı', 'Kategori', 'Birim', 'Son Kullanma', 'İşlem'].map(h => (
                <TableCell key={h} sx={{ color: 'white', fontWeight: 'bold' }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center"><CircularProgress /></TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Ürün bulunamadı.</TableCell>
              </TableRow>
            ) : products.map(p => (
              <TableRow key={p.id} hover>
                <TableCell><Chip label={p.barcode} size="small" /></TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.category?.name || '-'}</TableCell>
                <TableCell>
                  {p.unitType}{p.unitsPerBox ? ` (1 koli = ${p.unitsPerBox} adet)` : ''}
                </TableCell>
                <TableCell>
                  {p.expiryDate ? (
                    <Chip
                      label={new Date(p.expiryDate).toLocaleDateString('tr-TR')}
                      color={getExpiryColor(p.expiryDate)}
                      size="small"
                    />
                  ) : '-'}
                </TableCell>
                <TableCell>
                  <IconButton size="small" color="primary" onClick={() => openEdit(p)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => {
                    setSelectedProduct(p); setDeleteModalOpen(true);
                  }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
      </Box>

      {/* Ürün Ekle/Düzenle Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Ürün Adı" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} fullWidth />
            <TextField
              label="Barkod (4 haneli sayı)" value={form.barcode}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '');
                setForm({ ...form, barcode: val });
              }}
              disabled={!!selectedProduct} fullWidth
              slotProps={{ htmlInput: { maxLength: 4, inputMode: 'numeric' } }}
            />
            <TextField label="Resim URL (opsiyonel)" value={form.imageUrl}
              onChange={e => setForm({ ...form, imageUrl: e.target.value })} fullWidth />
            <TextField
              label="Son Kullanma Tarihi (opsiyonel)" type="date" value={form.expiryDate}
              onChange={e => setForm({ ...form, expiryDate: e.target.value })}
              fullWidth slotProps={{ inputLabel: { shrink: true } }}
            />
            <FormControl fullWidth>
              <InputLabel>Kategori</InputLabel>
              <Select value={form.categoryId} label="Kategori"
                onChange={e => setForm({ ...form, categoryId: Number(e.target.value) })}>
                <MenuItem value={0} disabled>Kategori seçin</MenuItem>
                {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Birim Tipi</InputLabel>
              <Select value={form.unitType} label="Birim Tipi"
                onChange={e => setForm({ ...form, unitType: e.target.value })}>
                <MenuItem value="Adet">Adet</MenuItem>
                <MenuItem value="Kilo">Kilo</MenuItem>
                <MenuItem value="Koli">Koli</MenuItem>
              </Select>
            </FormControl>
            {form.unitType === 'Koli' && (
              <TextField
                label="1 Kolide Kaç Adet?" type="number" value={form.unitsPerBox}
                onChange={e => setForm({ ...form, unitsPerBox: e.target.value })} fullWidth
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>İptal</Button>
          <Button variant="contained" onClick={handleSave}>Kaydet</Button>
        </DialogActions>
      </Dialog>

      {/* Kategori Ekle Modal */}
      <Dialog open={categoryModalOpen} onClose={() => setCategoryModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Yeni Kategori Ekle</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <TextField label="Kategori Adı" value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSaveCategory()}
              fullWidth autoFocus />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryModalOpen(false)}>İptal</Button>
          <Button variant="contained" onClick={handleSaveCategory}>Kaydet</Button>
        </DialogActions>
      </Dialog>

      {/* Silme Onay Modal */}
      <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <DialogTitle>Ürünü Sil</DialogTitle>
        <DialogContent>
          <Typography>
            <b>{selectedProduct?.name}</b> ürününü silmek istediğinize emin misiniz?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteModalOpen(false)}>İptal</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Sil</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}