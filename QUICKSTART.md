# Quick Start Guide - POS System

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Database

#### Using Docker (Easiest)
```bash
# Start PostgreSQL container
docker run --name pos-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=pos_db \
  -p 5432:5432 \
  -d postgres:14
```

#### Using Local PostgreSQL
```sql
CREATE DATABASE pos_db;
```

### Step 3: Configure Environment

The `.env` file is already created with default settings. If using local PostgreSQL, update:

```env
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/pos_db?schema=public"
```

### Step 4: Initialize Database
```bash
# Generate Prisma Client
npm run db:generate

# Create database tables
npm run db:push

# Add sample data (3 users, 5 products, 2 customers, 2 suppliers)
npm run db:seed
```

### Step 5: Start Development Server
```bash
npm run dev
```

### Step 6: Login

Open http://localhost:3000 and login with:

**Admin Account:**
- Email: `admin@pos.com`
- Password: `admin123`

## 🎯 What You Can Do Now

### As Admin:
1. **POS Screen** (/) - Process sales
2. **Products** (/products) - Manage inventory
3. **Categories** (/categories) - Organize products
4. **Customers** (/customers) - Customer database
5. **Sales** (/sales) - View transaction history
6. **Expenses** (/expenses) - Track expenses
7. **Reports** (/reports) - Analytics & insights

### Test the POS:
1. Go to home page (/)
2. Search for a product
3. Click on products to add to cart
4. Adjust quantities
5. Select payment method
6. Click "Complete Sale"

## 📊 Sample Data Included

After seeding, you'll have:
- **Users**: 3 (Admin, Manager, Cashier)
- **Categories**: 3 (Electronics, Groceries, Clothing)
- **Products**: 5 sample products with stock
- **Customers**: 2 with loyalty points
- **Suppliers**: 2 vendor profiles

## 🔧 Common Commands

```bash
# View database in GUI
npm run db:studio

# Reset everything
npx prisma db push --force-reset
npm run db:seed

# Check for errors
npm run lint

# Build for production
npm run build
```

## ❓ Troubleshooting

### Port 3000 already in use
```bash
# Use different port
PORT=3001 npm run dev
```

### Database connection failed
1. Check PostgreSQL is running: `docker ps` or `sudo systemctl status postgresql`
2. Verify DATABASE_URL in `.env`
3. Test connection: `psql -h localhost -U postgres -d pos_db`

### Prisma Client not generated
```bash
npm run db:generate
```

## 🎓 Next Steps

1. Read `ARCHITECTURE.md` for system overview
2. Explore `prisma/schema.prisma` for database structure
3. Check `src/app/api/` for API endpoints
4. Customize for your business needs

## 📞 Need Help?

- Check the main README.md for detailed documentation
- Review API endpoints in the docs
- Open an issue on GitHub

---

**You're all set! Start selling! 🎉**
