# Property Management System

A comprehensive property management application built with Next.js 13, TypeScript, Prisma, and Tailwind CSS.

## Features

- **User Authentication**: Secure login system with role-based access control
- **Dashboard**: Overview with statistics for properties, units, tenants, leases, payments, and maintenance requests
- **Property Management**: Add, view, and manage properties
- **Tenant Management**: Add, view, and manage tenant information
- **Lease Management**: Create and manage lease agreements
- **Payment Tracking**: Monitor rent payments and payment status
- **Maintenance Requests**: Track and manage maintenance requests
- **Role-Based Access**: Different access levels for Admin, Employee, and Tenant roles

## Tech Stack

- **Frontend**: Next.js 13 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (development)
- **Authentication**: NextAuth.js
- **UI Components**: Heroicons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/exemic8973/property_management.git
cd property_management
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Set up the database:
```bash
npx prisma migrate dev
npx prisma generate
```

5. Seed the database:
```bash
npm run dev
# Then visit http://localhost:3000/test to seed the database
```

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Default Login Credentials

After seeding the database, you can use these credentials:

- **Admin**: admin@property.com / admin123
- **Tenant**: john.doe@email.com / tenant123

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── properties/        # Property management
│   ├── tenants/           # Tenant management
│   ├── leases/            # Lease management
│   ├── payments/          # Payment tracking
│   ├── maintenance/       # Maintenance requests
│   └── login/             # Login page
├── components/
│   └── layout/            # Layout components
├── lib/                   # Utility functions
│   ├── auth.ts           # Authentication configuration
│   └── db.ts             # Database connection
└── types/                 # TypeScript type definitions
```

## User Roles

### Admin
- Full access to all features
- Can add/edit properties, tenants, leases
- Can manage all aspects of the system

### Employee  
- Limited access to assigned properties
- Can view and manage properties they're assigned to
- Can create leases and maintenance requests

### Tenant
- Can view their own leases and payments
- Can submit maintenance requests
- Limited to their own data

## Database Schema

The application uses Prisma with the following main models:
- User (with role-based access)
- Property
- Unit  
- Lease
- Payment
- MaintenanceRequest

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database Operations

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# View database
npx prisma studio
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Commit your changes
5. Push to the branch
6. Create a Pull Request

## License

This project is licensed under the MIT License.
