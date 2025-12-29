import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create users
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const hashedPasswordManager = await bcrypt.hash('manager123', 10)
  const hashedPasswordCashier = await bcrypt.hash('cashier123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@pos.com' },
    update: {},
    create: {
      email: 'admin@pos.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  })

  const manager = await prisma.user.upsert({
    where: { email: 'manager@pos.com' },
    update: {},
    create: {
      email: 'manager@pos.com',
      password: hashedPasswordManager,
      name: 'Manager User',
      role: 'MANAGER',
    },
  })

  const cashier = await prisma.user.upsert({
    where: { email: 'cashier@pos.com' },
    update: {},
    create: {
      email: 'cashier@pos.com',
      password: hashedPasswordCashier,
      name: 'Cashier User',
      role: 'CASHIER',
    },
  })

  console.log('Users created:', { admin, manager, cashier })

  // Create categories
  const electronics = await prisma.category.upsert({
    where: { name: 'Electronics' },
    update: {},
    create: {
      name: 'Electronics',
      description: 'Electronic devices and accessories',
    },
  })

  const groceries = await prisma.category.upsert({
    where: { name: 'Groceries' },
    update: {},
    create: {
      name: 'Groceries',
      description: 'Food and household items',
    },
  })

  const clothing = await prisma.category.upsert({
    where: { name: 'Clothing' },
    update: {},
    create: {
      name: 'Clothing',
      description: 'Apparel and accessories',
    },
  })

  console.log('Categories created:', { electronics, groceries, clothing })

  // Create products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { sku: 'ELEC-001' },
      update: {},
      create: {
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse',
        sku: 'ELEC-001',
        barcode: '1234567890123',
        price: 29.99,
        costPrice: 15.00,
        stock: 50,
        minStock: 10,
        categoryId: electronics.id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'ELEC-002' },
      update: {},
      create: {
        name: 'USB Cable',
        description: 'USB-C to USB-A cable, 2m',
        sku: 'ELEC-002',
        barcode: '1234567890124',
        price: 12.99,
        costPrice: 5.00,
        stock: 100,
        minStock: 20,
        categoryId: electronics.id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'GROC-001' },
      update: {},
      create: {
        name: 'Rice 5kg',
        description: 'Premium white rice',
        sku: 'GROC-001',
        barcode: '1234567890125',
        price: 15.99,
        costPrice: 10.00,
        stock: 200,
        minStock: 30,
        categoryId: groceries.id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'GROC-002' },
      update: {},
      create: {
        name: 'Cooking Oil 1L',
        description: 'Vegetable cooking oil',
        sku: 'GROC-002',
        barcode: '1234567890126',
        price: 8.99,
        costPrice: 6.00,
        stock: 150,
        minStock: 25,
        categoryId: groceries.id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'CLTH-001' },
      update: {},
      create: {
        name: 'T-Shirt',
        description: 'Cotton t-shirt, various sizes',
        sku: 'CLTH-001',
        barcode: '1234567890127',
        price: 19.99,
        costPrice: 10.00,
        stock: 75,
        minStock: 15,
        categoryId: clothing.id,
      },
    }),
  ])

  console.log('Products created:', products.length)

  // Create customers
  const customer1 = await prisma.customer.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      address: '123 Main St, City',
      loyaltyPoints: 100,
    },
  })

  const customer2 = await prisma.customer.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1234567891',
      address: '456 Oak Ave, City',
      loyaltyPoints: 50,
    },
  })

  console.log('Customers created:', { customer1, customer2 })

  // Create suppliers
  const supplier1 = await prisma.supplier.upsert({
    where: { email: 'supplier1@example.com' },
    update: {},
    create: {
      name: 'Tech Supplies Inc',
      email: 'supplier1@example.com',
      phone: '+1234567892',
      address: '789 Industrial Park',
      contactPerson: 'Bob Johnson',
    },
  })

  const supplier2 = await prisma.supplier.upsert({
    where: { email: 'supplier2@example.com' },
    update: {},
    create: {
      name: 'Food Distributors Ltd',
      email: 'supplier2@example.com',
      phone: '+1234567893',
      address: '321 Warehouse Rd',
      contactPerson: 'Alice Williams',
    },
  })

  console.log('Suppliers created:', { supplier1, supplier2 })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
