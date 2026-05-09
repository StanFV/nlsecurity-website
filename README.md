# NL Security Website (Modern)

https://nlsecurity-website.vercel.app

Dit is de moderne website voor **NL Security**, gebouwd met [Astro](https://astro.build/). De website is ontworpen om een professionele en scherpe uitstraling te geven aan de beveiligingsdiensten van NL Security.

## 🚀 Technologieën

- **Framework:** [Astro 4.0](https://astro.build/)
- **Styling:** Vanilla CSS (Modern & Responsive)
- **Deployment:** Vercel (SSR Enabled)
- **Database & Auth:** Supabase
- **Taal:** TypeScript / JavaScript

## 📁 Projectstructuur

```text
/
├── public/              # Statische assets (logo's, video's, banners)
├── src/
│   ├── components/      # Herbruikbare UI-componenten (bijv. Navigation)
│   ├── layouts/         # Pagina layouts (BaseLayout)
│   ├── pages/           # Website pagina's (index, over, admin, etc.)
│   ├── lib/             # Database configuratie (Supabase)
│   └── styles/          # Globale CSS en thema-instellingen
├── astro.config.mjs     # Astro configuratie (Vercel SSR)
└── package.json         # Project afhankelijkheden en scripts
```

## 🛠️ Installatie & Ontwikkeling

Om dit project lokaal te draaien, volg je deze stappen:

1.  **Clone de repository:**
    ```bash
    git clone https://github.com/StanFV/nlsecurity-website.git
    cd nlsecurity-website
    ```

2.  **Installeer de dependencies:**
    ```bash
    npm install
    ```

3.  **Configuratie:**
    Maak een `.env` bestand aan met de Supabase credentials (zie Vercel dashboard voor de waarden).

4.  **Start de development server:**
    ```bash
    npm run dev
    ```

5.  **Open de website:**
    Navigeer naar `http://localhost:4321/` in je browser.

## 📦 Build & Deployment

Het project is geconfigureerd om automatisch te builden en te deployen naar **Vercel** wanneer er een push plaatsvindt naar de `main` branch.

**Live Website:** [https://nlsecurity-website.vercel.app/](https://nlsecurity-website.vercel.app/)

## ✨ Kenmerken

- **Admin Panel:** Beheer vacatures via `/admin` (beveiligd met Supabase Auth).
- **Dynamische Vacatures:** Vacatures worden live uit Supabase geladen op de `/werken-bij` pagina.
- **Modern Design:** Gebruik van video-backgrounds, glassmorphism en vloeiende animaties.
- **Responsive:** Volledig geoptimaliseerd voor desktop, tablet en mobiel.
- **Direct Contact:** Zwevende bel-knop voor snelle interactie op mobiel.

---

*Ontwikkeld voor NL Security — Modern, Scherper, Beter.*
