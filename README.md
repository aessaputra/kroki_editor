# Kroki Diagram Editor

A local Next.js editor for creating and previewing Kroki diagrams. Guests can edit and preview diagrams in memory; signed-in users can manually save, list, load, rename, and delete diagrams through Convex-backed storage.

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy the example environment file and fill the local Convex values:

```bash
cp .env.local.example .env.local
```

3. Start Convex and the Next.js app in separate terminals:

```bash
npx convex dev
npm run dev
```

Open [http://localhost:43017](http://localhost:43017) to use the editor locally.

## Development over Tailscale

Use Tailscale when you want to open the local development app from another device in the same tailnet.

### Access through the Tailscale IP

The default `npm run dev` command runs the Next.js dev server on the unique port `43017` and binds it to `0.0.0.0`, so it listens on localhost, LAN, and the Tailscale interface.

1. Make sure this machine is connected to Tailscale:

```bash
sudo tailscale up
```

2. Start Convex and Next.js in separate terminals:

```bash
npx convex dev
npm run dev
```

3. Get this machine's Tailscale IP:

```bash
tailscale ip -4
```

Open `http://<tailscale-ip>:43017` from another tailnet device.

Because `npm run dev` binds to `0.0.0.0`, port `43017` is also reachable from the local network interface if your firewall allows it. If authentication callbacks or site URLs depend on the browser origin, update the relevant local environment values in `.env.local` to match the Tailscale IP URL you are using.

## Environment variables

See `.env.local.example` for the local variables used by the app and E2E tests:

- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_CONVEX_SITE_URL`
- `CONVEX_SITE_URL`
- `CONVEX_DEPLOYMENT`
- `E2E_TEST_EMAIL`
- `E2E_TEST_PASSWORD`

## Verification

Run the main checks before handing off changes:

```bash
npm run type-check
npm run lint
npm run test
npm run build
```
