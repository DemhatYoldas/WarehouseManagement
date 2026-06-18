# 🏭 Akıllı Depo Yönetimi

ASP.NET Core 9.0 + React 18 + TypeScript + Material-UI ile geliştirilmiş tam stack depo yönetim sistemi.

## 🚀 Teknolojiler

| Katman | Teknoloji |
|---|---|
| Backend | .NET 9.0 ASP.NET Core Web API |
| Frontend | React 18 + TypeScript + Vite |
| UI | Material-UI (MUI) v7 |
| Veritabanı | MS SQL Server |
| ORM | Entity Framework Core 9 |

## 📁 Proje Yapısı
WarehouseManagement/     → Backend (ASP.NET Core)

├── Controllers/         → HTTP endpoint'leri

├── Managers/            → İş mantığı

├── Repositories/        → Veritabanı işlemleri

├── Entities/            → DB modelleri

└── Data/                → DbContext
warehouse-frontend/      → Frontend (React)

└── src/

├── pages/           → Sayfalar

└── api.ts           → API bağlantısı


## ⚙️ Kurulum

### Backend
```bash
cd WarehouseManagement
dotnet restore
dotnet ef database update
dotnet run
```

### Frontend
```bash
cd warehouse-frontend
npm install
npm run dev
```

## 🌐 Adresler

- Frontend: http://localhost:5173
- Backend API: http://localhost:5294
- Swagger: http://localhost:5294/swagger

## ✨ Özellikler

- 📦 Ürün yönetimi (barkod, kategori, birim tipi)
- 🏭 Bölüm & raf yönetimi
- 📥 Stok giriş/çıkış takibi
- 🔍 4 haneli barkod ile anlık sorgulama
- ⚠️ Son kullanma tarihi renk uyarısı
- 📊 Dashboard özet kartları
- 🔒 Multi-tenant (CompanyId) güvenlik
- 🗑️ Soft delete
- 📄 Server-side pagination
