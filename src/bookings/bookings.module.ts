import { Module } from '@nestjs/common';
import { FieldsModule } from '../fields/fields.module';
import {
  BookingsController,
  FieldAvailabilityController,
  UsersBookingsController,
} from './bookings.controller';
import { BookingsService } from './bookings.service';

@Module({
  imports: [FieldsModule],
  controllers: [BookingsController, UsersBookingsController, FieldAvailabilityController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
