# 💰 Pencatat Keuangan

Aplikasi web untuk mencatat pengeluaran harian dengan fitur kategori, ringkasan bulanan, filter waktu, dan upload foto struk belanja menggunakan **Supabase Storage**.

## ✨ Fitur

- **Catat Pengeluaran** — judul, nominal, kategori, tanggal, dan catatan
- **8 Kategori** — Makanan, Transportasi, Hobi, Belanja, Kesehatan, Pendidikan, Tagihan, Lainnya
- **Upload Foto Struk** — unggah foto struk belanja ke Supabase Storage (maks. 5MB)
- **Ringkasan Bulanan** — total pengeluaran, grafik harian, dan breakdown per kategori
- **Filter** — filter berdasarkan kategori dan rentang tanggal
- **Edit & Hapus** — kelola pengeluaran yang sudah dicatat

## 🛠️ Tech Stack

- **React 18** + Vite
- **Tailwind CSS**
- **Supabase** (PostgreSQL + Storage)
- **React Router v6**
- **Lucide React** (icons)

---

## 🚀 Setup

### 1. Clone & Install

```bash
npm install
```

### 2. Setup Supabase

1. Buat project baru di [supabase.com](https://supabase.com)
2. Buka **SQL Editor** dan jalankan isi file `supabase/schema.sql`
3. Buka **Storage** → klik **New Bucket**:
   - Nama: `receipts`
   - Centang **Public bucket**
4. Di Storage bucket `receipts`, tambahkan policies:
   - **SELECT** (read): `true`
   - **INSERT** (upload): `true`
   - **DELETE**: `true`

### 3. Konfigurasi Environment

Buat file `.env` di root project:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Temukan nilai ini di Supabase Dashboard → **Settings** → **API**.

### 4. Jalankan

```bash
npm run dev
```

Buka [http://localhost:5173](http://localhost:5173)

---

## 📁 Struktur Proyek

```
src/
├── components/
│   ├── ExpenseCard.jsx    # Kartu pengeluaran (dengan tombol lihat struk)
│   ├── ExpenseForm.jsx    # Form tambah/edit + upload foto struk
│   ├── EditModal.jsx      # Modal edit pengeluaran
│   └── FilterBar.jsx      # Filter kategori & rentang tanggal
├── hooks/
│   └── useExpenses.js     # Custom hook: CRUD + upload ke Supabase Storage
├── lib/
│   ├── supabase.js        # Supabase client
│   └── constants.js       # Kategori, format currency/date
├── pages/
│   ├── Dashboard.jsx      # Halaman utama + ringkasan bulan ini
│   ├── AddExpense.jsx     # Halaman tambah pengeluaran
│   ├── ExpenseList.jsx    # Daftar semua pengeluaran + filter
│   └── Summary.jsx        # Ringkasan bulanan + grafik
└── App.jsx                # Router + layout
supabase/
└── schema.sql             # DDL untuk tabel expenses + RLS
```

## 📸 Fitur Upload Struk

- Klik area upload di form pengeluaran
- Pilih foto struk (JPG, PNG, WEBP)
- Preview langsung sebelum disimpan
- Foto disimpan di Supabase Storage bucket `receipts`
- Di daftar pengeluaran, klik ikon 🧾 untuk melihat foto struk

## 🏗️ Build Production

```bash
npm run build
```
