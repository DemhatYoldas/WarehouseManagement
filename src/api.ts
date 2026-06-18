

import axios from 'axios';

const BASE_URL = 'http://localhost:5294/api';
export const COMPANY_ID = 'COMPANY-001';

const api = axios.create({ baseURL: BASE_URL });

// CATEGORY
export const getCategories = (companyId: string) =>
  api.get(`/category/by-company/${companyId}`);
export const createCategory = (data: object) =>
  api.post('/category/create', data);
export const updateCategory = (data: object) =>
  api.post('/category/update', data);
export const deleteCategory = (data: object) =>
  api.post('/category/delete', data);

// PRODUCT
export const getProducts = (companyId: string, page: number, pageSize: number, search?: string, categoryId?: number) =>
  api.get('/product/list', { params: { companyId, page, pageSize, search, categoryId } });
export const getProductByBarcode = (barcode: string, companyId: string) =>
  api.get('/product/by-barcode', { params: { barcode, companyId } });
export const createProduct = (data: object) =>
  api.post('/product/create', data);
export const updateProduct = (data: object) =>
  api.post('/product/update', data);
export const deleteProduct = (data: object) =>
  api.post('/product/delete', data);

// SECTION
export const getSections = (companyId: string) =>
  api.get(`/section/by-company/${companyId}`);
export const createSection = (data: object) =>
  api.post('/section/create', data);
export const updateSection = (data: object) =>
  api.post('/section/update', data);
export const deleteSection = (data: object) =>
  api.post('/section/delete', data);

// SHELF
export const getShelves = (companyId: string) =>
  api.get(`/shelf/by-company/${companyId}`);
export const getShelfBySection = (sectionId: number, companyId: string) =>
  api.get(`/shelf/by-section/${sectionId}`, { params: { companyId } });
export const createShelf = (data: object) =>
  api.post('/shelf/create', data);
export const updateShelf = (data: object) =>
  api.post('/shelf/update', data);
export const deleteShelf = (data: object) =>
  api.post('/shelf/delete', data);

// STOCK
export const getDashboard = (companyId: string) =>
  api.get(`/stock/dashboard/${companyId}`);
export const getAllStock = (companyId: string) =>
  api.get(`/stock/all/${companyId}`);
export const getMovements = (companyId: string, page: number, pageSize: number, movementType?: string) =>
  api.get('/stock/movements', { params: { companyId, page, pageSize, movementType } });
export const stockIn = (data: object) =>
  api.post('/stock/in', data);
export const stockOut = (data: object) =>
  api.post('/stock/out', data);