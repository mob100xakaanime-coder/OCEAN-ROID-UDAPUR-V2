# Ocean Roid Online Store

Website + small backend in ONE project. `package.json` is in the main folder, so Render finds it without any Root Directory setting.

## Folder structure

```
package.json        start command (npm start)
server.js           backend: serves the website and saves orders
products.json       product list and prices (edit prices here)
data/orders.json    saved orders
public/             the website
  index.html
  css/style.css
  js/config.js      YOUR SETTINGS: WhatsApp number, Instagram
  js/products.js    fallback product list
  js/app.js         cart and checkout
  admin.html        admin login and order dashboard
```

## Before you deploy
Open `public/js/config.js` and set:
- `WA_NUMBER` your WhatsApp number with country code, no + or spaces (example `919876543210`)
- `IG_USER` your Instagram username

## Deploy on Render (step by step)
1. Create a new GitHub repository.
2. Upload everything that is INSIDE this folder (package.json, server.js, products.json, data, public, README.md) so that `package.json` is visible on the first page of the repository.
3. On Render: New > Web Service > connect that repository.
4. Settings:
   - Root Directory: leave EMPTY
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variable: `ADMIN_KEY` = a long secret only you know
5. Click Deploy. Your store opens at the .onrender.com link.

## Run on your own computer
Install Node.js 18+, open a terminal in this folder and run:
```
npm start
```
Then open http://localhost:3000

## Admin login (order dashboard)
- Open `https://YOUR-SITE.onrender.com/admin.html`
- Password = the `ADMIN_KEY` you set on Render (Environment Variables). If `ADMIN_KEY` is not set, admin is disabled.
- You can see all orders, search them, filter by status, change status, and message the customer on WhatsApp.
- 10 wrong passwords lock that device out for 15 minutes.
- Do not share the link publicly and do not put the password in the code or on GitHub.
- To change the password: change `ADMIN_KEY` on Render, then redeploy.

## API
| Method | URL | What it does |
|---|---|---|
| GET | `/api/products` | All products |
| POST | `/api/orders` | Saves an order. The server calculates the total itself. |
| GET | `/api/orders` | Lists orders. Needs header `x-admin-key: <ADMIN_KEY>` |
| PATCH | `/api/orders/:id` | Changes status. Body `{"status":"paid"}` |

Allowed statuses: new, confirmed, paid, printing, shipped, delivered, cancelled.

## Important
- On Render's free plan, files such as `data/orders.json` can be erased on restart or redeploy. Every order is still sent to WhatsApp. For permanent storage use a Render disk or a database.
- Delivery charge is confirmed on WhatsApp, it is not calculated on the site.
