# AKAHL - Internal Quotation System

Internal web application for price quotation and fabric management for bespoke tailoring.

## Features

- **PIN Authentication**: Secure lock screen with touch-friendly numpad
- **Instant Quotations**: Real-time pricing based on fabric and garment type
- **Admin Panel**: Fabric catalog management and pricing multipliers
- **Responsive Design**: Optimized for iPad/Tablet and mobile devices
- **Touch-Friendly**: Large, tactile buttons for touch interface
- **AKAHL Brand Style**: Minimalist luxury aesthetic — black/white with elegant typography

## Design System

### Typography
- **Headings**: Marcellus (elegant serif)
- **Body**: Inter (clean sans-serif)
- **Alternative**: Old Standard TT (serif)

### Colors
- **Background**: Neutral 950 (#0a0a0a)
- **Cards**: Neutral 900 (#1c1917)
- **Text**: White / Neutral gradients
- **Accents**: Minimal white highlights

### Style
- Minimalist luxury aesthetic
- No emojis — professional SVG icons only
- Dark mode default
- Elegant spacing and typography

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

## Access Credentials (Demo)

| Role | PIN | Permissions |
|-----|-----|-------------|
| Associate | 1234 | Quotations |
| Administrator | 9999 | Quotations + Admin Panel |

## Workflow

1. **Enter PIN** — Unlock application
2. **Search Fabric** — Enter fabric code (e.g., TL-402)
3. **Select Options** — Manufacturing type and garment
4. **View Price** — Instant calculated price
5. **New Quotation** — Clear for next client

## Sample Fabric Codes

```
TL-402 — Italian Linen Navy Blue
TL-405 — Super 120S Wool Charcoal
TL-408 — Super 150S Wool Black
TL-420 — Silk Blend Champagne
TL-425 — Classic Tweed Wool
TL-440 — Natural Beige Linen
```

## Project Structure

```
src/
├── components/
│   ├── AdminPanel.jsx          # Administration interface
│   ├── FabricCard.jsx          # Fabric information card
│   ├── GarmentSelector.jsx     # Garment type selector
│   ├── Header.jsx              # Shared header
│   ├── ManufacturingSelector.jsx # Manufacturing type selector
│   ├── PinLockScreen.jsx       # PIN lock screen
│   ├── PriceDisplay.jsx        # Calculated price display
│   └── QuotationScreen.jsx     # Main quotation interface
├── services/
│   └── api.js                  # API services + mock data
├── App.jsx                     # Main component
├── main.jsx                    # Entry point
└── index.css                   # Global styles + Tailwind
```

## Backend Integration

The file `src/services/api.js` contains all API functions. To connect your backend:

1. Configure API URL in `.env`:
   ```
   VITE_API_URL=https://your-backend.com/api
   ```

2. Uncomment the `axios` calls in each function within `api.js`

### Required Endpoints

```
POST   /api/auth/verify-pin       # PIN authentication → JWT token
GET    /api/fabrics                # Get all fabrics
GET    /api/fabrics/code/:code     # Get fabric by code
PUT    /api/fabrics/:id            # Update fabric (admin)
PATCH  /api/fabrics/:id/availability # Toggle fabric availability (admin)
GET    /api/pricing/config          # Get pricing configuration
PUT    /api/pricing/multipliers    # Update pricing multipliers (admin)
```

### Shift System (Local)

The shift system works **locally without backend**:

- Shift starts when user logs in with PIN
- Elapsed time is displayed in the header (e.g., "45m", "2h 15m")
- Shift ends when user logs out
- No backend persistence needed - visual reference only

## Production Build

```bash
npm run build
npm run preview
```

## Tech Stack

- **React 18** — Hooks and functional components
- **Vite** — Build tool and dev server
- **Tailwind CSS** — Utility-first styling
- **Axios** — HTTP client (ready for backend)

## Brand Philosophy

> *Every thread counts.* — AKAHL Style

> *Your First Impression Should Be Unforgettable.* — AKAHL Experience
