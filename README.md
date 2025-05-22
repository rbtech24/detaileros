# DetailerOps - Auto Detailing Business Management System

DetailerOps is a comprehensive business management system designed for auto detailing businesses. It provides functionality for managing customers, vehicles, scheduling jobs, invoicing, payments, and generating reports.

## Features

- **Customer Management**: Track customer information, history, and vehicles
- **Job Scheduling**: Calendar-based scheduling with day/week/month views
- **Invoicing & Payments**: Generate invoices and record payments
- **Service Management**: Configure your service offerings
- **Inventory Tracking**: Monitor inventory levels and technician usage
- **Customer Subscriptions**: Manage membership plans and recurring revenue
- **Reporting & Analytics**: Get insights into your business performance
- **Employee Management**: Track technician schedules and performance
- **Legal Waivers**: Manage customer waivers and documentation
- **AI Assistant**: AI-powered features to enhance productivity

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based auth with Passport
- **State Management**: React Query
- **Integrations**: OpenAI API, Stripe for payments

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- OpenAI API key (for AI features)
- Stripe API keys (for payment processing)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/detailerops.git
   cd detailerops
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/detailerops
   OPENAI_API_KEY=your_openai_api_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
   ```

4. Set up the database
   ```bash
   npm run db:push
   ```

5. Start the development server
   ```bash
   npm run dev
   ```

## Deployment

For deployment to Netlify:

1. Push your code to GitHub
2. Create a new site in Netlify linked to your GitHub repository
3. Configure environment variables in Netlify settings
4. Deploy with the build command: `npm run build`

## License

This project is licensed under the MIT License - see the LICENSE file for details.