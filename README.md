# Shri Kshetra Ganagapur — Temple Website

A static, mobile-first website for Shri Guru Dattatreya Temple (Shri Dutta Nirguna Math), Ganagapura, Kalaburagi.

## Run locally

```bash
cd Ganagapur
python3 -m http.server 8000
# open http://localhost:8000
```

Opening `index.html` directly also works. The map, QR codes and fonts load from CDNs, so you need an internet connection.

## Structure

```
index.html            page layout (all sections)
assets/css/style.css  design system + responsive styles
assets/js/data.js     ALL editable content: timings, sevas, places, festivals, stay, routes, FAQ, translations
assets/js/app.js      behaviour: live status, crowd, token, map, booking flows, chat, gallery
assets/js/credits.js  photo attribution (required by CC BY-SA)
assets/img/           30 photos from Wikimedia Commons (1280px)
```

To change timings, prices, festivals or contact details, edit `assets/js/data.js` only.

## Features

| Feature | Status |
|---|---|
| Hero with live IST clock, open/closed, current and next ritual, crowd estimate | Working |
| Today's timeline that highlights the current puja | Working |
| Crowd status gauge, hourly forecast chart, best time to visit | Heuristic estimate (day of week, hour, festival) |
| Digital queue token with "your turn" alert | Simulated |
| Darshan booking (date, slot, type, devotees, pay) with Booking ID and QR | Simulated payment |
| Seva booking with Gotra, Nakshatra, Rashi and Sankalpa, "on my behalf" option and prasadam delivery | Simulated payment |
| Accommodation booking, Donations (7 funds, 80G/PAN), Annadana sponsorship | Simulated payment |
| My Bookings dashboard with receipts, QR codes and prasadam tracking | localStorage only |
| Interactive map (Leaflet + OSM) with filters and Google Maps directions | Working |
| Ashta Teerthas, nearby places, Sangam | Working |
| Festival calendar with countdown and per-festival crowd forecast | Dates are tentative |
| Family yatra planner (day-by-day itinerary, printable) | Working |
| How to Reach tabs (Bengaluru, Kalaburagi, Hyderabad, Pune/Mumbai, Solapur) | Working |
| Guru Charitra library (53 adhyayas, reader with font size controls) | Text and audio still to be added |
| Daily audio list | Plays a tanpura drone as a placeholder |
| Live darshan panel (shows "streaming now" during arati times) | Needs a stream URL |
| "Ask Guru Datta" assistant (answers only from the FAQ) | Working (keyword matching) |
| 5 languages: EN, ಕನ್ನಡ, मराठी, हिंदी, తెలుగు | Only nav, hero and mantra are translated |
| Gallery with filters and lightbox, emergency/help grid | Working |

## Before going live

1. **Contact details.** `TEMPLE.phone`, `whatsapp` and `email` in `data.js` are placeholders.
2. **Verify with the temple office:** timings, seva list and prices, darshan types, festival dates and room tariffs.
3. **Backend.** Needed for mobile OTP login, slot capacity, bookings, the admin dashboard, QR scanning at the gate, and real crowd counts.
4. **Payments.** Connect Razorpay, PayU or similar (UPI, cards, net banking). Generate 80G receipts on the server.
5. **WhatsApp notifications.** Use the WhatsApp Business API (Gupshup, Twilio or Meta Cloud API).
6. **Content.** Add the Guru Charitra text and audio, real bhajan recordings and a live stream URL.
7. **Map.** Pins for the temple, the Sangam and Ganagapur Road station come from OpenStreetMap. The other pins are approximate, so confirm them on site.

## Photo credits

All photos come from Wikimedia Commons. Most are **CC BY-SA 4.0** by *Gpkp*, *FailedEngineer2027* and *Satish-ansingkar*. The Raja Ravi Varma Dattatreya painting is **public domain**. See `assets/js/credits.js` or the "Photo credits" link in the footer. Keep that attribution on the site.
