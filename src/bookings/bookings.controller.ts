import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';

@Controller(['bookings', 'reservasi'])
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // GET /bookings & GET /reservasi -> Semua reservasi
  @Get()
  findAll(@Query() query: any) {
    const data = this.bookingsService.findAll(query);
    return {
      success: true,
      message: 'Daftar semua reservasi berhasil diambil',
      total: data.length,
      data,
    };
  }

  // POST /bookings & POST /reservasi -> 201 Created
  @Post()
  @HttpCode(201)
  create(@Body() body: any) {
    const data = this.bookingsService.create(body);
    return { success: true, message: 'Reservasi berhasil dibuat', data };
  }

  // GET /bookings/:id & GET /reservasi/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return {
      success: true,
      message: 'Detail reservasi berhasil diambil',
      data: this.bookingsService.findOne(Number(id)),
    };
  }

  // PATCH /bookings/:id/cancel & /reservasi/:id/cancel
  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    return {
      success: true,
      message: 'Reservasi berhasil dibatalkan, slot kembali tersedia',
      data: this.bookingsService.cancel(Number(id)),
    };
  }

  // PATCH /bookings/:id/batal & /reservasi/:id/batal (alias bahasa Indonesia)
  @Patch(':id/batal')
  cancelId(@Param('id') id: string) {
    return {
      success: true,
      message: 'Reservasi berhasil dibatalkan, slot kembali tersedia',
      data: this.bookingsService.cancel(Number(id)),
    };
  }

  // DELETE /bookings/:id & /reservasi/:id
  @Delete(':id')
  delete(@Param('id') id: string) {
    return {
      success: true,
      message: 'Data reservasi berhasil dihapus',
      data: this.bookingsService.delete(Number(id)),
    };
  }
}

// GET /users/:userId/bookings & GET /pengguna/:userId/reservasi
@Controller(['users', 'pengguna'])
export class UsersBookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get([':userId/bookings', ':userId/reservasi'])
  findByUser(@Param('userId') userId: string, @Query('status') status?: string) {
    const data = this.bookingsService.findByUser(userId, status);
    return {
      success: true,
      message: `Daftar reservasi milik user "${userId}" berhasil diambil`,
      total: data.length,
      data,
    };
  }
}

// GET /fields/:id/availability & GET /lapangan/:id/ketersediaan
@Controller(['fields', 'lapangan'])
export class FieldAvailabilityController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get([':id/availability', ':id/ketersediaan'])
  availability(@Param('id') id: string, @Query('date') date?: string, @Query('tanggal') tanggal?: string) {
    const queryDate = date || tanggal;
    return {
      success: true,
      message: 'Ketersediaan lapangan berhasil diambil',
      data: this.bookingsService.getAvailability(Number(id), queryDate),
    };
  }
}
