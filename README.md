# Commute Planner

> **A sustainability-focused trip comparison web application.**
> Compare commutes across driving, subway, bus, commuter rail, bike-share, and walking with real-time Citibike availability, CO₂ emissions, out-of-pocket costs, and personal impact tracking over time.

---

## 🌟 Key Differentiators

- **Side-by-Side Comparison**: Time, cost, and CO₂ metrics displayed with comparative visual bars normalized across all options.
- **Savings vs. Driving**: Explicitly highlights dollars and kilograms of CO₂ avoided relative to driving a private passenger car.
- **Customizable Destination Parking**: Realistic $10 urban parking default, fully editable slider/input ($0–$100), and an instant **Free Parking ($0)** toggle for commuters with free parking spots.
- **Priority Presets**: Re-ranks commutes by `Balanced`, `Fastest`, `Cheapest`, and `Greenest` (ONLY the controls supported by the backend API).
- **Client-Side Re-sorting**: Interactive filter chips (*Best Match*, *Fastest*, *Cheapest*, *Greenest*) allow instant re-sorting of returned options without re-fetching.
- **Visible Assumptions & Transparent Methodology**: Explains generalized cost scoring (`composite_score`) breaking down out-of-pocket money, time valuation, and EPA carbon damage costs.
- **Personal Impact Tracker**: Tracks total trips, avoided carbon emissions, financial savings, and car kilometers avoided, accompanied by an accessible cumulative CO₂ savings timeline chart over time.
- **Live Bike-Share Availability**: Integrates real-time Citi Bike station feeds, displaying bikes, e-bikes, and dock availability with text and color labels (never color alone).
- **No Invented Route Geometry**: Conforms strictly to the API contract. Markers indicate origin, destination, and nearby bike stations with an approximate dashed guide line.

---

## 🛠 Tech Stack

- **Framework**: Vite + React 18 + TypeScript (strict mode)
- **Styling**: Tailwind CSS with dark/light mode, high-contrast accessible palettes, 44px minimum touch targets, and `prefers-reduced-motion` support
- **State & Data Fetching**: TanStack Query (v5) with auto-polling of `/health` every 60s
- **Maps**: Leaflet with OpenStreetMap tiles (lazy-loaded, attributed, custom text-labeled markers)
- **Charts**: Lightweight, accessible responsive SVG chart (zero external dependencies, screen-reader friendly)
- **Authentication**: Direct AWS Cognito REST API (`InitiateAuth`, `RespondToAuthChallenge`, `REFRESH_TOKEN_AUTH`) without AWS SDK bloat
- **Testing**:
  - Vitest + React Testing Library (formatting, sorting, auth, UI components)
  - Playwright + MSW (end-to-end flows: sign in, first-time password reset, planning, client-side re-sorting, saving, session expiry, stale data warning banner, and screenshot capture)
- **Target Hosting**: AWS S3 Static Website Hosting + CloudFront CDN

---

## 🔐 Authentication (Cognito Direct REST)

The app interacts with Amazon Cognito Identity Provider directly via REST endpoints (`https://cognito-idp.us-east-1.amazonaws.com/`):
- `USER_PASSWORD_AUTH`: Authenticates with `USERNAME` and `PASSWORD`.
- `NEW_PASSWORD_REQUIRED`: Handles first-time password resets for admin-created accounts via `RespondToAuthChallenge`.
- `REFRESH_TOKEN_AUTH`: Automatically refreshes tokens before expiration.
- **401 Session Expiry Handling**: Automatically intercepts 401 Unauthorized responses and opens a re-sign-in modal while **preserving all user inputs** (From, To, Parking Cost, Priority).
- **Security**: Tokens are stored strictly in memory (`sessionStorage` at most for the refresh token).
- **Sample Data / Demo Preview**: A clearly labeled **"Sample data"** mode is available for evaluators and automated tests who do not possess pre-provisioned Cognito credentials.

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd commute_planner

# Install dependencies
npm install
```

### Environment Configuration
Create a `.env` file in the root directory (or use `.env.example`):
```env
VITE_API_BASE=https://xemud1f2ug.execute-api.us-east-1.amazonaws.com
VITE_COGNITO_CLIENT_ID=7rmn2pkug1vg81gkaf0bp1r03l
VITE_AWS_REGION=us-east-1
```
> *Note: Must be run over HTTP/HTTPS (e.g. `localhost`). Local `file://` execution is blocked by browser CORS.*

### Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🧪 Testing

### Run Unit & RTL Component Tests
```bash
npm run test:run
```
Executes all 29 unit and component tests verifying formatters, client-side sorting, component states, and accessibility attributes.

### Run End-to-End Tests
```bash
npm run test:e2e
```
Executes Playwright tests using mocked network responses covering:
1. Stale feed warning banner on `/health` stale or 503
2. First-time password change challenge (`NEW_PASSWORD_REQUIRED`)
3. Trip planning, headline assertions, client-side re-sorting chips, and trip saving
4. 401 session expiry re-auth modal preserving user inputs
5. My Impact metrics, cumulative chart, and recent trips
6. How It Works methodology screen

### Capture Screen Screenshots
```bash
npm run capture:screenshots
```
Generates full-page screenshots of all 7 screens at both Desktop (1280x800) and Mobile (390x844) viewports in the `screenshots/` directory.

---

## 🏗 Build & Deploy to AWS S3 + CloudFront

### 1. Build Static Production Assets
```bash
npm run build
```
Compiled production files are output to `dist/`.

### 2. S3 Bucket Creation & Configuration
```bash
# Create an S3 bucket
aws s3 mb s3://my-commute-planner-bucket --region us-east-1

# Configure S3 for static website hosting
aws s3 website s3://my-commute-planner-bucket/ --index-document index.html --error-document index.html
```

### 3. Upload Files to S3
```bash
# Sync files with optimized cache headers
# Cache immutable hashed assets for 1 year
aws s3 sync dist/ s3://my-commute-planner-bucket/ \
  --exclude "index.html" \
  --cache-control "public, max-age=31536000, immutable"

# Upload index.html without caching to ensure updates are immediate
aws s3 cp dist/index.html s3://my-commute-planner-bucket/index.html \
  --cache-control "no-cache, no-store, must-revalidate"
```

### 4. CloudFront CDN Setup (Recommended)
1. Create a CloudFront distribution pointing to the S3 bucket.
2. In **Custom Error Responses**, configure HTTP 403 and 404 to return `/index.html` with HTTP 200 to enable SPA URL routing.
3. Enable HTTPS redirection.

---

## 📊 Methodology & Sources

- **Carbon Emissions**: Based on **US Environmental Protection Agency (EPA)** national passenger car emission factors (~400 grams CO₂ per mile or ~250 grams per kilometer for standard passenger gasoline vehicles). Zero emissions attributed to walking and manual bicycles; electrical grid intensity factors applied to subways, buses, and e-bikes.
- **Economic Valuations**: Composite score calculates generalized cost = `Money Cost + (Time × Standard Wage Rate) + (CO₂ × Social Cost of Carbon)`.
- **Live Bike-Share Feeds**: Real-time GBFS feeds covering NYC Citi Bike stations. Stale feeds trigger a persistent top notification banner.
- **Pilot Scope**: NYC metropolitan transit corridors. Turn-by-turn route geometries are not fabricated; dashed lines indicate approximate straight-line corridors.

---

## ♿ Accessibility (WCAG 2.2 AA)

- 44px minimum touch targets across all interactive buttons, inputs, and toggles.
- High-contrast color pairings meeting or exceeding 4.5:1 for normal text and 3:1 for large text / UI borders.
- Visible focus rings (`focus-visible:ring-2 focus-visible:ring-primary-500`).
- Color-blind safe indicators: all statuses, badges, and bike stations use text labels and icons in addition to color.
- Screen reader announcements using `aria-live="polite"` for route results and `aria-live="assertive"` for errors.
- Respects `prefers-reduced-motion` to disable transitions and animations.
