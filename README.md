# KinyarwandaLearn

A Kinyarwanda learning app with email/password accounts, a Polygon Amoy registration receipt, admin lesson/quiz management, and step-by-step quizzes.

## What goes on-chain

The app writes only the user's public wallet address and a random registration hash to Polygon Amoy. Names, email addresses, and password hashes stay in MySQL. Do not put personal information or credentials on a public blockchain: chain data is permanent and publicly readable. Amoy is a test network; test POL can be obtained from a faucet, but is not real money.

## Requirements

- Node.js 22+
- MySQL 8+ or a compatible managed MySQL service
- MetaMask or another injected EVM wallet for signup
- Polygon Amoy test POL for registration transactions

## Local setup

### 1. Create the database

Create a MySQL database and run [`database/schema.sql`](./database/schema.sql). Copy the backend environment file:

```powershell
cd backend
Copy-Item .env.example .env
```

Set `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and a unique `JWT_SECRET` in `backend/.env`. `DB_SSL=true` is recommended for managed database providers.

For databases created with the earlier starter schema, first add the registration columns:

```sql
ALTER TABLE users
  ADD COLUMN wallet_address VARCHAR(42) NULL,
  ADD COLUMN registration_hash CHAR(66) NULL,
  ADD COLUMN registration_tx_hash CHAR(66) NULL,
  ADD UNIQUE KEY users_wallet_address_unique (wallet_address),
  ADD UNIQUE KEY users_registration_hash_unique (registration_hash),
  ADD UNIQUE KEY users_registration_tx_hash_unique (registration_tx_hash);
```

Existing accounts can still sign in after this migration, but new signups need a Polygon registration receipt.

### Login and registration troubleshooting

- **Registration reports that no wallet was detected:** install MetaMask in the same browser and make sure it is unlocked. New accounts also require the deployed Polygon Amoy contract and test POL for the registration transaction.
- **Registration says the account service is not ready:** verify the backend health endpoint reports `database: "connected"` and `blockchain: "configured"` before retrying. The form checks service readiness before asking the wallet to submit a transaction.
- **Login reports that the account database is not connected:** configure the backend database variables and run the SQL schema. Signing in does not require a wallet, but it does require a reachable API and MySQL database.
- **The account server cannot be reached:** start the backend and confirm `VITE_API_URL` points to its `/api` endpoint, or `VITE_API_HOST` is set for a Render deployment.

### 2. Deploy the registration contract to Polygon Amoy

1. Add Polygon Amoy (chain ID `80002`) to your wallet and get test POL from an Amoy faucet.
2. Open [Remix](https://remix.ethereum.org), create a Solidity file, and paste [`contracts/RegistrationRegistry.sol`](./contracts/RegistrationRegistry.sol).
3. Compile with Solidity `0.8.24` or newer, select **Injected Provider - MetaMask**, confirm that MetaMask is on Amoy, and deploy `RegistrationRegistry`.
4. Copy the deployed contract address. Never enter a wallet seed phrase or private key into this project.

### 3. Start the API

Set `REGISTRATION_CONTRACT_ADDRESS` in `backend/.env` to the deployed address, then run:

```powershell
npm install
npm run dev
```

The API health check is http://localhost:5000/api/health.

### 4. Start the frontend

In another terminal:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Set `VITE_REGISTRATION_CONTRACT_ADDRESS` in `frontend/.env` to the same deployed contract address. Open the Vite URL (usually http://localhost:5173). Signup connects the wallet, requests a registration transaction, and only then creates the private account in MySQL.

### 5. Enable an administrator

Create a normal account, then grant it admin access from a trusted MySQL console:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-admin-email@example.com';
```

Sign out and back in so the app refreshes the account role. Admins can view user accounts and create/delete lessons and quiz questions.

## Deployment

The frontend is published to [GitHub Pages](https://kalimishimwe1-lgtm.github.io/Kinyarwanda_Learn/) whenever `main` is updated. GitHub Pages hosts only the frontend; account and other API-backed features need a running backend. To connect an external API, add a `VITE_API_URL` repository variable with its `/api` URL. For a full-stack deployment, use the Render Blueprint below.

Deploy both services to Render using the included [`render.yaml`](./render.yaml) Blueprint. It defines the API and frontend static site, configures the SPA rewrite, and supplies the API host to the frontend build. During Blueprint setup, provide the database connection values, the deployed Polygon Amoy contract address, and `VITE_CONTACT_EMAIL` (optional). Render generates `JWT_SECRET`; do not commit `.env` files or secrets.

After the first Render deployment, set the API's `CLIENT_URL` to the generated frontend origin (for example, `https://kinyarwanda-learn-web.onrender.com`) and redeploy the API. Apply the SQL schema/migration to a managed MySQL service and use its TLS connection settings before enabling account registration. Set the same contract address for the API and frontend. For a manually configured frontend deployment, use the included [`frontend/vercel.json`](./frontend/vercel.json) or [`frontend/netlify.toml`](./frontend/netlify.toml) for SPA routing and set:

- `VITE_API_URL=https://<your-render-service>.onrender.com/api`
- `VITE_REGISTRATION_CONTRACT_ADDRESS=<deployed-amoy-contract-address>`
- `VITE_POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology`
- `VITE_CONTACT_EMAIL=<public-support-email>` (optional)

Test registration, sign-in, admin actions, forum posting, and a complete quiz on Amoy before sharing the app. Do not use a testnet contract for real funds or production identity without a security and privacy review.

Test registration, sign-in, admin actions, and a complete quiz on Amoy before sharing the app. Do not use a testnet contract for real funds or production identity without a security and privacy review.

## Pages

Home, Learn, Lessons, Quizzes, Progress, Dictionary, Translation, Tutors, Forum, Resources, Pricing, Contact, Login, Register, and Admin Dashboard.
