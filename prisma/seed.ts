import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create restaurant staff users
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const hashedPasswordManager = await bcrypt.hash('manager123', 10)
  const hashedPasswordWaiter = await bcrypt.hash('waiter123', 10)
  const hashedPasswordChef = await bcrypt.hash('chef123', 10)
  const hashedPasswordCashier = await bcrypt.hash('cashier123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@restaurant.com' },
    update: {},
    create: {
      email: 'admin@restaurant.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  })

  const manager = await prisma.user.upsert({
    where: { email: 'manager@restaurant.com' },
    update: {},
    create: {
      email: 'manager@restaurant.com',
      password: hashedPasswordManager,
      name: 'Restaurant Manager',
      role: 'MANAGER',
    },
  })

  const waiter = await prisma.user.upsert({
    where: { email: 'waiter@restaurant.com' },
    update: {},
    create: {
      email: 'waiter@restaurant.com',
      password: hashedPasswordWaiter,
      name: 'Waiter User',
      role: 'WAITER',
    },
  })

  const chef = await prisma.user.upsert({
    where: { email: 'chef@restaurant.com' },
    update: {},
    create: {
      email: 'chef@restaurant.com',
      password: hashedPasswordChef,
      name: 'Head Chef',
      role: 'CHEF',
    },
  })

  const cashier = await prisma.user.upsert({
    where: { email: 'cashier@restaurant.com' },
    update: {},
    create: {
      email: 'cashier@restaurant.com',
      password: hashedPasswordCashier,
      name: 'Cashier User',
      role: 'CASHIER',
    },
  })

  console.log('Users created:', { admin, manager, waiter, chef, cashier })

  // Create restaurant menu categories
  const appetizers = await prisma.category.upsert({
    where: { name: 'Appetizers' },
    update: {},
    create: {
      name: 'Appetizers',
      description: 'Starters and snacks',
    },
  })

  const mainCourse = await prisma.category.upsert({
    where: { name: 'Main Course' },
    update: {},
    create: {
      name: 'Main Course',
      description: 'Main dishes and meals',
    },
  })

  const beverages = await prisma.category.upsert({
    where: { name: 'Beverages' },
    update: {},
    create: {
      name: 'Beverages',
      description: 'Drinks and refreshments',
    },
  })

  const desserts = await prisma.category.upsert({
    where: { name: 'Desserts' },
    update: {},
    create: {
      name: 'Desserts',
      description: 'Sweet treats and desserts',
    },
  })

  const breads = await prisma.category.upsert({
    where: { name: 'Breads' },
    update: {},
    create: {
      name: 'Breads',
      description: 'Fresh baked breads',
    },
  })

  console.log('Categories created:', { appetizers, mainCourse, beverages, desserts, breads })

  // Create restaurant menu items
  const products = await Promise.all([
    // Appetizers
    prisma.product.upsert({
      where: { sku: 'APP-001' },
      update: {},
      create: {
        name: 'Paneer Tikka',
        description: 'Grilled cottage cheese with spices',
        sku: 'APP-001',
        barcode: 'REST-1001',
        price: 250,
        costPrice: 100,
        stock: 50,
        minStock: 10,
        categoryId: appetizers.id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'APP-002' },
      update: {},
      create: {
        name: 'Chicken Wings',
        description: 'Crispy fried chicken wings',
        sku: 'APP-002',
        barcode: 'REST-1002',
        price: 300,
        costPrice: 120,
        stock: 40,
        minStock: 10,
        categoryId: appetizers.id,
      },
    }),
    // Main Course
    prisma.product.upsert({
      where: { sku: 'MAIN-001' },
      update: {},
      create: {
        name: 'Chicken Biryani',
        description: 'Aromatic basmati rice with tender chicken',
        sku: 'MAIN-001',
        barcode: 'REST-2001',
        price: 350,
        costPrice: 150,
        stock: 100,
        minStock: 20,
        categoryId: mainCourse.id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'MAIN-002' },
      update: {},
      create: {
        name: 'Butter Chicken',
        description: 'Creamy tomato curry with chicken',
        sku: 'MAIN-002',
        barcode: 'REST-2002',
        price: 320,
        costPrice: 140,
        stock: 80,
        minStock: 15,
        categoryId: mainCourse.id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'MAIN-003' },
      update: {},
      create: {
        name: 'Dal Tadka',
        description: 'Yellow lentils with spices',
        sku: 'MAIN-003',
        barcode: 'REST-2003',
        price: 180,
        costPrice: 70,
        stock: 90,
        minStock: 20,
        categoryId: mainCourse.id,
      },
    }),
    // Breads
    prisma.product.upsert({
      where: { sku: 'BREAD-001' },
      update: {},
      create: {
        name: 'Butter Naan',
        description: 'Soft flatbread with butter',
        sku: 'BREAD-001',
        barcode: 'REST-3001',
        price: 40,
        costPrice: 15,
        stock: 200,
        minStock: 50,
        categoryId: breads.id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'BREAD-002' },
      update: {},
      create: {
        name: 'Garlic Naan',
        description: 'Naan with garlic and herbs',
        sku: 'BREAD-002',
        barcode: 'REST-3002',
        price: 50,
        costPrice: 20,
        stock: 180,
        minStock: 40,
        categoryId: breads.id,
      },
    }),
    // Beverages
    prisma.product.upsert({
      where: { sku: 'BEV-001' },
      update: {},
      create: {
        name: 'Mango Lassi',
        description: 'Sweet mango yogurt drink',
        sku: 'BEV-001',
        barcode: 'REST-4001',
        price: 80,
        costPrice: 30,
        stock: 150,
        minStock: 30,
        categoryId: beverages.id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'BEV-002' },
      update: {},
      create: {
        name: 'Masala Chai',
        description: 'Spiced Indian tea',
        sku: 'BEV-002',
        barcode: 'REST-4002',
        price: 40,
        costPrice: 15,
        stock: 200,
        minStock: 40,
        categoryId: beverages.id,
      },
    }),
    // Desserts
    prisma.product.upsert({
      where: { sku: 'DES-001' },
      update: {},
      create: {
        name: 'Gulab Jamun',
        description: 'Sweet milk dumplings in syrup',
        sku: 'DES-001',
        barcode: 'REST-5001',
        price: 120,
        costPrice: 50,
        stock: 100,
        minStock: 20,
        categoryId: desserts.id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'DES-002' },
      update: {},
      create: {
        name: 'Kulfi',
        description: 'Traditional Indian ice cream',
        sku: 'DES-002',
        barcode: 'REST-5002',
        price: 100,
        costPrice: 40,
        stock: 80,
        minStock: 15,
        categoryId: desserts.id,
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

  // Create restaurant suppliers
  const supplier1 = await prisma.supplier.upsert({
    where: { email: 'supplier1@example.com' },
    update: {},
    create: {
      name: 'Fresh Vegetables Co.',
      email: 'supplier1@example.com',
      phone: '+91-9876543210',
      address: 'Market Road, Fresh Produce District',
      contactPerson: 'Rajesh Kumar',
    },
  })

  const supplier2 = await prisma.supplier.upsert({
    where: { email: 'supplier2@example.com' },
    update: {},
    create: {
      name: 'Quality Spices & Masala',
      email: 'supplier2@example.com',
      phone: '+91-9876543211',
      address: 'Spice Market, Old City',
      contactPerson: 'Priya Sharma',
    },
  })

  const supplier3 = await prisma.supplier.upsert({
    where: { email: 'supplier3@example.com' },
    update: {},
    create: {
      name: 'Daily Dairy Products',
      email: 'supplier3@example.com',
      phone: '+91-9876543212',
      address: 'Milk Colony, Farm Area',
      contactPerson: 'Amit Patel',
    },
  })

  console.log('Suppliers created:', { supplier1, supplier2, supplier3 })

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
