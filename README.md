# 2FA Authenticator

A modern, secure, and feature-rich Two-Factor Authentication (2FA) web application built with Next.js, Hono, and Drizzle ORM. This application allows users to manage their Time-based One-Time Password (TOTP) codes with ease, offering a sleek interface and robust security features.

## 🚀 Features

-   **Secure Authentication**: User registration and login protected by **Google reCAPTCHA v2** and **JWT** (JSON Web Tokens).
-   **TOTP Management**:
    -   Generate and display real-time TOTP codes (compatible with Google Authenticator, Authy, etc.).
    -   Visual countdown timer for code expiration.
    -   **Add Accounts**:
        -   **Scan QR Code**: Integrated in-app QR code scanner.
        -   **Manual Entry**: Enter secret keys manually.
    -   **Edit Accounts**: Rename, add descriptions, and tag accounts for better organization.
    -   **Delete Accounts**: Secure deletion with a confirmation dialog to prevent accidental loss.
-   **Import & Export**:
    -   Backup your accounts to a JSON file.
    -   Restore accounts from a backup file.
-   **QR Code Sharing**: Generate QR codes for your stored accounts to easily transfer them to other devices.
-   **Modern UI/UX**:
    -   Built with **Shadcn UI** and **Tailwind CSS v4**.
    -   **Dark/Light Mode** support.
    -   Responsive design for mobile and desktop.
    -   Glassmorphism effects and smooth animations.
-   **Offline Support**: PWA-ready with service worker integration (via `@serwist/next`).

## 🛠️ Technology Stack

### Frontend
-   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
-   **Components**: [Shadcn UI](https://ui.shadcn.com/) (Radix UI based)
-   **State Management**: [TanStack Query](https://tanstack.com/query/latest) (React Query)
-   **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Utilities**: `otplib` (TOTP generation), `react-qr-code`, `@yudiel/react-qr-scanner`

### Backend
-   **API Framework**: [Hono](https://hono.dev/) (running on Next.js Edge/Serverless runtime)
-   **Database ORM**: [Drizzle ORM](https://orm.drizzle.team/)
-   **Database**: [Neon](https://neon.tech/) (Serverless PostgreSQL)
-   **Authentication**: JWT (JSON Web Tokens), Bcrypt (Password hashing)

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:
-   [Node.js](https://nodejs.org/) (v18 or higher recommended)
-   [Yarn](https://yarnpkg.com/) (or npm/pnpm)
-   A [Neon](https://neon.tech/) database account (or any PostgreSQL database)
-   A [Google reCAPTCHA v2](https://www.google.com/recaptcha/about/) (Checkbox) Site Key and Secret Key

## 📦 Installation & Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/jmrl23/2fa.git
    cd 2fa-authenticator
    ```

2.  **Install dependencies**:
    ```bash
    yarn install
    ```

3.  **Environment Configuration**:
    Create a `.env.local` file in the root directory and add the following variables:

    ```env
    # Database Connection (Neon/PostgreSQL)
    DATABASE_URL="postgres://user:password@host:port/dbname?sslmode=require"

    # Security
    JWT_SECRET="your-super-secret-jwt-key"

    # Google reCAPTCHA v2 Credentials
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY="your-recaptcha-site-key"
    RECAPTCHA_SECRET_KEY="your-recaptcha-secret-key"
    ```

4.  **Database Setup**:
    Push the schema to your database:
    ```bash
    npx drizzle-kit push
    ```

5.  **Run the Development Server**:
    ```bash
    yarn dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage Guide

### Registration & Login
-   Create a new account using the **Sign Up** page. You must complete the reCAPTCHA challenge.
-   Log in with your credentials.

### Adding an Authenticator
1.  Click the **"Add Account"** button on the dashboard.
2.  **Scan QR**: Click "Scan QR" to use your camera to scan a code from another service (e.g., Google, GitHub).
3.  **Manual**: Enter the "Name" (e.g., Google) and the "Secret Key" provided by the service.

### Managing Codes
-   **Copy Code**: Click the copy icon next to the code to copy it to your clipboard.
-   **Edit**: Click the edit icon (pencil) -> "Edit" to rename or tag the account.
-   **Delete**: Click the edit icon -> "Delete". Confirm the action in the dialog.
-   **Show QR**: Click the edit icon -> "Show QR Code" to display the QR code for that specific account.

### Import/Export
-   Use the **Import/Export** menu in the header to backup your data to a JSON file or restore from one.
-   **Warning**: Keep your export files secure as they contain your secret keys!

## 📂 Project Structure

```
src/
├── app/                 # Next.js App Router pages and API routes
│   ├── (auth)/          # Authentication pages (login, register)
│   ├── api/             # Hono API routes
│   └── page.tsx         # Main Dashboard
├── components/          # React components
│   ├── providers/       # Context providers (Auth, Query)
│   ├── ui/              # Shadcn UI components
│   └── ...              # Feature-specific components (Dialogs, Cards)
├── db/                  # Drizzle ORM schema and config
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and API client
└── schemas/             # Zod validation schemas
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

[MIT](LICENSE)
