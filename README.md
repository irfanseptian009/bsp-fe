# BSP Frontend (Next.js)

Frontend aplikasi **BSP  Insurance Management System** berbasis **Next.js App Router**.

Aplikasi ini menyediakan portal terpisah untuk **Admin** dan **Customer** dengan autentikasi JWT, manajemen request asuransi, data polis, dashboard analytics, serta integrasi API ke backend BSP.

---

## 1) Ringkasan Fitur

### Autentikasi & Akses

- Login / Register
- Persist sesi login di `localStorage`
- Auto-attach token JWT pada setiap request API
- Route guard berbasis role:
	- `ADMIN`
	- `CUSTOMER`

### Modul Customer

- Dashboard customer (chart status, tren request, top okupasi)
- Ajukan request asuransi
- Lihat daftar request sendiri
- Cek invoice berdasarkan nomor invoice
- Kelola profil + upload foto profil

### Modul Admin

- Dashboard admin (insight bisnis & operasional)
- Kelola dan review request asuransi
- Approve / reject request
- Kelola tipe okupasi
- Kelola data polis
- Kelola profil admin

### Pengalaman UI

- Responsive layout (desktop/mobile sidebar)
- Dark mode / light mode
- Toast notification
- Komponen UI modern (shadcn/ui)
- Grafik interaktif (Recharts)

---

## 2) Tech Stack

| Area | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI Library | React 19 |
| State Management | Redux Toolkit + React Redux |
| Form Handling | React Hook Form |
| Validation | Zod + `@hookform/resolvers` |
| HTTP Client | Axios |
| Styling | Tailwind CSS v4 |
| Component System | shadcn/ui + Base UI |
| Charting | Recharts |
| Icons | Lucide React |
| Notifications | Sonner |
| Theme | next-themes |
| Linting | ESLint + `eslint-config-next` |
| Deployment | Netlify |

---

## 3) Arsitektur Frontend

Arsitektur utama:

1. **App Router pages** di `src/app`
2. **Route protection** via `RouteGuard`
3. **Global state** via Redux slices (`auth`, `requests`, `occupations`, `policies`, `branches`)
4. **API layer** terpusat di `src/lib/api.ts` (interceptor token + error handling)
5. **Form validation** di `src/lib/validations.ts`

---

## 4) Struktur Folder

```text
bsp-fe/
├── src/
│   ├── app/                     # Next.js App Router pages
│   │   ├── admin/               # Halaman admin
│   │   ├── customer/            # Halaman customer
│   │   ├── login/
│   │   ├── register/
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Redirect by role
│   ├── components/
│   │   ├── layout/              # AppLayout, RouteGuard
│   │   ├── shared/              # Shared components
│   │   └── ui/                  # shadcn/ui components
│   ├── lib/                     # api client, validators, utilities
│   ├── store/                   # redux store + slices
│   └── types/                   # shared TS types & enums
├── public/
├── netlify.toml
├── next.config.ts
└── package.json
```

---

## 5) Routing Utama

### Public Routes

- `/login`
- `/register`

### Root Route

- `/` akan redirect otomatis:
	- belum login -> `/login`
	- role admin -> `/admin/dashboard`
	- role customer -> `/customer/dashboard`

### Admin Routes

- `/admin/dashboard`
- `/admin/requests`
- `/admin/occupation-types`
- `/admin/policies`
- `/admin/profile`

### Customer Routes

- `/customer/dashboard`
- `/customer/request`
- `/customer/my-requests`
- `/customer/invoice`
- `/customer/profile`

---

## 6) Prasyarat

- Node.js 20+
- npm 10+ (atau package manager lain)
- Backend BSP berjalan (Go / Nest) yang kompatibel endpoint

---

## 7) Instalasi & Menjalankan Lokal

### Install dependency

```bash
npm install
```

### Jalankan development server

```bash
npm run dev
```

Buka:

- `http://localhost:3000`

### Build production

```bash
npm run build
```

### Run production build

```bash
npm run start
```

### Lint

```bash
npm run lint
```

---

## 8) Konfigurasi Environment

Buat file `.env.local` di root `bsp-fe`.

### Variabel yang digunakan

| Variable | Wajib | Default | Keterangan |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | Tidak | `http://localhost:3001/api` | Base URL API backend |

Contoh:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 9) Integrasi API

Semua request API dikelola oleh [src/lib/api.ts](src/lib/api.ts):

- Menetapkan `baseURL` dari env
- Menambahkan header `Authorization: Bearer <token>` otomatis
- Menangani upload `FormData`
- Menangani error `401` dengan logout otomatis dan redirect ke login

State API dikelola per domain pada Redux slices:

- [src/store/slices/authSlice.ts](src/store/slices/authSlice.ts)
- [src/store/slices/requestSlice.ts](src/store/slices/requestSlice.ts)
- [src/store/slices/occupationSlice.ts](src/store/slices/occupationSlice.ts)
- [src/store/slices/policySlice.ts](src/store/slices/policySlice.ts)
- [src/store/slices/branchSlice.ts](src/store/slices/branchSlice.ts)

---

## 10) State Management (Redux)

Store utama ada di [src/store/store.ts](src/store/store.ts) dengan reducer:

- `auth`
- `requests`
- `occupations`
- `policies`
- `branches`

Global provider dipasang di [src/app/layout.tsx](src/app/layout.tsx) via [src/store/provider.tsx](src/store/provider.tsx).

---

## 11) Validasi Form

Semua schema validasi ada di [src/lib/validations.ts](src/lib/validations.ts), termasuk:

- Login
- Register
- Insurance request
- Occupation type
- Profile
- Policy

Validation menggunakan Zod, lalu dihubungkan ke React Hook Form via `zodResolver`.

---

## 12) UI, Theme, dan Design System

- Styling berbasis Tailwind CSS v4
- Theme switching (light/dark) via `next-themes`
- Komponen UI dari shadcn/ui + Base UI
- Ikon menggunakan Lucide
- Notifikasi menggunakan Sonner toaster
- Global style/theme tokens di [src/app/globals.css](src/app/globals.css)

---

## 13) Deployment

### Netlify

Konfigurasi sudah tersedia di [netlify.toml](netlify.toml):

- Build command: `npm run build`
- Publish directory: `.next`
- Node version: `20`

### Next config

[next.config.ts](next.config.ts) sudah mengatur:

- `images.unoptimized = true` (kompatibilitas deploy)
- `remotePatterns` untuk domain `**.supabase.co` (foto profil)

---

## 14) Integrasi dengan Backend BSP

Frontend ini dirancang untuk API backend BSP dengan endpoint utama:

- `/auth/*`
- `/users/me`
- `/users/me/photo`
- `/branches`
- `/occupation-types`
- `/insurance-requests`
- `/policies`

Jika backend berjalan lokal default, gunakan:

`NEXT_PUBLIC_API_URL=http://localhost:3001/api`

---

## 15) Troubleshooting

### Halaman terus redirect ke login

- Pastikan login berhasil dan token tersimpan di `localStorage`
- Cek response backend untuk endpoint login

### `401 Unauthorized` setelah login

- Token mungkin expired / invalid
- Pastikan `JWT_SECRET` backend konsisten
- Pastikan URL API benar (`NEXT_PUBLIC_API_URL`)

### CORS error saat hit API

- Tambahkan origin frontend ke whitelist CORS di backend
- Contoh local origin: `http://localhost:3000`

### Gambar profil tidak muncul

- Pastikan URL Supabase valid dari backend
- Pastikan `next.config.ts` sudah mengizinkan `**.supabase.co`

### Build gagal di deploy

- Pastikan Node versi sesuai (20+)
- Pastikan env `NEXT_PUBLIC_API_URL` diset di platform deploy

---

## 16) Referensi File Penting

- Root layout: [src/app/layout.tsx](src/app/layout.tsx)
- Home redirect: [src/app/page.tsx](src/app/page.tsx)
- Route guard: [src/components/layout/RouteGuard.tsx](src/components/layout/RouteGuard.tsx)
- App layout shell: [src/components/layout/AppLayout.tsx](src/components/layout/AppLayout.tsx)
- API client: [src/lib/api.ts](src/lib/api.ts)
- Validation schema: [src/lib/validations.ts](src/lib/validations.ts)
- Redux store: [src/store/store.ts](src/store/store.ts)
- Types & enums: [src/types/index.ts](src/types/index.ts)

---
