# CRM Pro Plus

A modern Customer Relationship Management (CRM) system built with Next.js 14, TypeScript, and Supabase.

## Features

- 📊 **Revenue Tracking**: Visual charts showing monthly revenue trends
- 💰 **Expense Management**: Track and categorize business expenses
- 👥 **Client Management**: Manage client information and relationships
- ✅ **Task Tracking**: Keep track of pending tasks and projects
- 📈 **Financial Analytics**: Real-time profit calculations and margin analysis
- 🎨 **Modern UI**: Built with Tailwind CSS and shadcn/ui components

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, React 18
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS, shadcn/ui
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### Quick Start (Recommended)

For the fastest setup, use the master fix script:

```bash
git clone https://github.com/Arnarsson/crm-pro-plus.git
cd crm-pro-plus
chmod +x MASTER_FIX.sh
./MASTER_FIX.sh
```

This will automatically:
- Set up environment variables
- Install dependencies
- Fix common configuration issues
- Create health check endpoints

### Manual Installation

1. Clone the repository:
```bash
git clone https://github.com/Arnarsson/crm-pro-plus.git
cd crm-pro-plus
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up the database:

Run the SQL script in `database/schema.sql` in your Supabase SQL editor to create all necessary tables.

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Troubleshooting

### Common Issues

#### 1. "Invalid URL" Error
This means your Supabase environment variables are not set correctly.

**Solution**: Run the master fix script:
```bash
chmod +x MASTER_FIX.sh
./MASTER_FIX.sh
```

#### 2. Port Already in Use
If port 3000 is already taken:
```bash
npm run dev -- --port 3001
```

#### 3. Module Not Found Errors
Clear caches and reinstall dependencies:
```bash
rm -rf .next node_modules package-lock.json
npm install --legacy-peer-deps
npm run dev
```

#### 4. Database Connection Issues
1. Check your Supabase credentials in `.env.local`
2. Ensure the database tables are created (run `database/schema.sql`)
3. Test the connection: http://localhost:3000/api/health

### Available Fix Scripts

- `MASTER_FIX.sh` - Comprehensive fix for all common issues
- `FIX_COMPLETE.sh` - Complete environment setup
- `QUICK_FIX.sh` - Quick dependency fixes
- `fix-env-issue.sh` - Environment variable fixes

## Database Schema

The application uses the following tables:

- **revenue_entries**: Monthly revenue tracking
- **expenses**: Business expense records
- **clients**: Client information
- **invoices**: Invoice management
- **tasks**: Task and project tracking

## Project Structure

```
crm-pro-plus/
├── app/
│   ├── (dashboard)/     # Dashboard routes
│   ├── api/            # API routes
│   ├── auth/           # Authentication
│   ├── components/     # React components
│   ├── lib/            # Utilities and configurations
│   ├── globals.css     # Global styles
│   └── page.tsx        # Main page
├── database/           # SQL schemas
├── public/             # Static assets
├── components/         # Shared components
├── lib/               # Shared utilities
└── package.json       # Dependencies
```

## Health Check

Once running, verify your setup:
- Main app: http://localhost:3000
- Health check: http://localhost:3000/api/health
- Test page: http://localhost:3000/test

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository.

## Quick Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Run linting
npm run lint

# Run master fix (if issues arise)
./MASTER_FIX.sh
```
