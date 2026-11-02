import { Injectable, NotFoundException } from '@nestjs/common';

export type FieldStatus = 'ACTIVE' | 'MAINTENANCE';

export interface Field {
  id: number;
  name: string;
  sportType: string;
  pricePerHour: number;
  status: FieldStatus;
}

@Injectable()
export class FieldsService {
  // Data sementara disimpan di array (tanpa database)
  private readonly fields: Field[] = [
    { id: 1, name: 'Lapangan Futsal A', sportType: 'FUTSAL', pricePerHour: 150000, status: 'ACTIVE' },
    { id: 2, name: 'Lapangan Badminton 1', sportType: 'BADMINTON', pricePerHour: 60000, status: 'ACTIVE' },
    { id: 3, name: 'Lapangan Basket Indoor', sportType: 'BASKET', pricePerHour: 200000, status: 'ACTIVE' },
    { id: 4, name: 'Lapangan Tenis Outdoor', sportType: 'TENIS', pricePerHour: 120000, status: 'MAINTENANCE' },
  ];

  findAll(): Field[] {
    return this.fields;
  }

  findOne(id: number): Field {
    const field = this.fields.find((f) => f.id === id);
    if (!field) {
      throw new NotFoundException({
        success: false,
        statusCode: 404,
        error: 'Not Found',
        message: `Lapangan dengan id ${id} tidak ditemukan`,
      });
    }
    return field;
  }
}
