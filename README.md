# Sistem Reservasi Lapangan Olahraga — REST API NestJS

Kuis Proyek Individu Sesi 5 • Praktek Pemrograman Web 3
Data disimpan sementara di **array** (tanpa database, tanpa DTO, tanpa class-validator).

## Menjalankan
```bash
npm install
npm run start:dev      # http://localhost:3001 (atau sesuai PORT)
```
Import `Reservasi-Lapangan.postman_collection.json` ke Postman lalu jalankan dengan **Collection Runner**.

## Struktur Proyek
```
src/
├── main.ts
├── app.module.ts
├── fields/        fields.controller.ts · fields.service.ts · fields.module.ts
├── bookings/      bookings.controller.ts · bookings.service.ts · bookings.module.ts
└── customers/     customers.controller.ts · customers.service.ts · customers.module.ts
```

## Daftar Endpoint (Bilingual: Inggris & Indonesia)

### 1. Data Lapangan
| Method | Endpoint | Alias Indonesia | Keterangan | Status sukses |
|---|---|---|---|---|
| GET | `/fields` | `/lapangan` | Daftar semua lapangan | 200 |
| GET | `/fields/:id` | `/lapangan/:id` | Detail lapangan | 200 |
| GET | `/fields/:id/availability?date=` | `/lapangan/:id/ketersediaan?tanggal=` | Jadwal terpakai & slot kosong | 200 |

### 2. Data Pelanggan (Customers) — Baru ✨
| Method | Endpoint | Alias Indonesia | Keterangan | Status sukses |
|---|---|---|---|---|
| GET | `/customers` | `/pelanggan` | Daftar semua pelanggan | 200 |
| GET | `/customers/:id` | `/pelanggan/:id` | Detail data pelanggan | 200 |
| POST | `/customers` | `/pelanggan` | Tambah pelanggan baru | 201 |
| PATCH | `/customers/:id` | `/pelanggan/:id` | Perbarui data pelanggan | 200 |
| PUT | `/customers/:id` | `/pelanggan/:id` | Perbarui data pelanggan | 200 |
| DELETE | `/customers/:id` | `/pelanggan/:id` | Hapus data pelanggan | 200 |

### 3. Data Booking (Reservasi)
| Method | Endpoint | Alias Indonesia | Keterangan | Status sukses |
|---|---|---|---|---|
| GET | `/bookings` | `/reservasi` | Daftar semua reservasi (filter query: status, date, fieldId, userId) | 200 |
| GET | `/bookings/:id` | `/reservasi/:id` | Detail reservasi | 200 |
| POST | `/bookings` | `/reservasi` | Buat reservasi baru | 201 |
| GET | `/users/:userId/bookings` | `/pengguna/:userId/reservasi` | Reservasi milik user tertentu | 200 |
| PATCH | `/bookings/:id/cancel` | `/reservasi/:id/batal` | Batalkan reservasi | 200 |
| DELETE | `/bookings/:id` | `/reservasi/:id` | Hapus data reservasi | 200 |

## Data Dummy Awal (Seed Data)

### Data Pelanggan Awal (2 Data)
1. **ID 1**: Budi Santoso (`budi.santoso@example.com`, `081234567890`)
2. **ID 2**: Siti Rahma (`siti.rahma@example.com`, `081987654321`)

### Data Booking Awal (2 Data)
1. **ID 1**: Lapangan Futsal A (ID 1) • 2026-11-03 09:00–11:00 • Customer: Budi Santoso • Status: `COMPLETED`
2. **ID 2**: Lapangan Basket Indoor (ID 3) • 2026-11-04 14:00–16:00 • Customer: Siti Rahma • Status: `BOOKED`

### Data Lapangan Awal (4 Data)
1. **ID 1**: Lapangan Futsal A (`FUTSAL`, Rp150.000/jam, `ACTIVE`)
2. **ID 2**: Lapangan Badminton 1 (`BADMINTON`, Rp60.000/jam, `ACTIVE`)
3. **ID 3**: Lapangan Basket Indoor (`BASKET`, Rp200.000/jam, `ACTIVE`)
4. **ID 4**: Lapangan Tenis Outdoor (`TENIS`, Rp120.000/jam, `MAINTENANCE`)

---

## Aturan Bisnis
- Jam operasional **08:00–22:00**; `startTime` harus < `endTime`.
- Bentrok jika `start < existing.end && end > existing.start` pada lapangan & tanggal yang sama. Jam bersebelahan (mis. 18:00–19:00 lalu 19:00–20:00) **tidak** bentrok.
- Reservasi `CANCELLED` **tidak** dianggap slot terpakai, sehingga slot bisa dipesan lagi.
- `userId` bersifat opsional di body; jika tidak dikirim, otomatis diambil dari `customerName` (huruf kecil, spasi diganti `-`). Contoh: `"Budi"` → `budi`.
- `totalPrice` = durasi (jam) × `pricePerHour`.

## Contoh Request & Response

### GET /customers (atau /pelanggan)
```json
{
  "success": true,
  "message": "Daftar pelanggan berhasil diambil",
  "total": 2,
  "data": [
    {
      "id": 1,
      "name": "Budi Santoso",
      "email": "budi.santoso@example.com",
      "phone": "081234567890",
      "address": "Jl. Merdeka No. 10, Jakarta",
      "createdAt": "2026-11-01T08:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Siti Rahma",
      "email": "siti.rahma@example.com",
      "phone": "081987654321",
      "address": "Jl. Sudirman No. 45, Bandung",
      "createdAt": "2026-11-01T09:30:00.000Z"
    }
  ]
}
```

### POST /customers (atau /pelanggan) — 201 Created
Request:
```json
{
  "name": "Dewi Lestari",
  "email": "dewi@example.com",
  "phone": "081233445566",
  "address": "Yogyakarta"
}
```
Response:
```json
{
  "success": true,
  "message": "Data pelanggan berhasil ditambahkan",
  "data": {
    "id": 3,
    "name": "Dewi Lestari",
    "email": "dewi@example.com",
    "phone": "081233445566",
    "address": "Yogyakarta",
    "createdAt": "2026-11-02T09:40:00.000Z"
  }
}
```

### GET /bookings (atau /reservasi)
```json
{
  "success": true,
  "message": "Daftar semua reservasi berhasil diambil",
  "total": 2,
  "data": [
    {
      "id": 1,
      "userId": "budi",
      "fieldId": 1,
      "date": "2026-11-03",
      "startTime": "09:00",
      "endTime": "11:00",
      "customerName": "Budi Santoso",
      "totalPrice": 300000,
      "status": "COMPLETED",
      "createdAt": "2026-11-01T08:00:00.000Z"
    },
    {
      "id": 2,
      "userId": "siti",
      "fieldId": 3,
      "date": "2026-11-04",
      "startTime": "14:00",
      "endTime": "16:00",
      "customerName": "Siti Rahma",
      "totalPrice": 400000,
      "status": "BOOKED",
      "createdAt": "2026-11-02T08:00:00.000Z"
    }
  ]
}
```

## Skenario Pengujian (Folder di Postman Collection)
1. **1. Lapangan & Ketersediaan** (Cek daftar lapangan & slot)
2. **2. Booking berhasil** (Buat reservasi, cek detail, cek daftar semua booking)
3. **3. Validasi & konflik jadwal** (Uji bentrok, validasi jam, validasi body)
4. **4. Pembatalan** (Batalkan reservasi, slot kosong kembali & dapat dipesan ulang)
5. **5. Data Pelanggan (Customers)** (CRUD lengkap pelanggan & alias rute Indonesia)
