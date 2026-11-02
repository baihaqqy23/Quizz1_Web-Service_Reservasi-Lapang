import { Controller, Get, Param } from '@nestjs/common';
import { FieldsService } from './fields.service';

@Controller(['fields', 'lapangan'])
export class FieldsController {
  constructor(private readonly fieldsService: FieldsService) {}

  // GET /fields & GET /lapangan
  @Get()
  findAll() {
    const data = this.fieldsService.findAll();
    return {
      success: true,
      message: 'Daftar lapangan berhasil diambil',
      total: data.length,
      data,
    };
  }

  // GET /fields/:id & GET /lapangan/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return {
      success: true,
      message: 'Detail lapangan berhasil diambil',
      data: this.fieldsService.findOne(Number(id)),
    };
  }
}
