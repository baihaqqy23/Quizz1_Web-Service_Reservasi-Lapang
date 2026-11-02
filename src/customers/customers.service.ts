import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
  createdAt: string;
}

@Injectable()
export class CustomersService {
  // Data sementara disimpan di array (tanpa database)
  private readonly customers: Customer[] = [
    {
      id: 1,
      name: 'Budi Santoso',
      email: 'budi.santoso@example.com',
      phone: '081234567890',
      address: 'Jl. Merdeka No. 10, Jakarta',
      createdAt: '2026-11-01T08:00:00.000Z',
    },
    {
      id: 2,
      name: 'Siti Rahma',
      email: 'siti.rahma@example.com',
      phone: '081987654321',
      address: 'Jl. Sudirman No. 45, Bandung',
      createdAt: '2026-11-01T09:30:00.000Z',
    },
  ];
  private nextId = 3;

  private badRequest(message: string): never {
    throw new BadRequestException({
      success: false,
      statusCode: 400,
      error: 'Bad Request',
      message,
    });
  }

  // ---------- GET /customers & GET /pelanggan ----------
  findAll(): Customer[] {
    return this.customers;
  }

  // ---------- GET /customers/:id & GET /pelanggan/:id ----------
  findOne(id: number): Customer {
    const customer = this.customers.find((c) => c.id === id);
    if (!customer) {
      throw new NotFoundException({
        success: false,
        statusCode: 404,
        error: 'Not Found',
        message: `Pelanggan dengan id ${id} tidak ditemukan`,
      });
    }
    return customer;
  }

  // ---------- POST /customers & POST /pelanggan ----------
  create(body: any): Customer {
    const { name, email, phone, address } = body ?? {};

    const missing = ['name', 'phone'].filter(
      (k) => body?.[k] === undefined || body?.[k] === null || String(body?.[k]).trim() === '',
    );
    if (missing.length) {
      this.badRequest(`Field wajib diisi: ${missing.join(', ')}`);
    }

    if (typeof name !== 'string' || !name.trim()) {
      this.badRequest('name harus berupa teks dan tidak boleh kosong');
    }
    if (typeof phone !== 'string' || !phone.trim()) {
      this.badRequest('phone harus berupa teks dan tidak boleh kosong');
    }

    const newCustomer: Customer = {
      id: this.nextId++,
      name: name.trim(),
      email: typeof email === 'string' ? email.trim() : '',
      phone: phone.trim(),
      address: typeof address === 'string' ? address.trim() : '',
      createdAt: new Date().toISOString(),
    };

    this.customers.push(newCustomer);
    return newCustomer;
  }

  // ---------- PATCH/PUT /customers/:id & /pelanggan/:id ----------
  update(id: number, body: any): Customer {
    const customer = this.findOne(id);

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || !body.name.trim()) {
        this.badRequest('name tidak boleh kosong');
      }
      customer.name = body.name.trim();
    }

    if (body.email !== undefined) {
      customer.email = typeof body.email === 'string' ? body.email.trim() : '';
    }

    if (body.phone !== undefined) {
      if (typeof body.phone !== 'string' || !body.phone.trim()) {
        this.badRequest('phone tidak boleh kosong');
      }
      customer.phone = body.phone.trim();
    }

    if (body.address !== undefined) {
      customer.address = typeof body.address === 'string' ? body.address.trim() : '';
    }

    return customer;
  }

  // ---------- DELETE /customers/:id & /pelanggan/:id ----------
  delete(id: number): Customer {
    const index = this.customers.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new NotFoundException({
        success: false,
        statusCode: 404,
        error: 'Not Found',
        message: `Pelanggan dengan id ${id} tidak ditemukan`,
      });
    }
    const [deleted] = this.customers.splice(index, 1);
    return deleted;
  }
}

