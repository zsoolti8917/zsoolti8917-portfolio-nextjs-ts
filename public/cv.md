# Zsolt Varjú — Software Developer

Zsolt Varjú is a software developer and platform operator based in Prague, building web applications end to end, designing ETL pipelines, and running the production infrastructure behind them.

## At a glance

- **Based in:** Prague, CZ
- **From:** Čierna Voda, SK
- **In software since:** 2022
- **Email:** dev@zsoltvarju.com
- **LinkedIn:** https://www.linkedin.com/in/zsoltvarju/
- **GitHub:** https://github.com/zsoolti8917
- **Website:** https://zsoltvarju.com/

## Summary

Hey there. I'm Zsolt, a developer from Čierna Voda in Slovakia, now living in Prague. I build software and I also run it in production. Today I look after a platform that delivers quality reports and data unavailability reports from Earth observation satellites on a project for the European Space Agency, aggregating validated data from ESA, legacy and third-party missions. I choose the approach, write the code, move the data, and keep the servers up.

I have a master's degree in Applied Informatics, and alongside my studies I spent three years testing other people's websites, which is where I learned to care about what happens after the deploy. Since then I've picked up the unglamorous half of the job: data pipelines, Linux, networking, backups. I don't use AI tools every day. I experiment with them and keep learning them, because I strongly believe they are the compilers of our decade: learn them or be left behind. Outside work there's a homelab that has grown well past what I can justify, a motorcycle, and a ski season I never get enough of.

## Currently

**Software Developer at Serco, Prague**

I own and run a platform for the European Space Agency that delivers quality reports and data unavailability reports from Earth observation satellites: the code, the data pipelines, CI/CD, and the servers it runs on.

## Experience

### Software Developer — Serco Czech Republic s.r.o.

Prague · Feb 2025 - Present

- **End-to-End Ownership:** Own and run, end to end, a platform for the European Space Agency that delivers quality reports and data unavailability reports from Earth observation satellites, aggregating validated data from ESA, legacy and third-party missions.
- **Solution Design & Delivery:** Choose the approach, technologies and architecture for new work, present it, build it, take it through UAT to production, and keep it running: monitoring, fixes, patches and backups.
- **Development:** Develop the frontend, the backend and the data ingestion pipelines, and maintain the automation scripts around them.
- **Operations & Security:** Administer the platform's two Ubuntu servers: containers, CI/CD, updates, backups, access control and regular vulnerability remediation under formal change control.
- **Server Migration:** Led the migration of a legacy service from Ubuntu 18.04 to a new Ubuntu 24.04 LTS server: dockerised the legacy codebase so it runs on the new host, closed the outstanding vulnerability findings and brought the server under regular patching, and replaced a manual multi-step deployment with a single automated, zero-downtime release.
- **Performance & Code Quality:** Led a phased frontend quality programme: vendor bundle cut by roughly three quarters, JavaScript payload down a third, CSS down more than half, unnecessary re-renders reduced by 80%.
- **Stakeholder Coordination:** Work directly with the mission teams and IT on requirements, solution proposals, bug reports, change records and estimates.

Skills: React, Node.js, Python, Docker, Linux, Bash, CI/CD, Jenkins

### Quality Assurance Tester — Galileo Corporation s.r.o

Remote · 2022 - 2025

- **Functionality Testing:** Conducting thorough manual testing of web pages to verify that all features operate correctly across various browsers and devices. Identifying and reporting discrepancies or bugs promptly.
- **Visual Consistency:** Assessing the visual appearance of web pages to ensure they match the provided graphic design specifications. Communicating deviations to the relevant team members and providing detailed feedback for necessary corrections.
- **Quality Assurance:** Maintaining high standards of quality by rigorously testing web pages, ensuring they meet required specifications and user expectations.
- **Communication:** Collaborating effectively with designers, developers, and project managers to address issues found during testing and offering suggestions for improvements and clarifications.
- **Remote Work:** Managing all tasks independently while adhering to strict deadlines and utilizing effective time management skills to complete tasks efficiently and accurately.
- **Documentation:** Maintaining detailed records of test results, issues identified, and corrective actions taken, and providing comprehensive reports to relevant stakeholders.

Skills: HTML, CSS, JavaScript, Cross-Browser Testing, Bug Tracking, Remote Collaboration, Time Management

## Projects

12 projects, in the order they appear on https://zsoltvarju.com/#projects.

### Self-Hosted RAG Search

**Tech:** Python, Qdrant, bge-m3, LangChain, Docker

A retrieval-augmented search system over a local document collection, built to answer questions with citations, and to stay quiet when the evidence isn't there.

A document collection is only as useful as your ability to ask it questions. Keyword search misses meaning, and a plain chatbot bolted onto a corpus will happily invent an answer. This system is built around the opposite instinct: every answer has to be traceable to a passage that actually exists.

Key features include:

- Hybrid retrieval combining BM25 keyword search with vector similarity
- bge-m3 embeddings stored in a Qdrant vector database
- Every answer grounded in retrieved passages, with inline citations
- Explicit abstention when no supporting passage is found, instead of a plausible guess
- Runs fully self-hosted, with local models as an alternative to hosted APIs
- Cost modelling comparing hosted API inference against running a GPU yourself

The pipeline handles chunking, embedding, and hybrid BM25 plus nearest-neighbour retrieval, with tracing through LangChain and LangSmith to see exactly which passages produced which answer. OpenRouter provides multi-model access for comparison, alongside locally hosted open-weight models.

The interesting engineering here is not the generation but the retrieval quality, the citation enforcement, and the discipline of returning nothing rather than something wrong.

### Coffece (coffece.sk)

**Tech:** Next.js, TypeScript, TailwindCSS, next-intl, Framer Motion  
**Links:** [Live](https://coffece.sk)

A bilingual (SK/EN) marketing and ordering site for an office coffee delivery brand: product pages, FAQ, testimonial carousel, and contact flow, with full SEO metadata.

Coffece is a bilingual (Slovak/English) marketing and ordering website for an office coffee delivery brand, guiding visitors from discovering the offering all the way to placing an order enquiry.

Key features include:

- Fully localized SK/EN routing powered by next-intl
- Product and offering pages for office coffee delivery
- FAQ section and a testimonial carousel
- Contact and ordering flow with validated forms and e-mail delivery
- Complete SEO metadata including Open Graph tags
- Smooth Framer Motion animations and dark mode support

The site is built with Next.js and TypeScript, styled with Tailwind CSS and accessible UI components. Forms are handled server-side with Zod validation and e-mail delivery.

This project demonstrates delivering a polished, fully localized marketing site end to end, from information architecture and copy structure to SEO and production deployment.

### IDT PLUS STAV (idtplusstav.sk)

**Tech:** Next.js, TypeScript, TailwindCSS, MDX  
**Links:** [Live](https://idtplusstav.sk)

Complete digital operations for a Slovak diamond drilling and concrete cutting company: a self-hosted marketing website, business email, invoicing configured for Slovak VAT rules, plus paid search and SEO.

A marketing website for IDT PLUS STAV, a Slovak diamond drilling and concrete cutting company, built to present the company's services clearly and turn visitors into quote requests.

Key features include:

- Dedicated pages for each drilling and cutting service, with pricing and FAQ
- Project news section built on MDX articles
- Extensive references section showcasing completed projects
- Quote request form with validation and e-mail delivery
- Self-hosted deployment on a Dokku-managed server
- Google Workspace with DKIM-authenticated business email
- Invoicing set up for Slovak VAT reverse charge
- Google Ads campaigns and ongoing SEO

Built with Next.js and TypeScript and styled with Tailwind CSS. The news section is a file-based MDX blog (next-mdx-remote), and the quote request form combines React Hook Form with Zod validation.

The engagement went well beyond building a website: it covered the company's whole digital footprint: hosting, email deliverability, invoicing that matches Slovak tax rules, and the paid and organic search that brings enquiries in.

### B2B Wholesale Ordering Portal

**Tech:** WooCommerce, B2BKing, Stock Locations, SuperFaktúra

A private B2B ordering portal implemented for a Slovak fresh-produce wholesaler, now in production. Features tiered customer pricing, a login-only catalog with hidden prices, two-warehouse inventory, decimal quantities for weighted goods, and integrated invoicing.

A private B2B ordering portal implemented for a Slovak fresh-produce wholesaler, now in production and used for day-to-day wholesale ordering. The portal replaces phone and e-mail orders with a self-service catalog tailored to each customer.

Key features include:

- Tiered customer pricing with per-group price lists
- Login-only catalog with prices hidden from the public
- Inventory tracked across two warehouses
- Decimal quantities for weighted goods, such as ordering by the kilogram
- Integrated invoicing via SuperFaktúra

The portal is built on WooCommerce, extended with B2BKing for wholesale behavior (customer registration and approval, customer groups, tiered pricing, and a hidden-price catalog), and with Stock Locations for two-warehouse inventory management.

The project covered the whole delivery: gathering requirements, configuring and customizing the store, integrating invoicing, and putting the portal into production. For confidentiality, the client and store are not named.

### Lemma: Vocabulary Scanner

**Tech:** React Native, Expo, Vision models, FSRS

A mobile app that turns a photo of a printed page into vocabulary cards. Point the camera at text, and it pulls out the words worth learning and schedules them for review.

Lemma came from reading in a foreign language and constantly stopping to look words up. Instead of typing each one into a dictionary, you photograph the page and the app does the extraction, leaving you with a study deck built from what you were actually reading.

Key features include:

- Camera capture with a vision-language model detection pipeline
- Word extraction and lemmatisation from printed pages
- FSRS spaced-repetition scheduling, so reviews land when you are about to forget
- Offline-friendly local storage
- Cross-platform from a single React Native and Expo codebase
- Specced through to v1.1

The detection pipeline pairs a vision model with layout handling to read words off a photographed page reliably, and the review side implements FSRS, a modern spaced-repetition scheduler that adapts intervals to your actual recall rather than a fixed ladder.

It is a personal tool built to a real specification: a defined scope, a versioned roadmap, and a clear boundary around what v1 does and does not do.

### Personal Infrastructure & Homelab

**Tech:** Linux, Docker, WireGuard, Tailscale, CI/CD

A personal VPS and home server run with production habits: private networking, atomic zero-downtime deploys, and a stack of self-hosted services.

Running your own infrastructure is the fastest way to learn what actually breaks. This is a personal VPS and a home NAS operated the way a production system would be: versioned deploys, private networking, monitoring, and recovery that does not depend on me being at a desk.

Key features include:

- WireGuard private networking linking the VPS and the home network
- Atomic zero-downtime deployments, with instant rollback
- Tailscale mesh access to home services from anywhere
- Docker-based NAS services including media streaming and camera recording
- Self-healing service recovery and scheduled backups
- Remote development driven from a phone when needed

Deployments are atomic: a release is built alongside the running version and switched over only once it is healthy, so a bad build never takes the service down. Networking is private by default. Services are reachable over WireGuard and Tailscale rather than exposed to the internet.

It is the operator half of the job, practised on my own time: the same concerns as production work (uptime, access control, backups, recovery) at a scale where I own every decision.

### Tech Blog — zsoltvarju.dev

**Tech:** Jekyll, Markdown, RSS, Netlify  
**Links:** [Live](https://zsoltvarju.dev)

A personal engineering blog in English: software development, self-hosted infrastructure, testing, and AI — every post grounded in something that actually happened.

Writing something down is the last step of understanding it. The blog is where that happens: posts on software development, running your own infrastructure, testing, and AI, each one starting from a specific problem I actually hit — a dark-mode rendering bug on LinkedIn, deploying Dokku on a fresh VPS, an idea for an AI reading companion.

What's there:

- Practical step-by-step guides, like deploying Dokku on a VPS
- Debugging stories that show the investigation, not just the fix
- AI explored hands-on — project ideas and tooling, not hot takes
- A static site generated with Jekyll, served from a CDN
- An RSS feed, for readers and machines alike
- Tagged and searchable, written in plain English

The site itself runs the way the homelab does: a static site generator, content in Markdown under version control, and an automatic deploy on every push. No backend to patch, nothing to babysit — the same production habits, applied to publishing.

The motto on the masthead is "How you do one thing is how you do everything." The blog is that idea in public: small things, done carefully, shown with their working.

### Multi Photo Cropper

**Tech:** React, TypeScript, Vite, FastAPI, OpenCV, ONNX Runtime, Docker

A personal tool for digitizing family photo albums. Scan several prints at once on a flatbed, and it finds each photo on the sheet, lets you fine-tune the boxes, and exports every crop at full resolution as a ZIP.

Multi Photo Cropper came out of a very concrete problem: boxes of historical family photographs waiting to be digitized, and a flatbed scanner that makes scanning one print at a time painfully slow. The answer is to lay four to six photos on the glass at once and let software find and separate them afterwards.

Key features include:

- Automatic photo region detection running entirely in the browser
- An optional self-hosted backend that merges four detection strategies by IoU consensus voting
- Local CPU inference of a YOLOv8-nano ONNX model, with no cloud service and no API keys
- Texture and color histogram validation that separates a real photo from blank scanner background
- Per-region skew analysis with deskew and perspective correction
- Full manual control: draw, drag, resize with eight handles, zoom, pan, undo history, and keyboard shortcuts
- A “photos per scan” hint that constrains the detector to the expected number of prints
- Crops re-extracted at full source resolution and exported together as a ZIP
- Automatic fallback to the in-browser detector whenever the backend is offline

The browser-side detector is written from scratch against the Canvas 2D API over raw pixel buffers, with no image library at all: grayscale conversion, Otsu-style thresholding, morphological dilate and erode, connected components, and IoU consensus. The optional backend adds classical computer vision in OpenCV plus a locally run ONNX object detector, then merges every strategy's proposals by consensus voting, so a region found twice scores higher than one found once.

It is built and self-hosted purely for personal use: a Dockerized FastAPI service running as a non-root user, with a health check, a memory guard that sheds load under pressure, and resource limits sized for a small home server. Everything runs on local hardware, and nothing ever leaves it.

### Municipal Website Migrations

**Tech:** Virgo / GCM Cloud CMS

Content migration and restructuring for five Slovak municipal websites, including bilingual Slovak and Hungarian content.

Content migration and restructuring for five Slovak municipal websites moving to the Virgo / GCM Cloud CMS platform, including bilingual Slovak and Hungarian content.

Key features include:

- Complete content inventories of the legacy websites
- Page trees restructured to fit the new CMS
- Migration of documents, official notices, contracts, and image galleries
- Bilingual Slovak and Hungarian language mutations
- Post-migration audits comparing the old and new sites page by page

The work combined custom scraping and automation tooling with manual restructuring to move pages, documents, and images out of legacy and WordPress sites without losing content.

Municipal websites carry legally significant content (contracts, invoices, official board notices), so the migrations put a premium on completeness, accuracy, and verifiable results.

### InfoMap SK: Master's Thesis

**Tech:** React, Node.js, Express, MongoDB, TailwindCSS  
**Links:** [Source](https://github.com/zsoolti8917/InfoMapSK-frontend)

A full-stack application for visualising Slovak open data on an interactive map, built as my master's thesis project. The public site is no longer online; the source remains available.

InfoMapSK is a comprehensive full-stack web application developed as part of a master's thesis project. It provides an interactive platform for exploring and visualizing demographic data across different administrative levels of Slovakia.

Key features include:

- Interactive map of Slovakia with region, district, and city/village selection
- Visualization of demographic data using various chart types
- Multiple data categories: Population, Economic Activity, Agriculture, and Organizational Statistics
- Search functionality for specific locations
- Responsive design optimized for various devices
- Accessibility features following WCAG 2.1 guidelines
- Contact form for user feedback and inquiries

This project showcases proficiency in full-stack development using the MERN stack (MongoDB, Express.js, React, Node.js). The frontend is built with React and styled with TailwindCSS, while the backend utilizes Node.js with Express.js and MongoDB for data caching.

The development process involved integrating various technologies and APIs, including:

- React-leaflet for interactive mapping
- Recharts for data visualization
- Formik and Yup for form handling and validation
- Statistical Office of the Slovak Republic API for demographic data
- Geoportal of Slovakia for geospatial information

This project demonstrates the ability to create a complex, data-driven web application while adhering to best practices in responsive design, accessibility, and modern web development techniques. It showcases skills in both frontend and backend development, as well as data visualization and integration with external APIs.

### Garden Bros Website

**Tech:** Next.js, Tailwind CSS, Strapi CMS, Vercel, VPS, Dokku, PostgreSQL  
**Links:** [Source](https://github.com/zsoolti8917/garden-bros-frontend)

A website for a gardening company, built with Next.js, styled with Tailwind CSS, and managed through Strapi CMS. Features responsive design, dynamic content generation, and deployment on Vercel.

The Garden Bros Website is a dynamic platform for a gardening company to promote their services and showcase their work. Built with Next.js, styled using Tailwind CSS, and managed through Strapi CMS, it offers a responsive and engaging user experience.

Key features include:

- Responsive main page with dynamic components
- Fully-featured contact page and FAQ section
- Blog with author-written posts
- Dynamic page generation
- Content management through Strapi CMS

The project demonstrates my ability to create a full-featured website using modern web technologies. It showcases skills in frontend development, responsive design with Tailwind CSS, CMS integration, and deployment strategies.

Tailwind CSS was used to create a custom, responsive design that aligns with the client's needs. This utility-first CSS framework enabled rapid development of a unique and visually appealing interface while ensuring consistency across the site.

The website is deployed on Vercel, ensuring fast loading times and reliable performance. The backend is managed through Strapi CMS, hosted on a VPS from Forpsi within a Dokku environment. It operates as a container with an SSL certificate and uses a reverse proxy setup. The PostgreSQL database, running on the same VPS, is shared with other projects, ensuring efficient resource utilization and management.

This project highlights my proficiency in creating scalable, maintainable, and user-friendly web applications that cater to specific business needs, providing an excellent user experience and visually striking design.

### Alza Dni Kupónový Filter

**Tech:** JavaScript, Chrome Extension API, HTML, CSS  
**Links:** [Live](https://github.com/zsoolti8917/Alza) · [Source](https://github.com/zsoolti8917/Alza)

A Chrome extension that helps users filter products during Alza Days sales by various coupon codes, making it easier to find the best discounts on Alza.sk.

Alza Dni Kupónový Filter is a useful tool for anyone shopping during Alza Days. This Chrome extension allows you to easily filter products by various coupon codes, helping you quickly find the best discounts on Alza.sk.

Key features include:

- Filtering products by coupon codes (5%, 10%, 15%, 20%, 25%, 30%, 50%)
- Option to filter only currently displayed products or load all products
- Simple and clear user interface
- Quick filter removal with one click

The extension demonstrates my ability to create practical tools that enhance user experience on e-commerce platforms. It showcases skills in JavaScript, Chrome Extension API, and frontend development.

The project uses vanilla JavaScript to interact with the webpage DOM, filter products, and manage the extension's UI. The Chrome Extension API is utilized to create a browser action and handle background scripts.

This extension highlights my proficiency in creating solutions that address specific user needs, improving the shopping experience during promotional events. It also demonstrates my ability to work with browser APIs and create user-friendly interfaces for browser extensions.

The project is open-source, inviting contributions from the developer community, which shows my commitment to collaborative development and continuous improvement of software projects.

## Skills

### Languages & frameworks

TypeScript, JavaScript, Python, Bash, SQL, React, Next.js

### Backend & data

Node.js, Express, REST API, Apache Solr, Neo4j, RabbitMQ, Tika, PostgreSQL, MongoDB, Headless CMS

### Infra & ops

Docker, Kubernetes, Jenkins, GitHub Actions, Azure, Linux, nginx, Dokku, WireGuard, Tailscale

### Tools

Git, Postman, Figma

### AI & LLM

RAG architecture, Embeddings, Vector search, Qdrant, Hybrid retrieval, Prompt engineering, Claude Code, Codex, OpenRouter, LangChain / LangSmith, Self-hosted models

### Tried out / Used in school

Storybook, Java, OOP, AdobeXD, Laravel, Unity, Blender, GraphQL, C#

## Education

- **MSc, Applied Informatics** — Constantine the Philosopher University in Nitra (2018 – 2024)
  Thesis: InfoMap SK, a full-stack application visualising Slovak open data from the Statistical Office API on an interactive map.

## Certifications

- Certified Kubernetes Administrator (CKA) — Linux Foundation / CNCF
- Ubuntu Linux Professional Certificate — Canonical (Apr 2025)
- Learning Bash Scripting — LinkedIn Learning (Jul 2025)
- Basics of ABAP Programming on SAP BTP — SAP (Oct 2024)
- AWS Academy Graduate, Cloud Foundations — AWS Academy (Jul 2022)

## Languages

- Hungarian — native
- Slovak — fluent
- Czech — fluent
- English — fluent

## Contact

- Email: dev@zsoltvarju.com
- LinkedIn: https://www.linkedin.com/in/zsoltvarju/
- GitHub: https://github.com/zsoolti8917
- Portfolio: https://zsoltvarju.com/
- CV, English (PDF): https://zsoltvarju.com/Varju-CV-EN.pdf
- CV, Slovak (PDF): https://zsoltvarju.com/Varju-CV-SK.pdf
- CV, Hungarian (PDF): https://zsoltvarju.com/Varju-CV-HU.pdf

---

This file is generated from the site's own content (`npm run llm:build`), last on 2026-09-03. Slovak and Hungarian versions of the site are at https://zsoltvarju.com/sk and https://zsoltvarju.com/hu.
