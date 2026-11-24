# n8n-nodes-pandapi

The **Pandapi** node for [n8n](https://n8n.io): 18 data tools in one node, each with plain form fields (no JSON input to write).

| Operation | What it does | Price |
|---|---|---|
| Convert web pages to Markdown | Pages, a sitemap or a whole docs site to clean, LLM-ready Markdown, optional RAG chunks | $1 per 1,000 pages |
| Extract text, Markdown and tables from PDFs | PDF URLs to Markdown/text, tables as rows and a ready Excel file, OCR for scans | $3 per 1,000 PDFs |
| Find contact details on websites | Business emails, phones and social links from company websites | $5 per 1,000 sites with contacts |
| Take website screenshots | Full-page or viewport, desktop to mobile, PNG, JPEG or PDF | $4 per 1,000 screenshots |
| Check a website for broken links | 404s, dead links, timeouts and redirects | $0.80 per 1,000 links |
| Search public tenders and contracts | SAM.gov, TED (EU), UK, CanadaBuys and World Bank notices in one format | $2 per 1,000 notices |
| Get App Store reviews | iOS reviews, ratings, app details, search and top charts | $0.15 per 1,000 reviews |
| Get Google Play reviews | Android reviews with developer replies, ratings, search and charts | $0.10 per 1,000 reviews |
| Get Shopify App Store reviews | Shopify app reviews with developer replies, pricing plans and app details, plus free suspicious-review signals | $0.10 per 1,000 reviews |
| Look up postal codes and distances | ZIP/postal codes in 124 countries: place, coordinates, distance, radius | $0.30 per 1,000 results |
| Convert HTML or web pages to PDF | URLs, HTML or a template plus JSON rows (invoices, certificates) | $3 per 1,000 PDFs |
| Search Hacker News | Stories, comments, Show HN, jobs and the front page with filters | $0.20 per 1,000 items |
| Filter profanity in texts | Find and mask swear words in 26 languages (catches sh1t, no Scunthorpe false alarms) | $0.20 per 1,000 texts |
| Get open jobs from company career sites | Every open job at the companies you name (Greenhouse, Lever, Ashby and 8 more), new and closed jobs tracked, free hiring summary | $1 per 1,000 jobs |
| Get store products and prices | Every product, price, variant and stock status of any Shopify or WooCommerce store, with price-drop and new-product monitoring | $0.50 per 1,000 products |
| Detect a website tech stack | What sites run from 7,700 technologies, with social links and contacts in the same row | $1.50 per 1,000 sites |
| Check domains (WHOIS, DNS, email security, SSL) | Availability, registrar and expiry, DNS, SPF/DMARC/DKIM, SSL expiry and a plain list of problems | $1.50 per 1,000 domains |
| Get Google ads of an advertiser | Every Google ad of an advertiser or website with headline, text, run dates and landing page, plus new and stopped ads | $1.20 per 1,000 ads |

The tools run on **your own Apify account** (pay per result, failed runs are free, no start fees). Apify's free plan includes monthly credit, which covers thousands of results of most tools.

## Install

n8n (self-hosted): **Settings > Community Nodes > Install**, enter `n8n-nodes-pandapi`, tick the box and install. Or with npm in your n8n folder: `npm install n8n-nodes-pandapi`.

## Credentials

1. Create a free Apify account and copy your API token from [Apify Console > Settings > API & Integrations](https://console.apify.com/settings/integrations).
2. In n8n, add a **Pandapi (Apify) API** credential and paste the token. The credential test calls Apify's `/users/me`.

## Use

Pick an operation, fill the fields (lists take one value per line, a comma list, or an expression that returns an array), and run. Each result row becomes one n8n item, paired with the input item that produced it.

Options on every operation:

| Option | Default | What it does |
|---|---|---|
| Max Cost per Run (USD) | 1 | Spending cap per run, enforced by Apify |
| Max Rows | 1000 | Rows returned per input item (0 = all) |
| Timeout (Seconds) | 300 | How long to wait; the run keeps going on Apify after that |
| Wait for Results | on | Turn off to start the run and get its `runId` at once (for very large jobs) |
| Extra Input (JSON) | `{}` | Any other input field of the underlying Apify actor |

A run with no results returns one item with `noResults: true` and the run's status message, so a workflow never fails silently. Errors explain what to fix (bad token, no Apify credit, missing field).

**AI agents:** the node is usable as a tool by the n8n AI Agent node, so an agent can read web pages as Markdown, pull PDF tables or search tenders on its own.

## Example workflows

`templates/` holds ready-to-import workflows (n8n: **Import from file**):

- `docs-site-to-markdown.json`: crawl a docs site into Markdown rows for a RAG index.
- `pdf-tables-to-sheet.json`: pull the tables out of PDF URLs.
- `daily-tender-alerts.json`: every morning, new public tenders matching your keywords.

## Development

```bash
npm install
npm test                       # build and unit tests
APIFY_TOKEN=... npm run live   # real runs of 6 tools (a few cents)
npm run lint
```

The operation list (`nodes/Pandapi/tools.ts`) is generated from the Pandapi tool registry, so this node, the Pandapi MCP server and the Make app stay in sync. Releases: bump the version in `package.json`, push a tag `v<version>`, and the `release` workflow publishes to npm with provenance (npm trusted publishing, no token).

## License

MIT. Made by [Pandapi](https://apify.com/blueberry_rainstorm).
