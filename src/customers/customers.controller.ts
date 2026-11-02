import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { CustomersService } from './customers.service';

@Controller(['customers', 'pelanggan'])
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  // GET /customers & GET /pelanggan
  @Get()
  findAll() {
    const data = this.customersService.findAll();
    return {
      success: true,
      message: 'Daftar pelanggan berhasil diambil',
      total: data.length,
      data,
    };
  }

  // GET /customers/:id & GET /pelanggan/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return {
      success: true,
      message: 'Detail pelanggan berhasil diambil',
      data: this.customersService.findOne(Number(id)),
    };
  }

  // POST /customers & POST /pelanggan -> 201 Created
  @Post()
  @HttpCode(201)
  create(@Body() body: any) {
    const data = this.customersService.create(body);
    return {
      success: true,
      message: 'Data pelanggan berhasil ditambahkan',
      data,
    };
  }

  // PATCH /customers/:id & PATCH /pelanggan/:id
  @Patch(':id')
  updatePatch(@Param('id') id: string, @Body() body: any) {
    const data = this.customersService.update(Number(id), body);
    return {
      success: true,
      message: 'Data pelanggan berhasil diperbarui',
      data,
    };
  }

  // PUT /customers/:id & PUT /pelanggan/:id
  @Put(':id')
  updatePut(@Param('id') id: string, @Body() body: any) {
    const data = this.customersService.update(Number(id), body);
    return {
      success: true,
      message: 'Data pelanggan berhasil diperbarui',
      data,
    };
  }

  // DELETE /customers/:id & DELETE /pelanggan/:id
  @Delete(':id')
  delete(@Param('id') id: string) {
    const data = this.customersService.delete(Number(id));
    return {
      success: true,
      message: 'Data pelanggan berhasil dihapus',
      data,
    };
  }
}

