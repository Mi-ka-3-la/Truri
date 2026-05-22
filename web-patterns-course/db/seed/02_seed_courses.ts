/**
 * Run with:  npx tsx db/seed/02_seed_courses.ts
 * Requires DATABASE_URL in .env
 */
import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import * as schema from '../schema';

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(client, { schema });

// ── Course data ───────────────────────────────────────────────────────────────

const COURSES = [
  {
    slug: 'arhitecturi-web',
    title: 'Arhitecturi Web',
    language: 'ro',
    description: 'Modele arhitecturale pentru web: Client-Server, HTTP, SSR, SPA, CDN și mai mult.',
    structureType: 'cells',
    theme: 'light',
    concepts: [
      {
        conceptKey: 'clientserver',
        label: 'Client–Server',
        subtitle: 'Un model arhitectural — nu o tehnologie, nu neaparat internet',
        branchIndex: 0,
        sortOrder: 0,
        posX: 118,
        posY: 40,
        explain: [
          'Client-server e un model de comunicare: un participant <strong>cere</strong> ceva (clientul) si altul <strong>raspunde</strong> (serverul). Clientul initiaza mereu conversatia — serverul nu poate contacta clientul din proprie initiativa, doar raspunde. Cererea se numeste request, raspunsul se numeste response.',
          '<em>Nu ai nevoie de internet.</em> Ai nevoie de o retea — orice retea. Pe localhost (acelasi calculator), pe LAN (retea de birou), pe intranet corporativ, sau pe internet. Cand un developer ruleaza o aplicatie pe port 3000 si o deschide in browser, browser-ul e clientul si serverul ruleaza pe acelasi laptop. Zero internet, model client-server complet.',
          'Modelul exista si in alte protocoale: FTP (transfer fisiere), SMTP (email), SSH (acces remote la server). HTTP e cel mai comun pe web — dar nu e singurul. Modelul e mai vechi si mai general decat internetul.',
        ],
        diagram: `Localhost (fara internet):
  Browser → localhost:3000 → Server pe acelasi laptop

LAN (retea de birou, fara internet public):
  Laptop → 192.168.1.10 → Server din sala alaturata

Internet:
  Browser → avise.com → Server in cloud (AWS, Azure)`,
        usecases: ['Orice aplicatie web sau mobila', 'Servicii interne fara internet public', 'Dev local pe laptop (localhost)'],
        pros: ['simplu de inteles si debuguit', 'serverul controleaza datele si accesul', 'clientul poate fi orice device pe orice retea'],
        cons: ['serverul devine bottleneck la multi clienti simultani', 'clientul depinde de disponibilitatea serverului'],
        connections: ['latenta', 'http', 'scalabilitate'],
      },
      {
        conceptKey: 'latenta',
        label: 'Latenta & Bottleneck',
        subtitle: 'De ce uneori e lent si de ce serverul se sufoca',
        branchIndex: 0,
        sortOrder: 1,
        posX: 58,
        posY: 112,
        explain: [
          '<strong>Latenta</strong> e timpul care trece intre momentul in care clientul trimite cererea si momentul in care primeste primul byte de raspuns. Se masoara in milisecunde. Nu e viteza de download — e <em>timpul de asteptare.</em> Un server din Romania raspunde unui utilizator din Tokyo in ~200ms indiferent cat de rapid e internetul utilizatorului, pentru ca semnalul trebuie sa parcurga fizic acea distanta.',
          '<strong>Bottleneck</strong> inseamna literal "gatul sticlei" — un punct unic prin care trebuie sa treaca tot traficul si care limiteaza debitul intregului sistem. Daca ai un singur server care poate procesa 1.000 de cereri pe secunda, dar primesti 10.000, celelalte 9.000 asteapta la coada sau primesc eroare 503 (Service Unavailable). Serverul e bottleneck-ul.',
          'Latenta si bottleneck sunt <em>probleme diferite cu solutii diferite.</em> Latenta e o problema de distanta fizica — se rezolva cu CDN sau servere mai aproape de utilizator. Bottleneck-ul e o problema de capacitate — se rezolva cu mai multe servere si load balancing. Le poti avea pe amandoua in acelasi timp.',
        ],
        diagram: `Latenta (distanta fizica):
  User Tokyo → cerere → Server Romania
               ~200ms dus + ~200ms intors
               = 400ms doar din distanta, indiferent de viteza internet

Bottleneck (capacitate):
  10.000 cereri/secunda
         ↓
  [Server: capacitate 1.000/secunda]
         ↓
  9.000 cereri: timeout → eroare 503 sau 504`,
        usecases: ['Diagnosticare: "de ce e lent?"', 'Decizie: CDN vs mai multe servere', 'Intelegerea erorilor 503, 504'],
        pros: [],
        cons: [],
        connections: ['clientserver', 'scalabilitate', 'cdn'],
      },
      {
        conceptKey: 'scalabilitate',
        label: 'Scalabilitate',
        subtitle: 'Load balancing, Kubernetes si distribuirea cererilor',
        branchIndex: 3,
        sortOrder: 2,
        posX: 178,
        posY: 112,
        explain: [
          '<strong>Scalare verticala</strong> inseamna sa dai serverului mai multa memorie si CPU. Are limite fizice si devine scump rapid. <strong>Scalare orizontala</strong> inseamna sa adaugi mai multe servere identice care impart incarcatura. Asta e ce se foloseste in productie pentru sisteme mari.',
          '<strong>Load balancer</strong> sta in fata tuturor serverelor si distribuie cererile intre ele. Primeste 10.000 de cereri/secunda si le trimite echilibrat catre 10 servere — 1.000 fiecare. Din perspectiva clientului exista o singura adresa. Cererile se distribuie in mai multe moduri: <em>round-robin</em> (pe rand, egal), <em>least connections</em> (la serverul cel mai liber in momentul respectiv), sau <em>geographic routing</em> (la serverul cel mai aproape geografic de utilizator).',
          '<strong>Kubernetes</strong> nu rezolva el singur bottleneck-ul — e un orchestrator: un sistem care gestioneaza containere (pachete cu aplicatia ta). Kubernetes stie sa <em>adauge servere automat</em> cand incarcatura creste (autoscaling) si sa le <em>opreasca</em> cand scade. Deci ecuatia productie e: load balancer distribuie cererile + Kubernetes gestioneaza cate servere ruleaza. Impreuna fac infrastructura care se adapteaza singura la trafic.',
        ],
        diagram: `Fara scalare:
  10.000 useri → [Server 1] → sufocat, 503

Cu load balancer:
  10.000 useri → [Load Balancer]
                       ├── [Server 1]  round-robin
                       ├── [Server 2]  sau least-connections
                       └── [Server 3]  sau geographic

Kubernetes + autoscaling:
  Trafic mic    →  2 servere active
  Spike trafic  →  Kubernetes porneste automat 8 servere in plus
  Trafic scade  →  Kubernetes opreste 6 (economie costuri)`,
        usecases: ['SaaS-uri cu multi clienti', 'Aplicatii cu trafic variabil', 'Black Friday / spike-uri de trafic'],
        pros: ['suporta orice volum de trafic teoretic', 'costuri proportionale cu utilizarea', 'rezistenta la caderea unui server individual'],
        cons: ['complexitate infrastructura mult mai mare', 'sesiunile user trebuie gestionate stateless', 'debugging mai dificil cu multe instante active'],
        connections: ['latenta', 'clientserver', 'stateless'],
      },
      {
        conceptKey: 'http',
        label: 'HTTP / HTTPS',
        subtitle: 'Anatomia fiecarei comunicari dintre client si server',
        branchIndex: 1,
        sortOrder: 3,
        posX: 58,
        posY: 195,
        explain: [
          'Orice comunicare HTTP — <em>absolut orice</em> — are: o <strong>metoda</strong> (ce vrei sa faci), o <strong>adresa URL</strong> (unde), si <strong>headere</strong> (metadate: cine esti, ce format accepti, token-ul de autentificare). Body-ul e optional: GET nu are body, POST si PUT au body cu datele pe care le trimiti.',
          'Cand bagi un URL in browser si apesi Enter, browser-ul trimite automat un <strong>GET request</strong> — GET inseamna "vreau sa citesc ceva". Nu trebuie sa faci nimic special, browser-ul stie ca o adresa tastata = GET. Click pe un link = GET. Form submit = POST. Toate sunt HTTP requests cu metoda, URL si headere.',
          'Raspunsul are intotdeauna un <strong>status code</strong> numeric: 200 OK, 201 creat, 400 cererea ta e gresita, 401 nu esti autentificat, 403 autentificat dar fara acces, 404 resursa nu exista, 500 eroare pe server, 503 server supraaglomerat sau jos.',
          '<strong>HTTPS</strong> e HTTP cu criptare TLS. Tot ce trimiti e criptat in tranzit — ISP-ul tau, un hacker pe acelasi WiFi, nimeni nu poate citi continutul. Azi orice aplicatie serioasa foloseste HTTPS. HTTP fara S e considerat insecure si browserele il marcheaza ca atare.',
        ],
        diagram: `URL in browser → GET automat:
  GET /dashboard HTTP/1.1
  Host: avise.com
  Authorization: Bearer eyJhbGc...token...
  Accept: text/html
  (fara body — GET nu are body)

Form submit sau API call → POST cu body:
  POST /api/invoices HTTP/1.1
  Content-Type: application/json
  Authorization: Bearer eyJhbGc...

  { "amount": 1500, "client": "Acme SRL" }

Raspuns intotdeauna cu status code:
  HTTP/1.1 201 Created
  { "id": 99, "status": "created" }`,
        usecases: ['Orice comunicare browser-server', 'API calls intre servicii', 'Download si upload fisiere'],
        pros: ['universal — orice limbaj il suporta', 'simplu de debuguit in DevTools (tab Network)', 'stateless — usor de scalat orizontal'],
        cons: ['stateless — necesita token la fiecare request', 'pull-only — serverul nu poate initia comunicarea (rezolvat de webhooks)'],
        connections: ['clientserver', 'stateless', 'ssr', 'spa', 'webhooks'],
      },
      {
        conceptKey: 'stateless',
        label: 'Stateless',
        subtitle: 'Serverul nu tine minte cine esti — si de ce asta e bine',
        branchIndex: 1,
        sortOrder: 4,
        posX: 178,
        posY: 195,
        explain: [
          '<strong>Stateless</strong> inseamna ca serverul nu tine minte conversatia anterioara. Dupa ce ti-a raspuns la un request, te-a uitat complet. Urmatorul request il trateaza ca si cum te-ar vedea pentru prima data. Nu exista "sesiune" stocata pe server care sa spuna "userul asta e logat".',
          'Consecinta: <em>fiecare request trebuie sa contina tot ce serverul are nevoie ca sa raspunda</em>. Inclusiv cine esti. De aceea in fiecare API call din Avise ai in header un <strong>token de autentificare</strong> (JWT). Nu e o pedepsa — e contractul: request-ul e autocontinent, serverul nu trebuie sa-si aminteasca nimic din trecut ca sa te serveasca.',
          'De ce stateless = scalabil? Daca serverul nu tine stare despre tine, <em>oricare dintre cele 10 servere din spatele load balancer-ului poate raspunde la cererea ta.</em> Nu conteaza la care server ai vorbit ultima data. Daca serverul ar tine stare (stateful), ar trebui sa ajungi mereu la acelasi server — ceea ce face scalarea orizontala dramatic mai complicata.',
        ],
        diagram: `STATEFUL (problematic la scalare):
  Request 1 → Server 1 (memoreaza: "userul X e logat")
  Request 2 → Server 2 (nu stie nimic: "cine e userul X?") ← PROBLEMA

STATELESS (scalabil):
  Request 1 → Server 1 (citeste token din header, verifica, raspunde)
  Request 2 → Server 7 (citeste token din header, verifica, raspunde)
  Request 3 → Server 3 (citeste token din header, verifica, raspunde)
  ← orice server poate raspunde, nu conteaza care`,
        usecases: ['REST API-uri', 'Microservicii distribuite', 'Orice sistem cu load balancing'],
        pros: ['orice server poate raspunde la orice request', 'scalare orizontala simpla', 'serverul nu tine sesiuni in memorie'],
        cons: ['fiecare request e mai mare (token adaugat mereu)', 'nu poti face push de la server la client prin HTTP (rezolvat de webhooks)'],
        connections: ['http', 'scalabilitate'],
      },
      {
        conceptKey: 'ssr',
        label: 'SSR',
        subtitle: 'Server-Side Rendering: HTML-ul se naste pe server la fiecare cerere',
        branchIndex: 2,
        sortOrder: 5,
        posX: 58,
        posY: 275,
        explain: [
          'In SSR, la fiecare cerere serverul <strong>construieste HTML-ul complet</strong> — cu date reale, proaspete din baza de date — si il trimite gata catre browser. Browser-ul primeste pagina completa si o afiseaza direct, fara sa mai execute JavaScript pentru continut.',
          'Pentru o platforma de cursuri cu continut dinamic, SSR e raspunsul corect. Cand un utilizator acceseaza /cursul-meu/lectia-3, serverul interogheaza baza de date ("ce lectie e asta? are userul acces? ce progres are?"), asambleaza HTML-ul cu toate datele si il trimite. <em>La click pe urmatoarea lectie, se face un nou request complet</em> — serverul reconstruieste o noua pagina. E mai lent la navigare decat SPA, dar perfect pentru continut personalizat per user.',
          '<strong>De ce SEO e excelent:</strong> un robot Google care acceseaza /cursul-tau vede HTML real cu titlu, descriere, continut complet — il indexeaza imediat si corect. In SPA, robotul ar vedea un div gol si ar trebui sa execute JavaScript ca sa vada ceva, ceea ce Google face partial si cu intarziere. Frameworkuri: Next.js cu getServerSideProps, Nuxt, Laravel, Django, Rails.',
        ],
        diagram: `Browser cere /curs/lectia-3
        ↓
    Server SSR
    ├── query DB: "ce e lectia 3?"
    ├── query DB: "are userul acces?"
    ├── query DB: "ce progres are userul?"
    ├── asambleaza HTML cu toate datele
    └── trimite HTML complet gata
        ↓
Browser afiseaza pagina
Google vede acelasi HTML → SEO corect ✓`,
        usecases: ['Platforme de cursuri cu continut dinamic', 'Magazin online (pagini de produs personalizate)', 'Blog, stiri, orice site indexat pe Google'],
        pros: ['SEO nativ si corect', 'continut dinamic personalizat per user', 'prima incarcare rapida', 'functioneaza fara JavaScript activ in browser'],
        cons: ['fiecare navigare = request nou catre server', 'server mai solicitat', 'experienta mai putin fluida decat SPA la navigare rapida'],
        connections: ['http', 'spa', 'ssg'],
      },
      {
        conceptKey: 'spa',
        label: 'SPA',
        subtitle: 'Single Page Application: browser-ul face toata munca',
        branchIndex: 2,
        sortOrder: 6,
        posX: 58,
        posY: 355,
        explain: [
          'La primul request catre o aplicatie SPA, serverul trimite o pagina HTML aproape goala — un div si un fisier JavaScript mare (bundle). <em>Tot JavaScript-ul aplicatiei</em> vine in acel prim GET. Browser-ul il descarca, il executa, si abia atunci construieste interfata vizibila.',
          'De acolo incolo, <strong>nu mai ceri HTML de la server niciodata.</strong> Cand navighezi intre sectiuni, JavaScript schimba ce se vede pe ecran (manipuleaza DOM-ul direct). Datele vin prin API calls — cereri care returneaza JSON pur, nu HTML. JavaScript insereaza acel JSON in interfata. De aceea navigarea e fluida si instantanea — nu se reincarca pagina.',
          'Avise e SPA. Cand deschizi avise.com primesti o data tot bundle-ul React. Cand navighezi intre module nu se reincarca pagina — JavaScript actualizeaza UI-ul si face API calls pentru date. Asta e popularea despre care intrebai.',
          '<strong>De ce SEO e prost:</strong> Googlebot acceseaza /facturile-mele si vede un div gol. JavaScript-ul care construieste pagina nu ruleaza (sau ruleaza partial si tarziu). Robotul indexeaza un div gol. Solutia e SSR hibrid — Next.js poate face SSR pentru paginile publice si SPA pentru dashboard.',
        ],
        diagram: `Prima incarcare (un singur GET pentru tot JS-ul):
  Browser → GET / → Server trimite index.html + bundle.js (2MB)
  Browser executa JS → construieste tot UI-ul

Navigare la /dashboard (fara request HTTP pentru HTML!):
  JavaScript schimba URL si UI instant
  Browser → GET /api/dashboard-data → { JSON cu date }
  JavaScript populeaza UI cu datele JSON

Ce vede Google:
  GET / → <div id="root"></div>  ← div gol, SEO prost`,
        usecases: ['Avise si alte aplicatii SaaS', 'Dashboard-uri si tool-uri interne', 'Aplicatii complexe unde SEO nu conteaza'],
        pros: ['navigare instant dupa prima incarcare', 'server serveste doar JSON, nu HTML (mai eficient)', 'separare clara frontend/backend'],
        cons: ['prima incarcare lenta (bundle mare de descarcat si executat)', 'SEO prost fara configurare suplimentara', 'mai complex de construit si debuguit'],
        connections: ['ssr', 'ssg', 'http', 'stateless'],
      },
      {
        conceptKey: 'ssg',
        label: 'SSG',
        subtitle: 'Static Site Generation: paginile se nasc o singura data la build',
        branchIndex: 2,
        sortOrder: 7,
        posX: 178,
        posY: 275,
        explain: [
          'SSG genereaza toate paginile HTML <strong>la build time</strong> — inainte ca vreun utilizator sa acceseze site-ul. Rezultatul e un set de fisiere HTML statice, gata de servit. La cerere, serverul nu face nimic: primeste request, trimite fisierul pre-generat. Nu e nicio baza de date, nicio logica de server.',
          'Diferenta critica fata de SSR: in SSR serverul construieste HTML-ul <em>la fiecare cerere</em>, cu date proaspete din DB. In SSG, HTML-ul e construit <em>o singura data la build</em>. Daca datele se schimba (ai adaugat un curs nou), trebuie sa rebuilzi si sa redesfasori.',
          'Limita clara: nu functioneaza pentru continut personalizat per utilizator. <em>Pagina /cursuri</em> e aceeasi pentru toata lumea = SSG. <em>Pagina /progresul-meu</em> e diferita per user = SSR sau SPA cu API calls. Un proiect real combina toate trei: SSG pentru pagini publice, SSR sau SPA pentru cele personalizate.',
        ],
        diagram: `BUILD TIME (o singura data, la fiecare deploy):
  Cod + date → generator → 500 fisiere .html pre-generate

REQUEST TIME (de mii de ori pe zi):
  Browser → CDN → fisier .html gata
  Fara DB, fara calcule, fara server = instant

Combinatie reala:
  avise.com/features  → SSG (aceeasi pt toata lumea)
  avise.com/blog/     → SSG (articole statice)
  avise.com/dashboard → SPA (personalizat, API calls)`,
        usecases: ['Pagini de marketing si landing pages', 'Blog-uri si documentatie', 'Site-uri de prezentare cu continut rar schimbat'],
        pros: ['viteza maxima', 'ieftin de hostuit', 'SEO perfect', 'securitate maxima (nu exista server atacabil)'],
        cons: ['rebuild necesar la orice schimbare de continut', 'nu suporta date personalizate per utilizator', 'nu e potrivit pentru aplicatii dinamice complexe'],
        connections: ['ssr', 'spa', 'cdn'],
      },
      {
        conceptKey: 'cdn',
        label: 'CDN',
        subtitle: 'Retea globala de servere care reduce latenta prin distanta',
        branchIndex: 3,
        sortOrder: 8,
        posX: 178,
        posY: 355,
        explain: [
          'Un CDN (Content Delivery Network) e o retea de sute de servere amplasate geografic in toata lumea. Stocheaza copii ale continutului static — imagini, CSS, JavaScript bundle, fisiere HTML pre-generate — pe toate aceste servere.',
          'Efectul direct asupra latentei: fara CDN, un utilizator din Tokyo trimite cererea ~9.000km pana in Romania si asteapta ~200ms. Cu CDN, imaginea e stocata si pe un server din Tokyo — utilizatorul o primeste de la distanta locala, ~5ms. <em>CDN rezolva latenta cauzata de distanta fizica.</em>',
          'CDN nu e potrivit pentru continut dinamic — datele care difera per user sau per request trebuie sa vina de la serverul real. E ideal pentru assets statice. Avise foloseste CDN pentru bundle-ul React — il descarci rapid de pe cel mai aproape server CDN, o singura data. Provideri: Cloudflare (cel mai comun, plan gratuit), AWS CloudFront, Fastly.',
        ],
        diagram: `Fara CDN:
  User Tokyo ─────────────────── Server Romania
                    ~200ms latenta

Cu CDN:
  User Tokyo ──── CDN Tokyo ───────────── Server Romania
      ~5ms                (sync la fiecare deploy)
  User Londra ─── CDN Londra ──────────── Server Romania
     ~15ms

Ce se pune pe CDN:
  ✓ bundle.js, styles.css, imagini, fonturi, HTML static
  ✗ /api/dashboard-data (dinamic, personal, vine de la server)`,
        usecases: ['Orice site cu utilizatori internationali', 'Assets statice pentru SPA', 'Site-uri SSG', 'Distribuire fisiere mari'],
        pros: ['latenta mult mai mica pentru useri departe de server', 'reduce incarcarea serverului principal', 'rezistenta la atacuri DDoS'],
        cons: ['continut cached poate fi invechit (TTL — trebuie invalidat la deploy)', 'cost suplimentar', 'debugging mai complex'],
        connections: ['ssg', 'latenta'],
      },
      {
        conceptKey: 'webhooks',
        label: 'Webhooks & Retry',
        subtitle: 'Cand serverul vrea sa-ti spuna ceva — fara ca tu sa intrebi',
        branchIndex: 4,
        sortOrder: 9,
        posX: 118,
        posY: 435,
        explain: [
          'HTTP e in mod normal pull: <em>clientul cere, serverul raspunde.</em> Dar uneori un serviciu extern are ceva de anuntat — o plata a fost procesata, un fisier e gata, o eroare a aparut. Tu nu stii cand se intampla, nu poti sa intrebi periodic la infinit. Asta e problema pe care o rezolva webhook-urile.',
          '<strong>Webhook</strong> e un HTTP POST pe care <em>serverul extern il trimite catre un endpoint al tau</em> cand se intampla un eveniment. Tu dai Stripe o adresa: "cand o plata e confirmata, trimite POST la /api/payment-confirmed". Stripe face acel POST cu datele platii. Serverul tau primeste, proceseaza, raspunde cu 200 OK.',
          'Browserul e irelevant pentru webhooks. Daca browserul userului e inchis cand Stripe trimite webhook-ul — <em>nu conteaza.</em> <strong>Serverul tau e destinatarul, nu browser-ul.</strong> Serverul tau ruleaza 24/7. Webhook-ul ajunge, serverul proceseaza si stocheaza in DB. Cand userul redeschide browser-ul, vede starea actualizata. Webhooks sunt mereu intre doua servere.',
          '<strong>Retry mechanism:</strong> daca serverul tau raspunde cu altceva decat 200 (eroare, timeout, server down temporar), Stripe stie ca webhook-ul n-a ajuns — stie din status code-ul HTTP din raspunsul tau. Retrimite dupa 1 minut, dupa 5, dupa 30, dupa cateva ore. Dupa un numar fix de incercari marcheaza ca failed. Mecanismul e simplu: status code 200 = primit, orice altceva = esec, retrimite.',
        ],
        diagram: `PULL (trebuie sa intrebi tu periodic — ineficient):
  Browser → GET /api/payment-status → "pending"
  Browser → GET /api/payment-status → "pending"
  Browser → GET /api/payment-status → "confirmed"

PUSH prin webhook (Stripe iti spune el cand e gata):
  Stripe proceseaza plata
       ↓
  Stripe → POST /api/payment-confirmed → Serverul tau (24/7)
  Serverul tau → 200 OK → Stripe marcheaza ca livrat
  Serverul tau actualizeaza DB → user vede la urmatoarea deschidere

Retry (serverul tau era down 2 minute):
  Stripe → POST → Serverul tau (down) → timeout → retry dupa 1 min
  Stripe → POST → Serverul tau (up)   → 200 OK  → livrat ✓`,
        usecases: ['Notificari de plata (Stripe, PayPal)', 'CI/CD — GitHub notifica Jenkins la push', 'Integrari intre platforme (Zapier, Make)', 'Orice eveniment asincron intre servicii'],
        pros: ['eficient — nu trebuie sa intrebi periodic (no polling)', 'real-time', 'serverul proceseaza indiferent daca userul e activ'],
        cons: ['endpoint-ul tau trebuie sa fie accesibil public', 'trebuie verificata autenticitatea (cineva poate trimite POST fals)', 'debugging mai dificil — evenimentele vin din exterior'],
        connections: ['http', 'stateless'],
      },
    ],
  },
  {
    slug: 'web-patterns',
    title: 'Web Patterns',
    language: 'ro',
    description: 'Patternuri arhitecturale pentru sisteme web moderne: REST, Webhooks, WebSocket, Event-Driven, Retry si mai mult.',
    structureType: 'cells',
    theme: 'dark',
    concepts: [
      {
        conceptKey: 'restapi',
        label: 'REST API',
        subtitle: 'Cerere–Raspuns: tu intrebi, serverul raspunde',
        branchIndex: 0,
        sortOrder: 0,
        posX: 118,
        posY: 45,
        explain: [
          'Un API REST functioneaza pe modelul <strong>cerere–raspuns sincron</strong>: tu trimiti o cerere HTTP, astepti, primesti raspunsul, continui. E cel mai simplu model de integrare intre doua sisteme.',
          'Cand sistemul A vrea date de la sistemul B, A face un request HTTP catre B. B proceseaza si raspunde imediat (in milisecunde sau secunde). <strong>A trebuie sa stie cand sa intrebe</strong> si sa astepte activ raspunsul.',
          'Limitarea fundamentala: daca vrei sa stii cand s-a schimbat ceva pe server, trebuie sa intrebi periodic (<em>polling</em>). Nu exista un mecanism nativ prin care serverul sa te anunte el — de-aci vine nevoia de Webhook si event-driven.',
        ],
        diagram: `Sistem A                    Sistem B
    │                              │
    │── GET /comenzi/status/42 ──► │
    │                              │  proceseaza
    │◄── 200 OK { status: "livrat"}│
    │                              │
   (A stie doar daca intreaba)`,
        usecases: ['Integrari simple intre sisteme', 'CRUD operations (create, read, update, delete)', 'Cand ai nevoie de date la cerere, nu in timp real'],
        pros: ['simplu, universal, usor de testat', 'orice limbaj il suporta', 'usor de debuguit (request–response vizibil)'],
        cons: ['nu poti primi notificari — trebuie sa intrebi tu', 'polling = ineficient si lent', 'coupling strans intre sisteme'],
        connections: ['webhook', 'graphql', 'polling'],
      },
      {
        conceptKey: 'webhook',
        label: 'Webhook',
        subtitle: 'Serverul te anunta el, nu tu il intrebi',
        branchIndex: 0,
        sortOrder: 1,
        posX: 50,
        posY: 120,
        explain: [
          'Un Webhook inverseaza modelul REST: in loc sa intrebi tu periodic "s-a intamplat ceva?", <strong>serverul te anunta el</strong> cand se intampla ceva. Tu inregistrezi o adresa URL la care vrei sa primesti notificari — serverul face un POST catre acea adresa cand apare un eveniment.',
          'Concret: inregistrezi la Stripe URL-ul <em>https://aplicatia-ta.ro/webhooks/stripe</em>. Cand un client plateste, Stripe face imediat un POST catre acea adresa cu detaliile platii. Tu nu trebuie sa intrebi Stripe la fiecare secunda daca a venit o plata.',
          '<strong>Problema principala</strong>: daca aplicatia ta e offline in momentul in care Stripe trimite webhook-ul, il pierzi. De-aci vine nevoia de retry mechanism — Stripe va incerca din nou dupa 1 minut, 5 minute, 30 minute etc.',
          'Webhooks sunt folosite peste tot: Stripe pentru plati, GitHub pentru events pe repository, Slack pentru notificari, Twilio pentru SMS.',
        ],
        diagram: `Fara Webhook (polling):
  Aplicatia → Stripe: "a platit cineva?" (la fiecare 5 sec)
  Aplicatia → Stripe: "a platit cineva?"  ← ineficient
  Aplicatia → Stripe: "a platit cineva?"

Cu Webhook:
  Client plateste pe Stripe
       │
       ▼
  Stripe → POST https://aplicatia-ta.ro/webhooks
           { event: "payment.success", amount: 100 }
  (instant, o singura data, fara polling)`,
        usecases: ['Notificari de plata (Stripe, PayPal)', 'CI/CD declansat de push pe GitHub', 'Sincronizare date intre sisteme', 'Notificari in timp real'],
        pros: ['eficient — serverul anunta doar cand e nevoie', 'timp real', 'fara polling'],
        cons: ['aplicatia ta trebuie sa fie online si sa raspunda rapid', 'greu de testat local', 'necesita retry logic daca receptorul e offline'],
        connections: ['restapi', 'eventdriven', 'retry'],
      },
      {
        conceptKey: 'polling',
        label: 'Polling',
        subtitle: 'Intrebi periodic daca s-a schimbat ceva',
        branchIndex: 0,
        sortOrder: 2,
        posX: 50,
        posY: 195,
        explain: [
          'Polling inseamna sa intrebi serverul la intervale regulate: "s-a schimbat ceva?". E cel mai simplu mecanism pentru a simula date in timp real, dar si cel mai ineficient.',
          '<strong>Short polling</strong>: faci un request la fiecare N secunde. Serverul raspunde imediat, fie cu date noi fie cu "nimic nou". Simplu dar genereaza trafic inutil — 95% din cereri pot fi "nimic nou".',
          '<strong>Long polling</strong>: faci un request, serverul <em>tine conexiunea deschisa</em> pana are ceva de trimis (sau pana expira un timeout). Cand vine un eveniment, serverul raspunde si inchide conexiunea. Tu faci imediat un nou request si astepti din nou. Mai eficient decat short polling, dar tot imperfect.',
          'Cand are sens polling: cand nu ai acces la webhooks sau WebSocket, cand evenimentele sunt rare si latenta nu conteaza, cand sistemul e simplu si nu merita complexitatea alternativelor.',
        ],
        diagram: `Short Polling (ineficient):
  Client ──► Server: "ceva nou?" → "nu"   (t=0s)
  Client ──► Server: "ceva nou?" → "nu"   (t=5s)
  Client ──► Server: "ceva nou?" → "nu"   (t=10s)
  Client ──► Server: "ceva nou?" → "DA!"  (t=15s)

Long Polling (mai eficient):
  Client ──► Server: "ceva nou?"
  Server tine conexiunea deschisa...
  [eveniment apare dupa 12s]
  Server ──► Client: "DA, iata datele"
  Client face imediat un nou request`,
        usecases: ['Sisteme simple fara suport de WebSocket', 'Verificare status job de lunga durata', 'Fallback cand webhooks nu sunt disponibile'],
        pros: ['simplu de implementat', 'functioneaza cu orice server HTTP standard', 'usor de debuguit'],
        cons: ['ineficient — genereaza trafic inutil', 'latenta (intarzie intre poll-uri)', 'solicita serverul cu cereri inutile'],
        connections: ['restapi', 'webhook', 'websocket'],
      },
      {
        conceptKey: 'websocket',
        label: 'WebSocket',
        subtitle: 'Conexiune persistenta bidirectionala',
        branchIndex: 1,
        sortOrder: 3,
        posX: 50,
        posY: 275,
        explain: [
          'HTTP e unidirectional: clientul cere, serverul raspunde, conexiunea se inchide. WebSocket stabileste o <strong>conexiune persistenta, bidirectionala</strong>: odata deschisa, atat clientul cat si serverul pot trimite mesaje oricand, fara sa astepte.',
          'Conexiunea incepe cu un "handshake" HTTP special (Upgrade: websocket). Dupa aceea protocolul se schimba: nu mai e request–response, e un canal deschis permanent in ambele directii.',
          '<strong>Serverul poate trimite date clientului fara ca acesta sa fi cerut ceva.</strong> Asta e imposibil in HTTP clasic — e revolutia WebSocket.',
          'Cand are sens: chat in timp real, colaborare simultana (Google Docs), notificari live, dashboarduri cu date care se actualizeaza continuu, jocuri multiplayer.',
        ],
        diagram: `HTTP clasic:
  Client ──► Server (request)
  Client ◄── Server (response)
  [conexiune inchisa]

WebSocket:
  Client ──► Server (handshake HTTP)
  [conexiune deschisa permanent]
  Client ──► Server: "mesaj de la user"
  Server ──► Client: "mesaj de la alt user"
  Server ──► Client: "notificare noua"
  Client ──► Server: "user a tastat..."
  [conexiunea ramane deschisa]`,
        usecases: ['Chat in timp real (Slack, Discord)', 'Colaborare live (Figma, Google Docs)', 'Dashboarduri cu date live (trading, monitoring)', 'Jocuri multiplayer in browser'],
        pros: ['bidirectional — serverul poate trimite oricand', 'latenta minima (conexiune persistenta)', 'eficient — nu se repeta handshake HTTP'],
        cons: ['conexiunile persistente consuma resurse pe server', 'mai complex de implementat si scalat', 'nu e cacheabil ca HTTP'],
        connections: ['polling', 'eventdriven', 'restapi'],
      },
      {
        conceptKey: 'eventdriven',
        label: 'Event-Driven',
        subtitle: 'Sistemele comunica prin evenimente, nu prin apeluri directe',
        branchIndex: 1,
        sortOrder: 4,
        posX: 50,
        posY: 355,
        explain: [
          'In arhitectura event-driven, sistemele nu se apeleaza direct. In loc de "sistemul A apeleaza sistemul B", avem: <strong>"sistemul A publica un eveniment, sistemul B il consuma cand e disponibil"</strong>.',
          'Un eveniment e o notificare ca ceva s-a intamplat: <em>OrderPlaced</em>, <em>PaymentReceived</em>, <em>UserRegistered</em>. Sistemul care produce evenimentul nu stie cine il consuma — si nici nu ii pasa. Poate fi consumat de un sistem, zece sisteme, sau niciunul.',
          'Intre producator si consumator exista un <strong>message broker</strong> (Kafka, RabbitMQ, AWS SQS) — un intermediar care retine evenimentele pana sunt procesate. Asta decupleaza sistemele: producatorul nu trebuie sa astepte consumatorul, consumatorul poate procesa in ritmul lui.',
          'Marele avantaj: <strong>decuplare</strong>. Poti adauga un nou consumator fara sa modifici producatorul. Poti scala consumatorii independent. Daca un consumator cade, evenimentele se acumuleaza si sunt procesate cand revine.',
        ],
        diagram: `Arhitectura directa (coupling strans):
  OrderService ──► PaymentService
  OrderService ──► InventoryService  ← fragil
  OrderService ──► EmailService

Arhitectura Event-Driven:
  OrderService ──► [OrderPlaced event] ──► Message Broker
                                               │
                     ┌─────────────────────────┼──────────────┐
                     ▼                         ▼              ▼
              PaymentService       InventoryService     EmailService
              (consuma cand         (consuma cand       (consuma cand
               e gata)               e gata)             e gata)`,
        usecases: ['Sisteme cu multe componente independente (microservicii)', 'Procesare asincron (comenzi, plati, emailuri)', 'Audit logs si analytics', 'Integrari intre sisteme care nu pot fi modificate'],
        pros: ['decuplare — sistemele nu se cunosc direct', 'scalare independenta a fiecarei componente', 'rezilienta — un consumator cazut nu blocheaza producatorul'],
        cons: ['mai greu de debuguit (fluxul nu e liniar)', 'consistenta eventuala, nu imediata', 'complexitate operationala (message broker de intretinut)'],
        connections: ['webhook', 'messagequeue', 'websocket'],
      },
      {
        conceptKey: 'messagequeue',
        label: 'Message Queue',
        subtitle: 'Coada care decupleaza producatorul de consumator',
        branchIndex: 1,
        sortOrder: 5,
        posX: 50,
        posY: 435,
        explain: [
          'O message queue e un <strong>intermediar care stocheaza mesaje pana sunt procesate</strong>. Producatorul pune mesaje in coada, consumatorul le ia si le proceseaza in ritmul lui. Cei doi nu interactioneaza direct.',
          'Modelul fundamental: <strong>producer → queue → consumer</strong>. Queue-ul garanteaza ca mesajele nu se pierd chiar daca consumatorul e offline. Cand revine, proceseaza mesajele acumulate.',
          'Un mesaj e <em>acknowledged</em> (confirmat procesat) de consumator abia dupa ce a fost procesat cu succes. Daca consumatorul pica inainte de acknowledge, mesajul ramane in coada si va fi reluat — nu se pierde.',
          'Provideri: <strong>RabbitMQ</strong> (open source, clasic), <strong>AWS SQS</strong> (managed, simplu), <strong>Kafka</strong> (volum extrem de mare, retentie pe termen lung, pub/sub). Kafka e diferit conceptual — mai mult un event log decat o coada clasica.',
        ],
        diagram: `Fara queue (sincron):
  Producer ──► Consumer
  [daca Consumer e offline → mesaj pierdut]
  [daca Consumer e lent → Producer asteapta]

Cu Message Queue:
  Producer ──► [Queue] ◄── Consumer procesa cand poate
               │
               ├─ mesaj 1 (procesat)
               ├─ mesaj 2 (procesat)
               ├─ mesaj 3 (asteapta)  ← consumatorul era offline
               └─ mesaj 4 (asteapta)`,
        usecases: ['Procesare comenzi e-commerce', 'Trimitere emailuri in bulk', 'Procesare imagini/video (resize, transcoding)', 'Orice task care poate astepta si nu trebuie facut sincron'],
        pros: ['mesajele nu se pierd daca consumatorul e offline', 'decupleaza viteza producatorului de cea a consumatorului', 'scalare: mai multi consumatori pentru aceeasi coada'],
        cons: ['consistenta eventuala (nu imediata)', 'mesaje duplicate posibile (daca acknowledge esueaza)', 'infrastructura suplimentara de intretinut'],
        connections: ['eventdriven', 'retry', 'webhook'],
      },
      {
        conceptKey: 'retry',
        label: 'Retry + Backoff',
        subtitle: 'Ce faci cand o operatie esueaza',
        branchIndex: 2,
        sortOrder: 6,
        posX: 186,
        posY: 150,
        explain: [
          'Intr-un sistem distribuit, operatiile esueaza. Reteaua are probleme, un serviciu e suprasolicitat, un server se restarteza. <strong>Retry</strong> inseamna sa incerci din nou automat dupa un esec.',
          'Retry simplu (incearca imediat) e periculos: daca serverul e suprasolicitat si toti clientii incearca din nou instantaneu, ii dai si mai mult trafic si agravezi problema. De-aci vine <strong>Exponential Backoff</strong>: cresti intervalul intre retry-uri exponential.',
          'Formula: primul retry dupa 1s, al doilea dupa 2s, al treilea dupa 4s, al patrulea dupa 8s, etc. Plus un element de <strong>jitter</strong> (variatie aleatorie) ca nu toti clientii sa retry simultan.',
          '<strong>Max retries</strong> si <strong>dead letter queue</strong>: dupa un numar maxim de incercari, renunti. Mesajul esuat merge intr-o coada separata (dead letter queue) pentru investigatie manuala sau procesare ulterioara.',
        ],
        diagram: `Retry cu Exponential Backoff:

  t=0s   → request → ESEC (server down)
  t=1s   → retry 1 → ESEC
  t=3s   → retry 2 → ESEC
  t=7s   → retry 3 → ESEC
  t=15s  → retry 4 → SUCCES ✓

  (cu jitter: +/- random pentru a distribui traficul)

  Dupa max retries → Dead Letter Queue
  ┌─────────────────────────────────────┐
  │ mesaje care au esuat definitiv      │
  │ → alerta, investigatie manuala      │
  └─────────────────────────────────────┘`,
        usecases: ['Apeluri HTTP intre microservicii', 'Procesare mesaje din queue', 'Retry webhook-uri (Stripe, GitHub fac asta automat)', 'Orice operatie care poate esua tranzitoriu'],
        pros: ['rezilienta la erori temporare', 'transparent pentru utilizator daca retry reuseste', 'reduce impactul erorilor de retea'],
        cons: ['operatia trebuie sa fie idempotenta (retry de doua ori = acelasi rezultat)', 'poate masca probleme reale', 'complexitate in implementare'],
        connections: ['webhook', 'messagequeue', 'circuitbreaker'],
      },
      {
        conceptKey: 'circuitbreaker',
        label: 'Circuit Breaker',
        subtitle: 'Opreste-te din a incerca cand stii ca va esua',
        branchIndex: 2,
        sortOrder: 7,
        posX: 186,
        posY: 260,
        explain: [
          'Retry e util pentru erori temporare. Dar daca serviciul extern e complet cazut pentru 30 de minute, sa incerci la infinit e inutil si consuma resurse. <strong>Circuit Breaker</strong> rezolva asta.',
          'Functioneaza ca un intrerupator electric: are trei stari. <em>Closed</em> (normal): cererile trec. <em>Open</em>: serviciul e considerat cazut, toate cererile esueaza imediat fara sa mai incerce — economia timp si resurse. <em>Half-Open</em>: lasi o cerere de test sa treaca; daca reuseste, revii la Closed; daca esueaza, ramai Open.',
          'Tranzitia Closed → Open se face cand procentul de erori depaseste un prag (ex: 50% din ultimele 20 de cereri au esuat). Tranzitia Open → Half-Open se face dupa un timeout (ex: dupa 30 de secunde).',
          'Implementat in: <strong>Resilience4j</strong> (Java), <strong>Polly</strong> (.NET), <strong>Hystrix</strong> (Netflix, acum deprecated). Service mesh-uri ca <strong>Istio</strong> il implementeaza transparent, fara cod.',
        ],
        diagram: `CLOSED (normal):
  Client ──► Circuit Breaker ──► Serviciu extern
  [monitorizeaza rata de erori]
  [erori > 50%] → trece in OPEN

OPEN (serviciu cazut):
  Client ──► Circuit Breaker ──✗ (esec imediat, nu mai incearca)
  [dupa 30s timeout] → trece in HALF-OPEN

HALF-OPEN (test):
  Client ──► Circuit Breaker ──► Serviciu extern
  [succes] → CLOSED
  [esec]   → OPEN (inca 30s)`,
        usecases: ['Microservicii care depind unele de altele', 'Apeluri catre API-uri externe', 'Orice sistem unde un serviciu cazut poate cascada esecuri in lant'],
        pros: ['previne cascade failures', 'fail fast — eroare imediata in loc de timeout lung', 'permite serviciului extern sa se recupereze'],
        cons: ['complexitate suplimentara', 'starea circuitului trebuie partajata intre instante (dificil in sisteme distribuite)', 'tuning dificil al pragurilor'],
        connections: ['retry', 'eventdriven'],
      },
      {
        conceptKey: 'graphql',
        label: 'GraphQL',
        subtitle: 'Tu ceri exact ce date vrei, nimic mai mult',
        branchIndex: 3,
        sortOrder: 8,
        posX: 186,
        posY: 380,
        explain: [
          'In REST, serverul decide ce date trimite la fiecare endpoint. Vrei un profil de user? Primesti toate campurile, chiar daca tu ai nevoie doar de nume si avatar. Vrei date de la resurse multiple? Faci cereri multiple. GraphQL inverseaza controlul: <strong>clientul specifica exact ce campuri vrea</strong>.',
          'Exista un singur endpoint (<em>/graphql</em>). Clientul trimite o "query" care descrie exact structura datelor dorite. Serverul raspunde cu exact acea structura — nimic in plus.',
          'Rezolva doua probleme clasice ale REST: <strong>over-fetching</strong> (primesti prea multe date) si <strong>under-fetching</strong> (ai nevoie de mai multe request-uri pentru date legate).',
          'GraphQL suporta si <strong>subscriptions</strong> — echivalentul WebSocket pentru date in timp real. Clientul se aboneaza la un eveniment si primeste update-uri automat. Creat de Facebook, folosit de GitHub, Shopify, Twitter.',
        ],
        diagram: `REST (serverul decide):
  GET /users/1    → { id, name, email, address, phone, avatar, ... }
  GET /users/1/posts → { posts array... }
  (2 request-uri, date in plus)

GraphQL (clientul decide):
  POST /graphql
  query {
    user(id: 1) {
      name
      avatar
      posts { title }
    }
  }
  → exact { name, avatar, posts: [{title}] }
  (1 request, exact ce ai cerut)`,
        usecases: ['Aplicatii mobile (bandwidth limitat — ceri exact ce ai nevoie)', 'Frontend-uri complexe cu multe tipuri de date', 'API-uri publice cu clienti diversi (fiecare cere ce are nevoie)', 'Sisteme cu date interconectate complex'],
        pros: ['elimina over-fetching si under-fetching', 'un singur endpoint', 'schema auto-documentata', 'subscriptions pentru real-time'],
        cons: ['mai complex de implementat pe server', 'caching mai dificil decat REST (nu mai e GET simplu)', 'query-uri complexe pot suprasolicita serverul', 'overhead pentru API-uri simple'],
        connections: ['restapi', 'websocket'],
      },
    ],
  },
];

// ── Seed logic ────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Seeding courses...');

  for (const courseData of COURSES) {
    const { concepts: conceptsData, ...courseFields } = courseData;

    // Upsert course
    const [course] = await db
      .insert(schema.courses)
      .values(courseFields)
      .onConflictDoUpdate({
        target: schema.courses.slug,
        set: { title: courseFields.title, theme: courseFields.theme },
      })
      .returning();

    console.log(`  ✓ Course: ${course.slug} (${course.id})`);

    // Insert concepts
    const insertedConcepts: Record<string, string> = {}; // conceptKey → id

    for (const { connections: _connections, ...conceptFields } of conceptsData) {
      const [concept] = await db
        .insert(schema.concepts)
        .values({ ...conceptFields, courseId: course.id })
        .onConflictDoUpdate({
          target: [schema.concepts.courseId, schema.concepts.conceptKey],
          set: { label: conceptFields.label, subtitle: conceptFields.subtitle },
        })
        .returning();

      insertedConcepts[concept.conceptKey] = concept.id;
      console.log(`    ✓ Concept: ${concept.conceptKey}`);
    }

    // Insert connections (bidirectional dedup via primary key)
    for (const conceptData of conceptsData) {
      const fromId = insertedConcepts[conceptData.conceptKey];
      for (const toKey of conceptData.connections) {
        const toId = insertedConcepts[toKey];
        if (!toId) {
          console.warn(`    ⚠ Connection target not found: ${toKey}`);
          continue;
        }
        // Only insert once per pair (smaller uuid first to deduplicate)
        const [a, b] = [fromId, toId].sort();
        await db
          .insert(schema.conceptConnections)
          .values({ fromConceptId: a, toConceptId: b })
          .onConflictDoNothing();
      }
    }
    console.log(`    ✓ Connections inserted`);
  }

  console.log('✅ Done.');
  await client.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
