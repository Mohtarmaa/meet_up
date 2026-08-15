# 💕 Date With Me

A **polished, romantic, mobile-first** digital date invitation website.

When your friend opens the link she is asked: **"Will You Go On A Date With Me? ❤️"**  
She can say YES and plan the whole date (date, time, food, location, style, a message)  
— and when she's done she can **send her date plan straight to your WhatsApp**.

---

## ✨ What it is

- A **single static page** (SPA) — everything happens on `index.html`.
- Built with **only** HTML5 + CSS3 + Vanilla JavaScript.
- **No backend. No database. No frameworks. No build tools.**  
- Works by simply opening `index.html`.
- Can be hosted free on GitHub Pages, Netlify, Vercel, or any static host.

---

## 📁 Folder structure

```
date-with-me/
│
├── index.html          All screens (landing, no-flow, planning, success)
│
├── css/
│   └── style.css       Iridescent theme, glassmorphism, animations
│
├── js/
│   └── script.js       Config, state, rendering, WhatsApp message builder
│
└── README.md           This file
```

---

## 🚀 How to open it (locally)

Simply double-click **`index.html`**, or open it in any browser:

```text
c:\Users\User\Documents\date-with-me\index.html
```

That's it. No server, no installation.

> 💡 **Recommended:** open with a modern browser (Chrome, Edge, Safari).  
> Everything works offline with `file://` or after hosting online.

---

## 🎨 How to customise it

Everything important is at the **top of `js/script.js`**.

### 1) Your name, her name, and WhatsApp number

Look for the `APP_CONFIG` object near the top of `js/script.js`:

```javascript
const APP_CONFIG = {
    senderName: "Your Name",          // ← shows at bottom of WhatsApp message
    recipientName: "Someone Special", // ← shown in the invitation question
    whatsappNumber: "923334944778"    // ← YOUR WhatsApp number (digits only)
};
```

- **recipientName** → the question becomes:  
  *"Will You Go On A Date With Me, Someone Special? ❤️"*  
  Leave blank `""` to hide the name.
- **senderName** → appears at the bottom of the WhatsApp message she sends.  
  Leave as default `"Your Name"` to hide it.
- **whatsappNumber** → number she will send the plan to.

### 2) How to enter your WhatsApp number

Use international format: **country code + number, digits only, no `+` or spaces**.

| Country | Local number example   | Enter as          |
|---------|------------------------|-------------------|
| USA     | +1 (555) 123-4567     | `15551234567`     |
| UK      | +44 7911 123456       | `447911123456`    |
| Pakistan| 0333 4944778          | `923334944778`    |

Simply replace the `whatsappNumber` value in `APP_CONFIG`.

---

## 💖 Complete flow

```
          ❤️
          ↓
WILL YOU GO ON A DATE?
       /        \
     YES         NO
      ↓          ↓
   YAY! ❤️    Aww... 🥺
      ↓        /   |    \
   DATE/TIME  Maybe  Think  No
      ↓        ↓     ↓     ↓
    FOOD     Yesss! ❤️  Take your  That's ok
      ↓              time ❤️      ❤️
   LOCATION
      ↓
    STYLE
      ↓
   MESSAGE
      ↓
   REVIEW
      ↓
 IT'S A DATE! 🎉
      ↓
 SEND ON WHATSAPP 💚
      ↓
  All details sent
    to your WhatsApp
```

---

## 📱 Features

- **Animated iridescent background** — aurora gradients that gently drift
- **Twinkling sparkle overlay** — tiny stars across the background
- **Floating hearts** — romantic hearts rise continuously
- **Shimmering gradient text** — headings that glide through rainbow colors
- **Glowing glass cards** — gradient-bordered frosted glass panels
- **8 food options** + custom text input
- **8 location options** + custom suggestion input
- **8 date style options** (including Bike Riding, Rooftop, Dinner & Walk, Cute Café Date)
- **Progress bar** with animated gradient fill
- **Confetti celebration** on the final screen
- **Start Over** confirmation modal (no accidental reset)
- **LocalStorage save** — refresh never loses progress
- **NO flow** — playful, never forces acceptance, always respectful
- **Accessible** — semantic HTML, keyboard support, focus states, reduced-motion support

---

## 💬 How the WhatsApp button works

There is **no backend**, so the app cannot email you.  
When she clicks **"SEND OUR DATE PLAN ON WHATSAPP 💚❤️"**, JavaScript:

1. Builds a friendly text summary of her selections  
   (date, time, food, location, date type, message).
2. Encodes it with `encodeURIComponent()`.
3. Opens `https://wa.me/923334944778?text=...`.

She presses **Send** in WhatsApp and the plan arrives in your chat.

Example generated message:

```text
❤️ DATE PLAN ❤️

I said YES! ❤️

📅 Date: Thursday, August 20, 2026
⏰ Time: 7:30 PM

🍕 Food:
Pizza, Dessert

📍 Location:
Rooftop

✨ Date Type:
Romantic Dinner

💌 Message:
Can't wait! ❤️

See you! ❤️
```

---

## 💾 LocalStorage

The app saves progress in the device's browser storage (key: `dateWithMePlan`).

- If she refreshes, her answers are not lost.
- The **Start Over** button (with confirmation modal) clears it and resets.

> ⚠️ LocalStorage stays **only on her device/browser**.  
> It is **NOT** a database — nothing is sent to a server.

---

## ☁️ How to host it online (free)

1. Push the whole `date-with-me/` folder to GitHub (as a repo).
2. Enable **GitHub Pages** on the repo.  
   Or drag & drop the folder onto **Netlify** or **Vercel**.
3. You get a URL like:  
   `https://yourname.github.io/date-with-me/` or `https://date-with-me.netlify.app`

Send that URL to her through **WhatsApp, Messenger, Instagram, or SMS**.  
She opens it on her phone — **nothing to install** — it just works.

---

## 🎨 Design tokens

Change the colour scheme in `css/style.css` under `:root`.  
Key variables:

```css
--rose: #ff5e92;
--purple: #a76bff;
--sky: #6ec6ff;
--grad: linear-gradient(135deg, #ff5e92, #ff9ec7 40%, #b06cf3 75%, #6ec6ff);
```

---

Made with ❤️ for someone special.