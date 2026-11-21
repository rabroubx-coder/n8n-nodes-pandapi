// GENERATED from the Pandapi tool registry. Do not edit by hand.
import type { PandapiTool } from './types';

export const TOOLS: PandapiTool[] = [
	{
		"key": "markdown",
		"actor": "blueberry_rainstorm/web-page-to-markdown",
		"title": "Web page to Markdown",
		"action": "Convert web pages to Markdown",
		"description": "Convert web pages to clean, LLM-ready Markdown (main content only, menus and cookie banners removed). Give page URLs, or a sitemap, or set crawl=true to follow links under a URL (a whole docs site). JavaScript pages are rendered automatically. Optional RAG chunks with token counts. Returns one row per page: url, title, markdown, wordCount, approxTokens, status. Use it to read, summarise or index pages.",
		"baseInput": {
			"urls": []
		},
		"defaults": {
			"maxPages": 10
		},
		"required": [],
		"anyOf": [
			[
				"urls"
			],
			[
				"sitemapUrls"
			]
		],
		"main": [
			"urls"
		],
		"params": {
			"urls": {
				"type": "array",
				"description": "Page URLs to convert (https://...).",
				"itemsType": "string",
				"urlList": true
			},
			"sitemapUrls": {
				"type": "array",
				"description": "Optional sitemap.xml URLs: converts every page listed (up to maxPages).",
				"itemsType": "string",
				"urlList": true
			},
			"crawl": {
				"type": "boolean",
				"description": "Follow links from the URLs and convert those pages too (same path by default). Default false."
			},
			"crawlScope": {
				"type": "string",
				"description": "With crawl: stay under the start URL's path, or the whole site. Default path.",
				"enum": [
					"path",
					"site"
				]
			},
			"maxPages": {
				"type": "integer",
				"description": "Max pages to convert when crawling or reading a sitemap. Default 10 here.",
				"minimum": 1,
				"maximum": 100000
			},
			"contentMode": {
				"type": "string",
				"description": "main = article/body only (default), full = whole page.",
				"enum": [
					"main",
					"full"
				]
			},
			"chunkSize": {
				"type": "integer",
				"description": "Split each page into RAG chunks of about this many tokens (0 = off, default).",
				"minimum": 0,
				"maximum": 8000
			},
			"includeLinks": {
				"type": "boolean",
				"description": "Keep hyperlinks in the Markdown. Default true."
			}
		}
	},
	{
		"key": "pdf",
		"actor": "blueberry_rainstorm/pdf-to-text-markdown",
		"title": "PDF to Markdown, text and Excel tables",
		"action": "Extract text, Markdown and tables from PDFs",
		"description": "Extract text from PDF URLs as Markdown (headings, lists, tables), with OCR for scanned pages. Tables come back as rows and as a ready Excel (.xlsx) download link (multi-page tables joined, numbers as numbers). Returns one row per PDF: title, pageCount, markdown, tables, excelUrl, approxTokens, status.",
		"baseInput": {},
		"defaults": {
			"includeText": false
		},
		"required": [
			"urls"
		],
		"anyOf": null,
		"main": [
			"urls"
		],
		"params": {
			"urls": {
				"type": "array",
				"description": "PDF URLs (https://...pdf).",
				"itemsType": "string",
				"urlList": true
			},
			"pageRange": {
				"type": "string",
				"description": "Optional pages, e.g. \"1-5, 9\". Default all."
			},
			"ocr": {
				"type": "string",
				"description": "OCR scanned pages: auto (default), off, always.",
				"enum": [
					"auto",
					"off",
					"always"
				]
			},
			"includeText": {
				"type": "boolean",
				"description": "Also return plain text (doubles the output). Default false here."
			},
			"includeTables": {
				"type": "boolean",
				"description": "Return tables as rows in the result. Default true."
			},
			"spreadsheetOutput": {
				"type": "string",
				"description": "Spreadsheet files for the tables. Default xlsx.",
				"enum": [
					"xlsx",
					"csv",
					"both",
					"none"
				]
			},
			"chunkSize": {
				"type": "integer",
				"description": "RAG chunk size in tokens (0 = off, default).",
				"minimum": 0,
				"maximum": 8000
			},
			"password": {
				"type": "string",
				"description": "Password for protected PDFs."
			}
		}
	},
	{
		"key": "contacts",
		"actor": "blueberry_rainstorm/website-contact-finder",
		"title": "Website contact finder",
		"action": "Find contact details on websites",
		"description": "Find public business contact details on company websites: emails, phone numbers and social profile links (LinkedIn, X, Facebook, Instagram, YouTube...). Reads the home, contact and about pages. One row per website. You are charged only for websites where contacts were found.",
		"baseInput": {},
		"defaults": {},
		"required": [
			"urls"
		],
		"anyOf": null,
		"main": [
			"urls"
		],
		"params": {
			"urls": {
				"type": "array",
				"description": "Website URLs or domains (https://example.com).",
				"itemsType": "string",
				"urlList": true,
				"actorField": "startUrls"
			},
			"maxPagesPerSite": {
				"type": "integer",
				"description": "Pages read per website. Default 8.",
				"minimum": 1,
				"maximum": 50
			},
			"genericEmailsOnly": {
				"type": "boolean",
				"description": "Only role emails like info@ or sales@ (default true). Set false to include named people's work emails."
			}
		}
	},
	{
		"key": "screenshot",
		"actor": "blueberry_rainstorm/website-screenshot",
		"title": "Website screenshot",
		"action": "Take website screenshots",
		"description": "Take full-page or viewport screenshots of web pages on desktop, laptop, tablet or mobile, with cookie banners hidden. PNG, JPEG or PDF. Returns one row per URL and device with a download link (screenshotUrl), title, page height and status.",
		"baseInput": {},
		"defaults": {},
		"required": [
			"urls"
		],
		"anyOf": null,
		"main": [
			"urls"
		],
		"params": {
			"urls": {
				"type": "array",
				"description": "Page URLs to capture.",
				"itemsType": "string",
				"urlList": true
			},
			"devices": {
				"type": "array",
				"description": "Devices to emulate. Default [\"desktop\"].",
				"itemsEnum": [
					"desktop",
					"laptop",
					"tablet",
					"mobile"
				],
				"itemsType": "string"
			},
			"fullPage": {
				"type": "boolean",
				"description": "Capture the whole scrolling page (default true) or only the first screen."
			},
			"format": {
				"type": "string",
				"description": "Image format. Default png.",
				"enum": [
					"png",
					"jpeg",
					"pdf"
				]
			},
			"darkMode": {
				"type": "boolean",
				"description": "Ask the page for dark mode. Default false."
			},
			"elementSelector": {
				"type": "string",
				"description": "Optional CSS selector: capture only this element."
			},
			"waitForSelector": {
				"type": "string",
				"description": "Optional CSS selector to wait for before capturing."
			}
		}
	},
	{
		"key": "links",
		"actor": "blueberry_rainstorm/broken-link-checker",
		"title": "Broken link checker",
		"action": "Check a website for broken links",
		"description": "Crawl a website and check every link (internal and external, optionally images) for 404s, server errors, timeouts and redirects. Returns one row per problem link with its status code, category and the page it was found on.",
		"baseInput": {},
		"defaults": {
			"onlyBroken": true,
			"maxPagesToCrawl": 20
		},
		"required": [
			"urls"
		],
		"anyOf": null,
		"main": [
			"urls"
		],
		"params": {
			"urls": {
				"type": "array",
				"description": "Website URLs to crawl (start pages).",
				"itemsType": "string",
				"urlList": true,
				"actorField": "startUrls"
			},
			"maxPagesToCrawl": {
				"type": "integer",
				"description": "Pages to crawl per site. Default 20 here.",
				"minimum": 1
			},
			"maxLinksToCheck": {
				"type": "integer",
				"description": "Max links to check in total. Default 1000.",
				"minimum": 1
			},
			"checkExternalLinks": {
				"type": "boolean",
				"description": "Also check links to other sites. Default true."
			},
			"checkImages": {
				"type": "boolean",
				"description": "Also check image URLs. Default false."
			},
			"onlyBroken": {
				"type": "boolean",
				"description": "Return only problem links (default true here). false returns every link checked."
			}
		}
	},
	{
		"key": "tenders",
		"actor": "blueberry_rainstorm/public-tenders-feed",
		"title": "Public tenders and contract awards",
		"action": "Search public tenders and contracts",
		"description": "Search government tenders, RFPs, early notices and contract awards from official portals in one normalised feed: SAM.gov (US), TED (EU), UK Find a Tender and Contracts Finder, CanadaBuys and the World Bank. Filter by keywords, country, CPV/NAICS codes, value and date. Returns title, buyer, country, value, deadline, notice type, URL and description.",
		"baseInput": {},
		"defaults": {
			"maxResults": 50,
			"descriptionMaxLength": 800
		},
		"required": [],
		"anyOf": null,
		"main": [],
		"params": {
			"keywords": {
				"type": "array",
				"description": "Words or phrases to match, e.g. [\"cybersecurity\", \"cloud migration\"].",
				"itemsType": "string"
			},
			"excludeKeywords": {
				"type": "array",
				"description": "Skip notices containing these.",
				"itemsType": "string"
			},
			"sources": {
				"type": "array",
				"description": "Portals to search. Default all.",
				"itemsEnum": [
					"sam",
					"ted",
					"uk-fts",
					"uk-cf",
					"canadabuys",
					"worldbank"
				],
				"itemsType": "string"
			},
			"noticeTypes": {
				"type": "array",
				"description": "Default [\"tender\", \"pre-notice\"]. Add \"award\" for who won.",
				"itemsEnum": [
					"tender",
					"pre-notice",
					"award",
					"other"
				],
				"itemsType": "string"
			},
			"countries": {
				"type": "array",
				"description": "ISO country codes, e.g. [\"US\", \"DE\"].",
				"itemsType": "string"
			},
			"cpvCodes": {
				"type": "array",
				"description": "EU/UK CPV codes (prefixes work, e.g. \"72\" for IT services).",
				"itemsType": "string"
			},
			"naicsCodes": {
				"type": "array",
				"description": "US NAICS codes.",
				"itemsType": "string"
			},
			"postedWithinDays": {
				"type": "integer",
				"description": "Posted in the last N days. Default 7.",
				"minimum": 1,
				"maximum": 365
			},
			"minValueUsd": {
				"type": "integer",
				"description": "Minimum estimated value in USD.",
				"minimum": 0
			},
			"maxResults": {
				"type": "integer",
				"description": "Max notices in total. Default 50 here.",
				"minimum": 1
			}
		}
	},
	{
		"key": "appstore",
		"actor": "blueberry_rainstorm/app-store-reviews-scraper",
		"title": "App Store reviews and app data",
		"action": "Get App Store reviews",
		"description": "Get Apple App Store (iOS) reviews, ratings and app details for any app in about 180 countries, plus a free per-app summary (rating histogram, top complaint words). Also searches apps by keyword and reads top charts. Apps can be App Store links, numeric IDs, bundle IDs or names. Rows have type app, review, summary or app-list-item.",
		"baseInput": {
			"apps": []
		},
		"defaults": {
			"maxReviewsPerApp": 50
		},
		"required": [],
		"anyOf": [
			[
				"apps"
			],
			[
				"searchTerms"
			],
			[
				"charts"
			]
		],
		"main": [
			"apps"
		],
		"params": {
			"apps": {
				"type": "array",
				"description": "App Store links, app IDs (570060128), bundle IDs or app names.",
				"itemsType": "string"
			},
			"countries": {
				"type": "array",
				"description": "Storefront country codes. Default [\"us\"].",
				"itemsType": "string"
			},
			"maxReviewsPerApp": {
				"type": "integer",
				"description": "Reviews per app per country. Default 50 here; 0 = app details only.",
				"minimum": 0,
				"maximum": 1000
			},
			"reviewSort": {
				"type": "string",
				"description": "Default mostRecent.",
				"enum": [
					"mostRecent",
					"mostHelpful",
					"both"
				]
			},
			"minRating": {
				"type": "integer",
				"description": "Only reviews with at least this many stars.",
				"minimum": 1,
				"maximum": 5
			},
			"maxRating": {
				"type": "integer",
				"description": "Only reviews with at most this many stars (e.g. 2 for complaints).",
				"minimum": 1,
				"maximum": 5
			},
			"keywords": {
				"type": "array",
				"description": "Only reviews mentioning any of these words.",
				"itemsType": "string"
			},
			"reviewsSince": {
				"type": "string",
				"description": "Only reviews on or after this date (YYYY-MM-DD)."
			},
			"searchTerms": {
				"type": "array",
				"description": "Search the App Store for apps matching these terms.",
				"itemsType": "string"
			},
			"charts": {
				"type": "array",
				"description": "Top charts to read.",
				"itemsEnum": [
					"topFree",
					"topPaid",
					"topGrossing",
					"topFreeIpad",
					"topPaidIpad",
					"topGrossingIpad",
					"newApps",
					"newFree",
					"newPaid",
					"topFreeMac",
					"topPaidMac",
					"topGrossingMac"
				],
				"itemsType": "string"
			}
		}
	},
	{
		"key": "googleplay",
		"actor": "blueberry_rainstorm/google-play-reviews-scraper",
		"title": "Google Play reviews and app data",
		"action": "Get Google Play reviews",
		"description": "Get Google Play (Android) reviews with developer replies, ratings and app details, in many languages and countries, plus a free per-app summary. Also searches apps and reads top charts. Apps can be Play Store links, package names (com.duolingo) or names. Rows have type app, review, summary or app-list-item.",
		"baseInput": {
			"apps": []
		},
		"defaults": {
			"maxReviewsPerApp": 50
		},
		"required": [],
		"anyOf": [
			[
				"apps"
			],
			[
				"searchTerms"
			],
			[
				"charts"
			]
		],
		"main": [
			"apps"
		],
		"params": {
			"apps": {
				"type": "array",
				"description": "Play Store links, package names or app names.",
				"itemsType": "string"
			},
			"languages": {
				"type": "array",
				"description": "Review languages. Default [\"en\"].",
				"itemsType": "string"
			},
			"countries": {
				"type": "array",
				"description": "Country codes. Default [\"us\"].",
				"itemsType": "string"
			},
			"maxReviewsPerApp": {
				"type": "integer",
				"description": "Reviews per app per language. Default 50 here; 0 = app details only.",
				"minimum": 0,
				"maximum": 50000
			},
			"reviewSort": {
				"type": "string",
				"description": "Default newest.",
				"enum": [
					"newest",
					"mostRelevant",
					"rating"
				]
			},
			"minRating": {
				"type": "integer",
				"description": "Only reviews with at least this many stars.",
				"minimum": 1,
				"maximum": 5
			},
			"maxRating": {
				"type": "integer",
				"description": "Only reviews with at most this many stars.",
				"minimum": 1,
				"maximum": 5
			},
			"keywords": {
				"type": "array",
				"description": "Only reviews mentioning any of these words.",
				"itemsType": "string"
			},
			"reviewsSince": {
				"type": "string",
				"description": "Only reviews on or after this date (YYYY-MM-DD)."
			},
			"searchTerms": {
				"type": "array",
				"description": "Search Google Play for apps matching these terms.",
				"itemsType": "string"
			},
			"charts": {
				"type": "array",
				"description": "Top charts to read.",
				"itemsEnum": [
					"topFree",
					"topPaid",
					"topGrossing"
				],
				"itemsType": "string"
			}
		}
	},
	{
		"key": "postal",
		"actor": "blueberry_rainstorm/postal-code-lookup",
		"title": "ZIP and postal code lookup",
		"action": "Look up postal codes and distances",
		"description": "Look up ZIP and postal codes in 124 countries: city, state, county and coordinates. Also distance between two codes, all codes within a radius, the codes of a city, and the nearest code to coordinates. Write codes with the country first, e.g. \"US 90210\", \"GB SW1A 1AA\". Not-found rows are free.",
		"baseInput": {
			"postalCodes": [],
			"distancePairs": [],
			"radiusCenters": [],
			"placeNames": [],
			"coordinates": []
		},
		"defaults": {
			"maxResultsPerSearch": 100
		},
		"required": [],
		"anyOf": [
			[
				"postalCodes"
			],
			[
				"distancePairs"
			],
			[
				"radiusCenters"
			],
			[
				"placeNames"
			],
			[
				"coordinates"
			]
		],
		"main": [
			"postalCodes"
		],
		"params": {
			"postalCodes": {
				"type": "array",
				"description": "Codes to look up, e.g. [\"US 90210\", \"DE 10115\"].",
				"itemsType": "string"
			},
			"distancePairs": {
				"type": "array",
				"description": "Pairs \"US 10001; US 94105\": distance in km and miles.",
				"itemsType": "string"
			},
			"radiusCenters": {
				"type": "array",
				"description": "Codes to search around (with radius).",
				"itemsType": "string"
			},
			"radius": {
				"type": "number",
				"description": "Radius for radiusCenters. Default 10.",
				"minimum": 0.1,
				"maximum": 2000
			},
			"radiusUnit": {
				"type": "string",
				"description": "Default km.",
				"enum": [
					"km",
					"mi"
				]
			},
			"placeNames": {
				"type": "array",
				"description": "Places to list codes for, e.g. \"Springfield, IL, US\".",
				"itemsType": "string"
			},
			"coordinates": {
				"type": "array",
				"description": "\"lat, lon\" pairs: nearest postal code.",
				"itemsType": "string"
			},
			"defaultCountry": {
				"type": "string",
				"description": "Country for codes written without one. Default US."
			},
			"maxResultsPerSearch": {
				"type": "integer",
				"description": "Max codes per radius or place search. Default 100 here.",
				"minimum": 1,
				"maximum": 10000
			}
		}
	},
	{
		"key": "htmlpdf",
		"actor": "blueberry_rainstorm/html-to-pdf",
		"title": "HTML to PDF",
		"action": "Convert HTML or web pages to PDF",
		"description": "Make PDFs from web page URLs, from an HTML document, or from an HTML template plus JSON data rows (one PDF per row: invoices, certificates, reports). Page size, margins, landscape, page numbers, header and footer. Returns one row per PDF with a download link (pdfUrl), page count and status.",
		"baseInput": {
			"urls": []
		},
		"defaults": {},
		"required": [],
		"anyOf": [
			[
				"urls"
			],
			[
				"html"
			],
			[
				"template",
				"data"
			]
		],
		"main": [
			"urls"
		],
		"params": {
			"urls": {
				"type": "array",
				"description": "Web page URLs to print as PDF.",
				"itemsType": "string",
				"urlList": true
			},
			"html": {
				"type": "string",
				"description": "A full HTML document to turn into one PDF."
			},
			"fileName": {
				"type": "string",
				"description": "File name for the html PDF."
			},
			"template": {
				"type": "string",
				"description": "HTML template with {{field}} placeholders; one PDF per item of data."
			},
			"data": {
				"type": "array",
				"description": "JSON rows for the template.",
				"itemsType": "object"
			},
			"pageFormat": {
				"type": "string",
				"description": "Default A4.",
				"enum": [
					"A4",
					"Letter",
					"Legal",
					"A3",
					"A5",
					"Tabloid"
				]
			},
			"landscape": {
				"type": "boolean",
				"description": "Default false."
			},
			"margin": {
				"type": "string",
				"description": "CSS margins, e.g. \"20mm\" or \"10mm 15mm\"."
			},
			"pageNumbers": {
				"type": "boolean",
				"description": "Add \"3 / 12\" page numbers in the footer. Default false."
			}
		}
	},
	{
		"key": "hn",
		"actor": "blueberry_rainstorm/hacker-news-scraper",
		"title": "Hacker News search",
		"action": "Search Hacker News",
		"description": "Search Hacker News stories, comments, Ask HN, Show HN, jobs or the current front page, with filters for points, comments, dates and author. Returns title, url, points, comment count, author, date and the HN link.",
		"baseInput": {},
		"defaults": {
			"maxItems": 30
		},
		"required": [],
		"anyOf": null,
		"main": [],
		"params": {
			"searchQuery": {
				"type": "string",
				"description": "Search words. Empty with contentType front_page gives the front page."
			},
			"contentType": {
				"type": "string",
				"description": "Default story.",
				"enum": [
					"story",
					"comment",
					"ask_hn",
					"show_hn",
					"job",
					"poll",
					"front_page",
					"all"
				]
			},
			"sortBy": {
				"type": "string",
				"description": "Default date.",
				"enum": [
					"date",
					"relevance"
				]
			},
			"minPoints": {
				"type": "integer",
				"description": "Only items with at least this many points.",
				"minimum": 0
			},
			"minComments": {
				"type": "integer",
				"description": "Only items with at least this many comments.",
				"minimum": 0
			},
			"dateFrom": {
				"type": "string",
				"description": "From date (YYYY-MM-DD)."
			},
			"dateTo": {
				"type": "string",
				"description": "To date (YYYY-MM-DD)."
			},
			"author": {
				"type": "string",
				"description": "Only items by this username."
			},
			"maxItems": {
				"type": "integer",
				"description": "Max items. Default 30 here.",
				"minimum": 1
			}
		}
	},
	{
		"key": "profanity",
		"actor": "blueberry_rainstorm/profanity-filter",
		"title": "Profanity filter",
		"action": "Filter profanity in texts",
		"description": "Find and mask swear words, slurs and explicit slang in comments, reviews, chat or usernames, in 26 languages. Catches disguised words (sh1t, f u c k, fuuuck, f*ck) without flagging innocent words like Password or Scunthorpe. Mask, replace, remove or only flag. Returns one row per text: clean text, hasProfanity, matches.",
		"baseInput": {},
		"defaults": {},
		"required": [
			"texts"
		],
		"anyOf": null,
		"main": [
			"texts"
		],
		"params": {
			"texts": {
				"type": "array",
				"description": "Texts to check, one result row per text.",
				"itemsType": "string"
			},
			"languages": {
				"type": "array",
				"description": "Language codes (en, es, fr, de, ...) or \"all\". Default [\"auto\"]: English, any non-Latin script found, and Spanish, French, German, Italian, Portuguese or Dutch text.",
				"itemsType": "string"
			},
			"mode": {
				"type": "string",
				"description": "mask (default) = ****, mask-keep-first = f***, replace = [censored], remove, flag = report only.",
				"enum": [
					"mask",
					"mask-keep-first",
					"replace",
					"remove",
					"flag"
				]
			},
			"strictness": {
				"type": "string",
				"description": "strict also catches mild words (damn, crap) for children's apps. Default standard.",
				"enum": [
					"standard",
					"strict"
				]
			},
			"blockWords": {
				"type": "array",
				"description": "Extra words to treat as bad.",
				"itemsType": "string"
			},
			"allowWords": {
				"type": "array",
				"description": "Words never to flag.",
				"itemsType": "string"
			},
			"onlyFlagged": {
				"type": "boolean",
				"description": "Return only texts that contain profanity. Default false."
			}
		}
	},
	{
		"key": "jobs",
		"actor": "blueberry_rainstorm/company-jobs-tracker",
		"title": "Company jobs from career sites",
		"action": "Get open jobs from company career sites",
		"description": "Every open job at the companies you name, read live from their career site (Greenhouse, Lever, Ashby, SmartRecruiters, Workable, Recruitee, Personio, BambooHR, Rippling, Teamtailor, Breezy; not Workday). Input a company name, website or job board link. Returns one row per job (title, department, locations, countryCode, workplace remote/hybrid/onsite, employmentType, seniority, salaryMin/Max/Currency/Period, postedAt, url) plus one free 'summary' row per company (open jobs, by department/country, remote share). With trackChanges, later runs return only new jobs plus free 'closed' rows (daysOpen). Good for hiring signals, job alerts and recruiting research.",
		"baseInput": {
			"companies": []
		},
		"defaults": {
			"maxJobsPerCompany": 50,
			"includeDescription": false
		},
		"required": [
			"companies"
		],
		"anyOf": null,
		"main": [
			"companies"
		],
		"params": {
			"companies": {
				"type": "array",
				"description": "Company names (Airbnb), websites (stripe.com) or job board links (https://jobs.lever.co/palantir).",
				"itemsType": "string"
			},
			"keywords": {
				"type": "array",
				"description": "Keep jobs whose title contains any of these words (engineer, sales).",
				"itemsType": "string"
			},
			"excludeKeywords": {
				"type": "array",
				"description": "Drop jobs whose title contains any of these words.",
				"itemsType": "string"
			},
			"locations": {
				"type": "array",
				"description": "Cities, countries, 2-letter country codes (US, GB, DE) or 'remote'.",
				"itemsType": "string"
			},
			"workplace": {
				"type": "array",
				"description": "Keep only these workplace types.",
				"itemsEnum": [
					"remote",
					"hybrid",
					"onsite"
				],
				"itemsType": "string"
			},
			"postedWithinDays": {
				"type": "integer",
				"description": "Only jobs posted in the last N days. 0 = any."
			},
			"includeDescription": {
				"type": "boolean",
				"description": "Add the full job text (longer output). Default false."
			},
			"maxJobsPerCompany": {
				"type": "integer",
				"description": "Most jobs per company after filters. Default 50."
			},
			"trackChanges": {
				"type": "boolean",
				"description": "Remember jobs between runs; later runs return only new jobs plus closed ones."
			},
			"watchlistName": {
				"type": "string",
				"description": "Name of the saved watchlist when trackChanges is on."
			}
		}
	},
	{
		"key": "shopify",
		"actor": "blueberry_rainstorm/shopify-app-store-reviews",
		"title": "Shopify App Store reviews and app data",
		"action": "Get Shopify App Store reviews",
		"description": "Get Shopify App Store reviews (stars, text, date, merchant country, how long they used the app, developer reply) and app details (rating histogram, every pricing plan, developer, launch date, Built for Shopify, categories), plus a free per-app summary with reply rate, complaints and suspicious-review signals (bursts, day-one 5-star reviews, repeated wording) scored 0-100. Apps are apps.shopify.com links or handles like judgeme. Rows have type app, review, summary or problem.",
		"baseInput": {
			"apps": []
		},
		"defaults": {
			"maxReviewsPerApp": 50
		},
		"required": [
			"apps"
		],
		"anyOf": null,
		"main": [
			"apps"
		],
		"params": {
			"apps": {
				"type": "array",
				"description": "Shopify App Store links or app handles (judgeme).",
				"itemsType": "string"
			},
			"maxReviewsPerApp": {
				"type": "integer",
				"description": "Reviews per app. Default 50 here; 0 = app details only. About 400 a minute.",
				"minimum": 0,
				"maximum": 100000
			},
			"reviewSort": {
				"type": "string",
				"description": "Default newest (best for the suspicious-review signals).",
				"enum": [
					"newest",
					"relevance"
				]
			},
			"minRating": {
				"type": "integer",
				"description": "Only reviews with at least this many stars.",
				"minimum": 1,
				"maximum": 5
			},
			"maxRating": {
				"type": "integer",
				"description": "Only reviews with at most this many stars.",
				"minimum": 1,
				"maximum": 5
			},
			"keywords": {
				"type": "array",
				"description": "Only reviews mentioning any of these words.",
				"itemsType": "string"
			},
			"reviewsSince": {
				"type": "string",
				"description": "Only reviews on or after this date (YYYY-MM-DD)."
			},
			"includeAppDetails": {
				"type": "boolean",
				"description": "One app row with pricing plans and histogram. Default true."
			}
		}
	}
];
