# Kiev Gonzales - Portfolio

Personal portfolio website showcasing my projects, skills, and background as a BSIT student focused on cloud engineering.

## Live Site

**[kievgonzales.is-a.dev](https://kievgonzales.is-a.dev/)**

The original Amplify address, [main.d27qww4wmm59bh.amplifyapp.com](https://main.d27qww4wmm59bh.amplifyapp.com), still works.

## About

I'm a BSIT student at Technological University of the Philippines - Manila (graduating 2027), with hands-on experience designing and deploying cloud-based solutions on AWS. My background covers networking, cybersecurity, information assurance, and database systems.

## Tech Stack

- HTML / CSS / JavaScript (no build step)
- Three.js (loaded from a CDN) for the scroll-driven 3D network scene
- Archivo and Instrument Serif from Google Fonts
- Hosted on AWS Amplify, deployed automatically from `main` through the Amplify GitHub App
- Custom domain from [is-a.dev](https://is-a.dev), pointed at Amplify with CNAME records, with HTTPS from an Amplify-managed certificate

## How the page is told

The page follows one packet's trip across a network, from my computer to a live, secure site. Each chapter has a label in that style:

| Chapter | Label | Meaning |
|---|---|---|
| Opening | `127.0.0.1 · Localhost` | The address a computer uses for itself: the start, at home |
| About | `SYN · The packet` | The first message of a TCP connection ("can we talk?") |
| Network | `ACK · The network` | The reply that confirms the message arrived |
| Skills | `L1` / `L2` / `L3` | The site's own three layers: Infrastructure, Backend & data, Code (not OSI layers) |
| Projects | `200 OK · Projects` | The HTTP status for a request that worked: things I've shipped |
| Hackathons | `3 runs · Hackathons` | The three hackathons I've joined |
| Contact | `443 · Let's deploy` | The HTTPS port: live and secured |

## Features

- Scroll-driven 3D scene that morphs between a node layout for each chapter
- Animated scroll cue on the opening screen
- Expandable project and hackathon entries
- Certificates open in a pop-up preview, with a button for the original PDF
- Copy-email button
- No visible scrollbar (the page still scrolls with the mouse wheel, touch, and keyboard)
- Separate mobile layout below 768px

The page still works without JavaScript or WebGL: all text stays visible, certificate links open the PDF, and the background falls back to a gradient. Visitors with "reduce motion" turned on get plain fades, a still scroll cue, and a still scene.

## Files

- `index.html` - page content, one `<section class="chapter">` per story chapter, plus the certificate pop-up
- `style.css` - layout, type, scroll reveal, the certificate pop-up, and the mobile layout (below 768px)
- `main.js` - tracks the active chapter, updates the dot rail and caption, copy-email button, certificate pop-up
- `scene.js` - the Three.js scene; each chapter has its own node layout, and the scene morphs between them as you scroll
- `assets/certificates/` - certificate PDFs, with a `.webp` preview of each for the pop-up
- `assets/icons/` - favicon and Apple touch icon
- `robots.txt` and `sitemap.xml` - point search engines to the site

## Projects Featured

- **PASC Inc. Voting Site** (Freelance, Aug–Oct 2026) - Miss Popularity voting site for the 2026 Miss Philippines-Australia & Charity Queen Australia pageant, built with Jedrick Franconas in Next.js and Supabase. 2,332 votes across 9 candidates. Received a Certificate of Appreciation and a recommendation letter from PASC Inc. [Live site](https://www.mpa-popularity.site/vote)
- **Ajon-Veggies POS System** - Full-stack POS with Flask, SQLite, FIFO inventory, and role-based access control
- **RBAC Log Management CLI** - Python/SQLite CLI tool for access log management with role-based permissions
- **E-Commerce Application** - Full-stack platform built with Java and MySQL
- **IoT Environmental Monitor** - Arduino/ESP32 sensor dashboard using Blynk
- **ATM Simulation** - C++ banking simulation with file handling
- **Snake Game** - Classic arcade game in C++ with graphics programming
- **UI/UX App Simulation** - Interactive app prototype in Figma
- **E-commerce Website** - HTML/CSS e-commerce site

## Hackathons

- **AppBuildersPH Hackathon 2026** (Oct 2026) - Participant. Backpack Tutor, an offline on-device AI study app
- **Build Over Nights: Kiro x Quick** (Oct 2026) - Top 10, Educational Crisis track (selected from hundreds of applicant teams). TU-gang, a Bikol-first tutor app
- **UI/UX HAWK-A-THON** (Mar 2025) - Participant. UniFit, a gender-neutral fitness app designed in Figma

## Contact

- Website: [kievgonzales.is-a.dev](https://kievgonzales.is-a.dev/)
- Email: cauyan.kiev13@gmail.com
- GitHub: [kvzl0](https://github.com/kvzl0)
- LinkedIn: [kiev-gonzales](https://www.linkedin.com/in/kiev-gonzales/)
