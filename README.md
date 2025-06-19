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

### Installation

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
│   ├── components/      # React components
│   ├── lib/            # Utilities and configurations
│   ├── globals.css     # Global styles
│   └── page.tsx        # Main dashboard page
├── database/           # SQL schemas
├── public/             # Static assets
└── package.json        # Dependencies
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository.