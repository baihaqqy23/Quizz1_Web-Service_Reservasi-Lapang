import { Controller, Get } from '@nestjs/common';
import { FieldsService } from './fields/fields.service';
import { CustomersService } from './customers/customers.service';
import { BookingsService } from './bookings/bookings.service';

@Controller()
export class AppController {
  constructor(
    private readonly fieldsService: FieldsService,
    private readonly customersService: CustomersService,
    private readonly bookingsService: BookingsService,
  ) {}

  @Get()
  getOverview() {
    return {
      success: true,
      message: 'Sistem Reservasi Lapangan Olahraga API',
      summary: {
        totalLapangan: this.fieldsService.findAll().length,
        totalPelanggan: this.customersService.findAll().length,
        totalBooking: this.bookingsService.findAll().length,
      },
      data: {
        lapangan: this.fieldsService.findAll(),
        pelanggan: this.customersService.findAll(),
        booking: this.bookingsService.findAll(),
      },
    };
  }
}

