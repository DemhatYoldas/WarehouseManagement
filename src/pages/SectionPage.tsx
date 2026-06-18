import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import {
  getSections, createSection, updateSection, deleteSection,
  getShelves, createShelf, updateShelf, deleteShelf, COMPANY_ID
} from '../api';

interface Shelf { id: number; name: string; sectionId: number; }
interface Section { id: number; name: string; capacity: number; shelves?: Shelf[]; }

const emptySectionForm = { id: 0, name: '', capacity: '' };
const emptyShelfForm = { id: 0, name: '', sectionId: 0 };

export default function SectionPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [shelfModalOpen, setShelfModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'section' | 'shelf'; id: number; name: string } | null>(null);

  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedShelf, setSelectedShelf] = useState<Shelf | null>(null);
  const [sectionForm, setSectionForm] = useState(emptySectionForm);
  const [shelfForm, setShelfForm] = useState(emptyShelfForm);

  const load = async () => {
    setLoading(true);
    try {
      const [secRes, shelfRes] = await Promise.all([
        getSections(COMPANY_ID),
        getShelves(COMPANY_ID)
      ]);
      setSections(secRes.data.data);
      setShelves(shelfRes.data.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const getSectionShelves = (sectionId: number) =>
    shelves.filter(s => s.sectionId === sectionId);

  // Section işlemleri
  const openAddSection = () => {
    setSelectedSection(null);
    setSectionForm(emptySectionForm);
    setSectionModalOpen(true);
  };

  const openEditSection = (s: Section) => {
    setSelectedSection(s);
    setSectionForm({ id: s.id, name: s.name, capacity: s.capacity.toString() });
    setSectionModalOpen(true);
  };

  const handleSaveSection = async () => {
    const payload = {
      Name: sectionForm.name,
      Capacity: Number(sectionForm.capacity),
      CompanyId: COMPANY_ID,
    };
    try {
      if (selectedSection) {
        await updateSection({ ...payload, Id: sectionForm.id });
      } else {
        await createSection(payload);
      }
      setSectionModalOpen(false);
      load();
    } catch (e) { console.error(e); }
  };

  // Shelf işlemleri
  const openAddShelf = (sectionId: number) => {
    setSelectedShelf(null);
    setShelfForm({ id: 0, name: '', sectionId });
    setShelfModalOpen(true);
  };

  const openEditShelf = (shelf: Shelf) => {
    setSelectedShelf(shelf);
    setShelfForm({ id: shelf.id, name: shelf.name, sectionId: shelf.sectionId });
    setShelfModalOpen(true);
  };

  const handleSaveShelf = async () => {
    const payload = {
      Name: shelfForm.name,
      SectionId: shelfForm.sectionId,
      CompanyId: COMPANY_ID,
    };
    try {
      if (selectedShelf) {
        await updateShelf({ ...payload, Id: shelfForm.id });
      } else {
        await createShelf(payload);
      }
      setShelfModalOpen(false);
      load();
    } catch (e) { console.error(e); }
  };

  // Silme
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'section') {
        await deleteSection({ Id: deleteTarget.id, CompanyId: COMPANY_ID });
      } else {
        await deleteShelf({ Id: deleteTarget.id, CompanyId: COMPANY_ID });
      }
      setDeleteModalOpen(false);
      load();
    } catch (e) { console.error(e); }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>🏭 Bölüm & Raf Yönetimi</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAddSection}>
          Yeni Bölüm
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead sx={{ bgcolor: '#1976d2' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Bölüm Adı</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Kapasite</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Raf Sayısı</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>İşlem</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">Bölüm bulunamadı.</TableCell>
              </TableRow>
            ) : sections.map(sec => (
              <>
                <TableRow key={sec.id} hover sx={{ bgcolor: expandedSection === sec.id ? '#e3f2fd' : 'inherit' }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton size="small" onClick={() =>
                        setExpandedSection(expandedSection === sec.id ? null : sec.id)}>
                        {expandedSection === sec.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                      <Typography sx={{ fontWeight: 'bold' }}>{sec.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{sec.capacity} alan</TableCell>
                  <TableCell>
                    <Chip label={`${getSectionShelves(sec.id).length} raf`} size="small" color="primary" />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" color="success" onClick={() => openAddShelf(sec.id)}>
                      <AddIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="primary" onClick={() => openEditSection(sec)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => {
                      setDeleteTarget({ type: 'section', id: sec.id, name: sec.name });
                      setDeleteModalOpen(true);
                    }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>

                {/* Raflar */}
                <TableRow key={`shelves-${sec.id}`}>
                  <TableCell colSpan={4} sx={{ p: 0 }}>
                    <Collapse in={expandedSection === sec.id}>
                      <Box sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                          {sec.name} — Raflar
                        </Typography>
                        {getSectionShelves(sec.id).length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            Henüz raf eklenmedi.
                          </Typography>
                        ) : (
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {getSectionShelves(sec.id).map(shelf => (
                              <Chip
                                key={shelf.id}
                                label={shelf.name}
                                onDelete={() => {
                                  setDeleteTarget({ type: 'shelf', id: shelf.id, name: shelf.name });
                                  setDeleteModalOpen(true);
                                }}
                                onClick={() => openEditShelf(shelf)}
                                color="default"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        )}
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Bölüm Modal */}
      <Dialog open={sectionModalOpen} onClose={() => setSectionModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{selectedSection ? 'Bölüm Düzenle' : 'Yeni Bölüm Ekle'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Bölüm Adı (örn: R1)" value={sectionForm.name}
              onChange={e => setSectionForm({ ...sectionForm, name: e.target.value })} fullWidth />
            <TextField label="Kapasite (kaç raf alanı)" type="number" value={sectionForm.capacity}
              onChange={e => setSectionForm({ ...sectionForm, capacity: e.target.value })} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSectionModalOpen(false)}>İptal</Button>
          <Button variant="contained" onClick={handleSaveSection}>Kaydet</Button>
        </DialogActions>
      </Dialog>

      {/* Raf Modal */}
      <Dialog open={shelfModalOpen} onClose={() => setShelfModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{selectedShelf ? 'Raf Düzenle' : 'Yeni Raf Ekle'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Raf Adı (örn: Raf 1)" value={shelfForm.name}
              onChange={e => setShelfForm({ ...shelfForm, name: e.target.value })} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShelfModalOpen(false)}>İptal</Button>
          <Button variant="contained" onClick={handleSaveShelf}>Kaydet</Button>
        </DialogActions>
      </Dialog>

      {/* Silme Onay Modal */}
      <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <DialogTitle>Sil</DialogTitle>
        <DialogContent>
          <Typography>
            <b>{deleteTarget?.name}</b> silinecek. Emin misiniz?
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