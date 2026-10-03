# Дом Бонита — house-bonita.com

Static landing page for the guest house in Primorsko. No build step: plain HTML, CSS and JS, hosted on GitHub Pages.

```
index.html        Bulgarian page (main)
en/index.html     English page
css/style.css     styling
js/prices.js      PRICES — the file to edit each season
js/main.js        menu, photo gallery, renders the prices
images/           photos, logo, favicon
CNAME             custom domain for GitHub Pages
robots.txt, sitemap.xml
```

## Changing the prices

Edit [js/prices.js](js/prices.js) — it feeds both language versions.

- `rooms` — price per room per night for each season. Change only the numbers. Use `null` to show "по запитване" / "on request".
- `seasons[].dates` — the period text guests see (e.g. `юли – август`).
- `seasons[].ranges` — the same periods as `["MM-DD", "MM-DD"]`. Only used to mark the season that is on right now with a "сега" badge. Can be left as `[]`.
- `currency` — `"EUR"` or `"BGN"`.

To add a season (e.g. "среден сезон"), add another block to `seasons` with a new `id` and put a price under that `id` for every room.

The values currently in the file are **placeholders**.

## Changing text or photos

Text lives directly in `index.html` and `en/index.html` — change it in both.

To add a photo to a room gallery, drop the file into the room's folder under `images/rooms/` and copy one of the `<button type="button" data-gallery="...">` lines in that room's `room__thumbs` block (in both pages). Update the "N снимки" label next to it.

## Preview locally

```
python3 -m http.server 8000
```

Then open <http://localhost:8000/> and <http://localhost:8000/en/>.

## Deploying to GitHub Pages

1. Push to `main`.
2. GitHub → repo **Settings → Pages** → Source: *Deploy from a branch*, branch `main`, folder `/ (root)`.
3. At the domain registrar, add DNS records for `house-bonita.com`:

   | Type  | Host  | Value                |
   |-------|-------|----------------------|
   | A     | `@`   | `185.199.108.153`    |
   | A     | `@`   | `185.199.109.153`    |
   | A     | `@`   | `185.199.110.153`    |
   | A     | `@`   | `185.199.111.153`    |
   | CNAME | `www` | `nikitsv.github.io`  |

4. Back in **Settings → Pages**, set the custom domain to `house-bonita.com` (the `CNAME` file already declares it). Once the certificate is issued, tick **Enforce HTTPS**.

## Getting found on Google

1. [Google Search Console](https://search.google.com/search-console) → add property `house-bonita.com` (Domain type, verified with a DNS TXT record) → **Sitemaps** → submit `https://house-bonita.com/sitemap.xml`.
2. Create a [Google Business Profile](https://www.google.com/business/) for the house with the same name, address and phone as on the site. This is what puts the house on Google Maps and in the "къща за гости Приморско" local results — it matters more than anything on the page itself.
3. Check the structured data with the [Rich Results Test](https://search.google.com/test/rich-results).

The coordinates in the page (`42.26552, 27.75776`, in the JSON-LD block and the `geo.position` meta tag of both pages) are where Google Maps places "бул. Черно море 36". If the pin is off, right-click the house in Google Maps, copy the coordinates and replace them.
