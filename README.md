# Piutang Toko

Aplikasi web untuk mencatat & mengelola piutang pelanggan toko: siapa berhutang, berapa, jatuh tempo kapan, dan status pembayarannya (belum lunas / dicicil / lunas). Dibangun dengan Next.js + Prisma + MySQL, dan didesain untuk di-deploy ke Vercel.

## Ringkasan Fitur

- **Lihat Piutang** — daftar semua piutang, bisa dicari, disortir, dan difilter belum lunas/lunas.
- **Buat Piutang Baru** — mencatat piutang baru untuk pelanggan yang sudah terdaftar.
- **Lewat Tenggat** — daftar piutang yang sudah melewati tanggal jatuh tempo.
- **Pelanggan** — data pelanggan, riwayat piutang per pelanggan, tambah/edit/hapus pelanggan.
- **Selesaikan Piutang** (khusus Boss) — menandai piutang lunas atau mencicil, dengan verifikasi ulang password boss sebelum tersimpan.
- **Admin** (khusus Boss) — ubah username/password akun boss & staff, tambah/hapus akun staff, tanpa perlu sentuh database.

Role login: **Boss** (akses penuh + menu Admin + bisa menyelesaikan piutang) dan **Staff** (bisa lihat & mencatat piutang, tidak bisa menyelesaikan piutang atau masuk menu Admin).

## 1. Setup Awal (sekali saja)

### a. Buat database MySQL

Aplikasi ini butuh database MySQL yang bisa diakses dari internet (bukan MySQL lokal seperti XAMPP/Laragon — itu hanya bisa diakses dari komputer sendiri, sedangkan Vercel butuh koneksi dari luar).

Pilih salah satu provider MySQL cloud, misalnya:

- [Aiven](https://aiven.io) — punya paket gratis untuk MySQL skala kecil.
- [Railway](https://railway.app) — tinggal klik "New → Database → MySQL".
- Provider lain yang menyediakan MySQL (mis. layanan hosting yang sudah anda punya).

Setelah database dibuat, salin *connection string*-nya (format `mysql://user:password@host:3306/nama_database`).

### b. Install dependencies

```bash
npm install
```

### c. Isi environment variable

Salin `.env.example` menjadi `.env.local`, lalu isi semuanya:

```
DATABASE_URL="mysql://...."                # connection string dari langkah a
SESSION_SECRET="string-acak-minimal-32-karakter"

SEED_BOSS_USERNAME="..."
SEED_BOSS_PASSWORD="..."
SEED_STAFF1_USERNAME="..."
SEED_STAFF1_PASSWORD="..."
SEED_STAFF2_USERNAME="..."
SEED_STAFF2_PASSWORD="..."
```

Username & password 3 akun awal **wajib** diisi di sini — tidak ada nilai default tersembunyi di source code, supaya repo ini aman dipush ke GitHub (bahkan kalau suatu saat public) tanpa membocorkan password asli. `.env.local` sendiri tidak ikut ter-commit ke git.

### d. Buat tabel & isi akun awal

```bash
npm run db:deploy   # membuat semua tabel di database
npm run db:seed     # mengisi 3 akun awal sesuai .env.local
```

Setelah login sebagai boss, password ini bisa diganti kapan saja lewat menu Admin.

### e. Jalankan aplikasi

```bash
npm run dev
```

Buka `http://localhost:3000`, login dengan salah satu dari 3 akun yang sudah di-seed.

## 2. Deploy ke Vercel (untuk pemakaian sehari-hari)

### a. Push kode ke GitHub

Buat repository baru di GitHub, lalu push folder project ini ke sana.

### b. Import project ke Vercel

1. Buka [vercel.com](https://vercel.com) → **Add New → Project** → pilih repository GitHub tadi.
2. Vercel otomatis mendeteksi ini project Next.js, tidak perlu ubah setting build apa pun.
3. **Sebelum klik Deploy**, buka tab **Settings → Environment Variables**, tambahkan:
   - `DATABASE_URL` — connection string MySQL dari langkah 1a (Vercel tidak punya integrasi 1-klik untuk MySQL seperti Postgres, jadi ini harus diisi manual).
   - `SESSION_SECRET` — string acak panjang (boleh generate di https://generate-secret.vercel.app/32).
   - `SEED_BOSS_USERNAME`, `SEED_BOSS_PASSWORD`, `SEED_STAFF1_USERNAME`, `SEED_STAFF1_PASSWORD`, `SEED_STAFF2_USERNAME`, `SEED_STAFF2_PASSWORD` — kredensial 3 akun awal (wajib, dipakai saat `npm run db:seed`).
4. Klik **Deploy**.

### c. Buat tabel & isi akun awal di database production (sekali saja)

Setelah deploy pertama selesai, dari komputer anda:

```bash
npm install -g vercel      # sekali saja, kalau belum ada
vercel link                # hubungkan folder ini ke project Vercel anda
vercel env pull .env.local # ambil environment variable production ke lokal
npm run db:deploy          # buat semua tabel di database production
npm run db:seed            # isi 3 akun awal
```

Setelah ini, aplikasi di URL Vercel anda sudah siap dipakai dan login dengan 3 akun tersebut.

### d. Update berikutnya

Setiap kali push ke branch utama di GitHub, Vercel otomatis build & deploy ulang. Kalau ada perubahan struktur data (jarang terjadi untuk pemakaian normal), ulangi `npm run db:deploy` sekali dari komputer anda.

## Struktur Teknis (untuk developer)

- **Next.js 16 (App Router) + TypeScript** — frontend & API (Route Handlers) dalam satu project.
- **Prisma + MySQL** (via `@prisma/adapter-mariadb`, kompatibel dengan MySQL & MariaDB) — database.
- **Autentikasi custom** — 3 akun disimpan di database (password di-hash dengan bcrypt), sesi login pakai cookie httpOnly bertanda tangan JWT (lib `jose`). Middleware (`src/proxy.ts`) melindungi semua halaman & API kecuali `/login`.
- **Aksi sensitif** (menyelesaikan piutang, semua perubahan di menu Admin) selalu meminta re-autentikasi password boss di server, bukan hanya disembunyikan di UI.

## Struktur Folder Penting

```
prisma/schema.prisma       skema database
prisma/seed.ts             data akun awal
src/app/(app)/...          halaman-halaman utama (butuh login)
src/app/api/...            API backend
src/components/            komponen UI
src/lib/                   helper (auth, format, validasi, dll)
```
