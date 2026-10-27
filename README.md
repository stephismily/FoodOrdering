# Simple Food Ordering System (MERN)

A beginner-friendly food menu and order-management application built with React + Vite, Express, Node.js, and MongoDB Atlas.

## Features
- View, search, and filter food items.
- Add items to a cart and submit a customer order.
- Admin menu CRUD: add, edit, and delete foods.
- Admin order dashboard: view orders and update their status.
- MongoDB persistence and sample-data seed script.
- Basic admin login using an environment-configured password.
- Ready for GitHub, Vercel (frontend), and Render (backend).

> This is a simple student project, not a production-ready commerce system. Before public use, add robust customer identity/order lookup, rate limiting, monitoring, and a stronger admin user-management flow.

## Requirements
- Node.js 20 or newer
- npm
- MongoDB Atlas database (or local MongoDB)

## 1. Configure the backend
In a terminal:
```powershell
cd server
Copy-Item .env.example .env
npm install
```
Edit `server/.env`:
- `MONGODB_URI`: your MongoDB connection string
- `ADMIN_PASSWORD`: choose a strong password
- `JWT_SECRET`: replace with a long random secret
- `CLIENT_URL`: for local development use `http://localhost:5173`

Example:
```env
PORT=5000
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@YOUR_CLUSTER/food_ordering?retryWrites=true&w=majority
JWT_SECRET=replace-with-a-long-random-secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-this-password
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```
Do not commit `.env` or share its contents.

## 2. Configure the frontend
Open a second terminal:
```powershell
cd client
Copy-Item .env.example .env
npm install
```
Local `client/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## 3. Start the app locally
Terminal 1:
```powershell
cd server
npm run dev
```
Terminal 2:
```powershell
cd client
npm run dev
```
Open the URL printed by Vite (normally http://localhost:5173). Backend health check: http://localhost:5000/api/health

## 4. Add sample foods
With the backend `.env` configured, run:
```powershell
cd server
npm run seed
```
The seed script only inserts sample records if the collection is empty.

## 5. Admin
Click **Admin** in the navigation. The default email is `admin@example.com`; use the password configured as `ADMIN_PASSWORD` in `server/.env`. Change the password before deployment.

## 6. API endpoints
- `GET /api/foods`
- `GET /api/foods/:id`
- `POST /api/foods` (admin)
- `PUT /api/foods/:id` (admin)
- `DELETE /api/foods/:id` (admin)
- `POST /api/orders`
- `GET /api/orders` (admin)
- `PATCH /api/orders/:id/status` (admin)
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

## 7. Deploy with GitHub integration

### GitHub
Create an empty GitHub repository, then from the project root:
```powershell
git init
git add .
git commit -m "Initial food ordering app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```
Never commit `.env` files.

### MongoDB Atlas
1. Create a free/appropriate cluster and database user.
2. Copy the connection string and replace the username, password, and database name.
3. Configure Atlas Network Access for Render. For a quick student demo, Atlas may allow `0.0.0.0/0`; use strong credentials and understand this allows connection attempts from any IP. Prefer restricting access when feasible.

### Render backend
1. Create a **Web Service** and connect your GitHub repository.
2. Set **Root Directory** to `server`.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables: `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CLIENT_URL`, and `NODE_ENV=production`.
6. `CLIENT_URL` must be your deployed Vercel origin, for example `https://your-app.vercel.app` (no trailing slash).
7. After deployment, verify `https://YOUR-RENDER-SERVICE.onrender.com/api/health`.

### Vercel frontend
1. Import the same GitHub repository into Vercel.
2. Set **Root Directory** to `client`.
3. Framework preset: Vite; build command: `npm run build`; output directory: `dist`.
4. Add `VITE_API_BASE_URL=https://YOUR-RENDER-SERVICE.onrender.com/api`.
5. Deploy. Update Render's `CLIENT_URL` with the exact Vercel origin, then redeploy/restart the backend if needed.

Vercel's `vercel.json` handles client-side route fallback. After changing a Vite environment variable, trigger a new frontend deployment.

## Notes
- This starter uses one configured admin email/password from server environment variables. No admin credentials are shipped in the source.
- Admin login uses a signed JWT in an HTTP-only cookie. Cross-origin production cookies use `SameSite=None; Secure`; the frontend sends credentials with API requests.
- Customer checkout collects contact and delivery details. The demo intentionally does not provide a public order-history endpoint, to avoid exposing other customers' personal data.
- Order totals are calculated on the server using current database prices.
