import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FieldsService } from '../fields/fields.service';

export type BookingStatus = 'BOOKED' | 'CANCELLED' | 'COMPLETED';

export interface Booking {
  id: number;
  userId: string;
  fieldId: number;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  customerName: string;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
  cancelledAt?: string;
}

// Jam operasional lapangan
const OPEN_TIME = '08:00';
const CLOSE_TIME = '22:00';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const toMinutes = (t: string): number => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

const fmt = (m: number): string =>
  `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

const isValidDate = (s: string): boolean => {
  if (!DATE_REGEX.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
};

@Injectable()
export class BookingsService {
  // Data sementara disimpan di array (tanpa database)
  private readonly bookings: Booking[] = [
    {
      id: 1,
      userId: 'budi',
      fieldId: 1,
      date: '2026-11-03',
      startTime: '09:00',
      endTime: '11:00',
      customerName: 'Budi Santoso',
      totalPrice: 300000,
      status: 'COMPLETED',
      createdAt: '2026-11-01T08:00:00.000Z',
    },
    {
      id: 2,
      userId: 'siti',
      fieldId: 3,
      date: '2026-11-04',
      startTime: '14:00',
      endTime: '16:00',
      customerName: 'Siti Rahma',
      totalPrice: 400000,
      status: 'BOOKED',
      createdAt: '2026-11-02T08:00:00.000Z',
    },
  ];
  private nextId = 3;

  constructor(private readonly fieldsService: FieldsService) {}

  // ---------- helper ----------
  private badRequest(message: string): never {
    throw new BadRequestException({
      success: false,
      statusCode: 400,
      error: 'Bad Request',
      message,
    });
  }

  /** Slot yang masih dianggap terpakai: semua status selain CANCELLED */
  private activeBookings(fieldId: number, date: string): Booking[] {
    return this.bookings
      .filter((b) => b.fieldId === fieldId && b.date === date && b.status !== 'CANCELLED')
      .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
  }

  // ---------- POST /bookings ----------
  create(body: any): Booking {
    const { fieldId, date, startTime, endTime, customerName } = body ?? {};

    // 1. Validasi manual (tanpa DTO / class-validator)
    const missing = ['fieldId', 'date', 'startTime', 'endTime', 'customerName'].filter(
      (k) => body?.[k] === undefined || body?.[k] === null || body?.[k] === '',
    );
    if (missing.length) this.badRequest(`Field wajib diisi: ${missing.join(', ')}`);

    if (typeof customerName !== 'string' || !customerName.trim()) {
      this.badRequest('customerName harus berupa teks yang tidak kosong');
    }
    if (typeof date !== 'string' || !isValidDate(date)) {
      this.badRequest('Format date harus YYYY-MM-DD dan merupakan tanggal yang valid');
    }
    if (
      typeof startTime !== 'string' || !TIME_REGEX.test(startTime) ||
      typeof endTime !== 'string' || !TIME_REGEX.test(endTime)
    ) {
      this.badRequest('Format startTime dan endTime harus HH:mm (contoh: 18:00)');
    }
    const start = toMinutes(startTime);
    const end = toMinutes(endTime);
    if (start >= end) this.badRequest('startTime harus lebih awal dari endTime');
    if (start < toMinutes(OPEN_TIME) || end > toMinutes(CLOSE_TIME)) {
      this.badRequest(`Jam operasional lapangan adalah ${OPEN_TIME} - ${CLOSE_TIME}`);
    }

    // 2. Lapangan harus ada (404 jika tidak ditemukan)
    const field = this.fieldsService.findOne(Number(fieldId));

    if (field.status !== 'ACTIVE') {
      throw new ConflictException({
        success: false,
        statusCode: 409,
        error: 'Conflict',
        message: `Lapangan "${field.name}" sedang tidak aktif (${field.status}) dan tidak dapat dipesan`,
      });
    }

    // 3. Cek bentrok jadwal. Reservasi CANCELLED tidak dianggap slot terpakai.
    //    Dua rentang waktu bentrok jika: start < existing.end && end > existing.start
    const conflict = this.activeBookings(field.id, date).find(
      (b) => start < toMinutes(b.endTime) && end > toMinutes(b.startTime),
    );
    if (conflict) {
      throw new ConflictException({
        success: false,
        statusCode: 409,
        error: 'Conflict',
        message: `Jadwal bentrok dengan reservasi lain pada ${date} pukul ${conflict.startTime}-${conflict.endTime}`,
        conflictWith: {
          bookingId: conflict.id,
          date: conflict.date,
          startTime: conflict.startTime,
          endTime: conflict.endTime,
        },
      });
    }

    // 4. Simpan booking
    const name = customerName.trim();
    const userId =
      typeof body.userId === 'string' && body.userId.trim()
        ? body.userId.trim()
        : name.toLowerCase().replace(/\s+/g, '-'); // default userId dari customerName

    const booking: Booking = {
      id: this.nextId++,
      userId,
      fieldId: field.id,
      date,
      startTime,
      endTime,
      customerName: name,
      totalPrice: Math.round(((end - start) / 60) * field.pricePerHour),
      status: 'BOOKED',
      createdAt: new Date().toISOString(),
    };
    this.bookings.push(booking);
    return booking;
  }

  // ---------- GET /bookings/:id ----------
  findOne(id: number): Booking {
    const booking = this.bookings.find((b) => b.id === id);
    if (!booking) {
      throw new NotFoundException({
        success: false,
        statusCode: 404,
        error: 'Not Found',
        message: `Reservasi dengan id ${id} tidak ditemukan`,
      });
    }
    return booking;
  }

  // ---------- GET /users/:userId/bookings?status=BOOKED ----------
  findByUser(userId: string, status?: string): Booking[] {
    if (status && !['BOOKED', 'CANCELLED', 'COMPLETED'].includes(status.toUpperCase())) {
      this.badRequest('Query status harus salah satu dari: BOOKED, CANCELLED, COMPLETED');
    }
    return this.bookings.filter(
      (b) =>
        b.userId.toLowerCase() === userId.toLowerCase() &&
        (!status || b.status === status.toUpperCase()),
    );
  }

  // ---------- PATCH /bookings/:id/cancel ----------
  cancel(id: number): Booking {
    const booking = this.findOne(id);

    if (booking.status === 'CANCELLED') {
      throw new ConflictException({
        success: false,
        statusCode: 409,
        error: 'Conflict',
        message: `Reservasi dengan id ${id} sudah dibatalkan sebelumnya`,
      });
    }
    if (booking.status === 'COMPLETED') {
      throw new ConflictException({
        success: false,
        statusCode: 409,
        error: 'Conflict',
        message: `Reservasi dengan id ${id} sudah selesai dan tidak dapat dibatalkan`,
      });
    }

    booking.status = 'CANCELLED';
    booking.cancelledAt = new Date().toISOString();
    return booking;
  }

  // ---------- GET /fields/:id/availability?date=YYYY-MM-DD ----------
  getAvailability(fieldId: number, date?: string) {
    const field = this.fieldsService.findOne(fieldId);

    if (!date) this.badRequest('Query parameter date wajib diisi (format YYYY-MM-DD)');
    if (!isValidDate(date)) {
      this.badRequest('Format date harus YYYY-MM-DD dan merupakan tanggal yang valid');
    }

    const booked = this.activeBookings(field.id, date);

    // Hitung rentang waktu kosong di antara jam buka - tutup
    const availableSlots: { startTime: string; endTime: string }[] = [];
    if (field.status === 'ACTIVE') {
      let cursor = toMinutes(OPEN_TIME);
      for (const b of booked) {
        if (toMinutes(b.startTime) > cursor) {
          availableSlots.push({ startTime: fmt(cursor), endTime: b.startTime });
        }
        cursor = Math.max(cursor, toMinutes(b.endTime));
      }
      if (cursor < toMinutes(CLOSE_TIME)) {
        availableSlots.push({ startTime: fmt(cursor), endTime: CLOSE_TIME });
      }
    }

    return {
      field: { id: field.id, name: field.name, sportType: field.sportType, status: field.status },
      date,
      operatingHours: { open: OPEN_TIME, close: CLOSE_TIME },
      bookedSlots: booked.map((b) => ({
        bookingId: b.id,
        startTime: b.startTime,
        endTime: b.endTime,
        status: b.status,
      })),
      availableSlots,
    };
  }

  // ---------- GET /bookings & GET /reservasi ----------
  findAll(query?: {
    status?: string;
    fieldId?: string | number;
    date?: string;
    userId?: string;
  }): Booking[] {
    let result = [...this.bookings];

    if (query?.status) {
      const statusUpper = query.status.toUpperCase();
      result = result.filter((b) => b.status === statusUpper);
    }
    if (query?.fieldId) {
      const fid = Number(query.fieldId);
      result = result.filter((b) => b.fieldId === fid);
    }
    if (query?.date) {
      result = result.filter((b) => b.date === query.date);
    }
    if (query?.userId) {
      const uid = query.userId.toLowerCase();
      result = result.filter((b) => b.userId.toLowerCase() === uid);
    }

    return result;
  }

  // ---------- DELETE /bookings/:id & GET /reservasi/:id ----------
  delete(id: number): Booking {
    const index = this.bookings.findIndex((b) => b.id === id);
    if (index === -1) {
      throw new NotFoundException({
        success: false,
        statusCode: 404,
        error: 'Not Found',
        message: `Reservasi dengan id ${id} tidak ditemukan`,
      });
    }
    const [deleted] = this.bookings.splice(index, 1);
    return deleted;
  }
}
