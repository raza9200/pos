# POS System - Point of Sale Application

A full-featured Point of Sale (POS) system built with Next.js 14+, TypeScript, Prisma ORM, and PostgreSQL. This system includes inventory management, sales tracking, customer management, reporting, and role-based access control.

## Features

### Core Features
- ✅ **POS Sale Screen** - Product search by name/SKU/barcode, shopping cart, payment processing
- ✅ **Inventory Management** - Auto-update stock levels after sales, low stock alerts
- ✅ **Product Management** - CRUD operations, categories, barcode support
- ✅ **Customer Management** - Customer profiles, loyalty points
- ✅ **Sales Tracking** - Invoice generation, sales history
- ✅ **Expense Tracking** - Record and categorize business expenses
- ✅ **Reporting & Analytics**
  - Sales reports (daily, weekly, monthly)
  - Inventory reports (stock levels, low stock)
  - Profit/loss analysis
- ✅ **Role-Based Access Control**
  - Admin: Full system access
  - Manager: Product & report management
  - Cashier: POS operations only
- ✅ **Authentication** - Secure login with NextAuth.js

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **Validation**: Zod
- **Forms**: React Hook Form

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

## Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd pos
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/pos_db?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-change-this"
NEXTAUTH_URL="http://localhost:3000"
```

**Important**: Replace the database credentials with your PostgreSQL details.

### 4. Set up the database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed the database with sample data
npm run db:seed
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Default Login Credentials

After seeding, you can log in with:

- **Admin**: 
  - Email: `admin@pos.com`
  - Password: `admin123`

- **Manager**: 
  - Email: `manager@pos.com`
  - Password: `manager123`

- **Cashier**: 
  - Email: `cashier@pos.com`
  - Password: `cashier123`

## Database Setup (Detailed)

### Option 1: Local PostgreSQL

1. Install PostgreSQL on your system
2. Create a database:
```sql
CREATE DATABASE pos_db;
```
3. Update `.env` with your credentials

### Option 2: Docker PostgreSQL

```bash
docker run --name pos-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=pos_db \
  -p 5432:5432 \
  -d postgres:14
```

Update `.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/pos_db?schema=public"
```

### Option 3: Cloud Database (Recommended for Production)

Use services like:
- [Supabase](https://supabase.com) (Free tier available)
- [Neon](https://neon.tech) (Free tier available)
- [Railway](https://railway.app)

Update `.env` with the connection string provided by your service.

## Project Structure

```
pos/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts            # Seed data
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── auth/      # Authentication
│   │   │   ├── products/  # Product CRUD
│   │   │   ├── categories/
│   │   │   ├── customers/
│   │   │   ├── sales/
│   │   │   ├── expenses/
│   │   │   └── reports/   # Analytics & reports
│   │   ├── products/      # Product management page
│   │   ├── login/         # Login page
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # POS screen (home)
│   ├── components/
│   │   ├── Navigation.tsx
│   │   ├── POSScreen.tsx
│   │   └── ProductsManagement.tsx
│   ├── lib/
│   │   ├── prisma.ts      # Prisma client
│   │   └── auth-utils.ts  # Auth helpers
│   ├── types/
│   │   └── next-auth.d.ts # TypeScript definitions
│   ├── auth.ts            # NextAuth configuration
│   └── middleware.ts      # Auth middleware
├── .env                   # Environment variables
├── package.json
├── tsconfig.json
└── ARCHITECTURE.md        # System architecture docs
```

## Available Scripts

```bash
# Development
npm run dev              # Start development server

# Database
npm run db:generate      # Generate Prisma Client
npm run db:push          # Push schema to database
npm run db:seed          # Seed database with sample data
npm run db:studio        # Open Prisma Studio (DB GUI)

# Production
npm run build            # Build for production
npm run start            # Start production server

# Linting
npm run lint             # Run ESLint
```

## User Roles & Permissions

### Admin
- Full system access
- User management
- All product, sales, and report operations
- System configuration

### Manager
- Product management (create, edit, delete)
- Inventory management
- Customer & supplier management
- View all reports
- View all sales
- Expense tracking
- Cannot manage users

### Cashier
- Access POS screen
- Process sales
- Search products
- View own sales history
- Cannot modify prices or inventory
- Cannot access reports or management screens

## API Endpoints

### Products
- `GET /api/products` - Get all products (with search)
- `POST /api/products` - Create product (Admin/Manager)
- `GET /api/products/:id` - Get single product
- `PUT /api/products/:id` - Update product (Admin/Manager)
- `DELETE /api/products/:id` - Soft delete product (Admin/Manager)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (Admin/Manager)

### Sales
- `GET /api/sales` - Get sales history
- `POST /api/sales` - Create new sale

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create customer (Admin/Manager)

### Expenses
- `GET /api/expenses` - Get expenses (Admin/Manager)
- `POST /api/expenses` - Create expense (Admin/Manager)

### Reports
- `GET /api/reports/sales` - Sales analytics
- `GET /api/reports/inventory` - Inventory status
- `GET /api/reports/profit` - Profit/loss analysis

## Database Schema

### Key Tables
- **users** - System users with roles
- **products** - Product catalog
- **categories** - Product categories
- **customers** - Customer database
- **suppliers** - Supplier information
- **sales** - Sale transactions
- **sale_items** - Individual items in sales
- **expenses** - Business expenses

See `prisma/schema.prisma` for complete schema.

## Features Roadmap

### Completed ✅
- Authentication & authorization
- POS sale screen
- Product management
- Inventory tracking
- Sales recording
- Customer management
- Reports (sales, inventory, profit)
- Expense tracking

### Future Enhancements 🚀
- Invoice PDF generation & printing
- Advanced analytics dashboard
- Barcode scanner integration
- Receipt printer support
- Multi-location support
- Purchase order management
- Employee shift management
- Customer SMS/Email notifications
- Refunds & returns handling
- Advanced reporting with charts

## Development Tips

### Running Prisma Studio
View and edit database records visually:
```bash
npm run db:studio
```

### Reset Database
```bash
npx prisma db push --force-reset
npm run db:seed
```

### Database Migrations (Production)
```bash
npx prisma migrate dev --name init
npx prisma migrate deploy
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (your production URL)
4. Deploy

### Other Platforms
Works with any platform supporting Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

## Security Considerations

- ✅ All routes protected by authentication middleware
- ✅ Role-based access control on API routes
- ✅ Password hashing with bcrypt
- ✅ SQL injection prevention (Prisma)
- ✅ Input validation with Zod
- ⚠️ **Important**: Change `NEXTAUTH_SECRET` in production
- ⚠️ Use HTTPS in production
- ⚠️ Implement rate limiting for production

## Troubleshooting

### Database Connection Error
- Check PostgreSQL is running
- Verify `DATABASE_URL` in `.env`
- Ensure database exists

### Authentication Not Working
- Clear browser cookies
- Check `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches your URL

### Prisma Client Error
```bash
npm run db:generate
```

## Support & Documentation

- See `ARCHITECTURE.md` for system architecture
- Check Prisma schema: `prisma/schema.prisma`
- Review API routes: `src/app/api/`

## License

MIT

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Built with ❤️ using Next.js, TypeScript, and Prisma**
