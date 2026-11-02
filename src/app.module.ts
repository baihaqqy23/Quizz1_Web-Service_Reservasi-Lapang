import { Module } from '@nestjs/common';
import { FieldsModule } from './fields/fields.module';
import { BookingsModule } from './bookings/bookings.module';
import { CustomersModule } from './customers/customers.module';
import { AppController } from './app.controller';

@Module({
  imports: [FieldsModule, BookingsModule, CustomersModule],
  controllers: [AppController],
})
export class AppModule {}
