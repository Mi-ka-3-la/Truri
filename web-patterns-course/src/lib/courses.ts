export interface ConceptNode {
  id: string;
  label: string;
  subtitle: string;
  branchIndex: number;
  gradient: string;        // tailwind gradient e.g. 'from-cyan-500 to-blue-500'
  category: string;        // sidebar group label
  position: { x: number; y: number };  // 0–100 percentages for SVG
  connections: string[];   // concept keys
  explain: string[];       // HTML strings
  diagram?: string;
  usecases: string[];
  pros: string[];
  cons: string[];
}

export interface CourseData {
  slug: string;
  title: string;
  language: string;
  description: string;
  theme: 'light' | 'dark';
  concepts: ConceptNode[];
}

const BRANCH_GRADIENTS_ARHI = [
  'from-red-500 to-rose-400',     // 0
  'from-blue-500 to-indigo-400',  // 1
  'from-emerald-500 to-green-400',// 2
  'from-purple-500 to-violet-400',// 3
  'from-amber-500 to-orange-400', // 4
];
const BRANCH_CATS_ARHI = ['Fundamente', 'HTTP & Stat', 'Rendering', 'Scalare', 'Events'];

const BRANCH_GRADIENTS_WP = [
  'from-cyan-500 to-blue-500',    // 0
  'from-pink-500 to-rose-500',    // 1
  'from-orange-500 to-amber-500', // 2
  'from-yellow-500 to-lime-500',  // 3
];
const BRANCH_CATS_WP = ['Request-Response', 'Real-time', 'Resilience', 'Query'];

export const COURSES: CourseData[] = [
  // ─── Arhitecturi Web ────────────────────────────────────────────────────────
  {
    slug: 'arhitecturi-web',
    title: 'Arhitecturi Web',
    language: 'ro',
    description: 'Client-Server, HTTP, SSR, SPA, CDN, Webhooks — modelele de baza ale oricarei aplicatii web.',
    theme: 'light',
    concepts: [
      {
        id: 'clientserver',
        label: 'Client–Server',
        subtitle: 'Un model arhitectural — nu o tehnologie, nu neaparat internet',
        branchIndex: 0,
        gradient: BRANCH_GRADIENTS_ARHI[0],
        category: BRANCH_CATS_ARHI[0],
        position: { x: 50.0, y: 8.2 },
        connections: ['latenta', 'http', 'scalabilitate'],
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
      },
      {
        id: 'latenta',
        label: 'Latenta & Bottleneck',
        subtitle: 'De ce uneori e lent si de ce serverul se sufoca',
        branchIndex: 0,
        gradient: BRANCH_GRADIENTS_ARHI[0],
        category: BRANCH_CATS_ARHI[0],
        position: { x: 24.6, y: 22.9 },
        connections: ['clientserver', 'scalabilitate', 'cdn'],
        explain: [
          '<strong>Latenta</strong> e timpul care trece intre momentul in care clientul trimite cererea si momentul in care primeste primul byte de raspuns. Se masoara in milisecunde. Nu e viteza de download — e <em>timpul de asteptare.</em> Un server din Romania raspunde unui utilizator din Tokyo in ~200ms indiferent cat de rapid e internetul utilizatorului.',
          '<strong>Bottleneck</strong> inseamna literal "gatul sticlei" — un punct unic prin care trebuie sa treaca tot traficul si care limiteaza debitul intregului sistem. Daca ai un singur server care poate procesa 1.000 de cereri pe secunda, dar primesti 10.000, celelalte 9.000 asteapta la coada sau primesc eroare 503 (Service Unavailable).',
          'Latenta si bottleneck sunt <em>probleme diferite cu solutii diferite.</em> Latenta e o problema de distanta fizica — se rezolva cu CDN sau servere mai aproape de utilizator. Bottleneck-ul e o problema de capacitate — se rezolva cu mai multe servere si load balancing.',
        ],
        diagram: `Latenta (distanta fizica):
  User Tokyo → cerere → Server Romania
               ~200ms dus + ~200ms intors = 400ms

Bottleneck (capacitate):
  10.000 cereri/secunda
         ↓
  [Server: capacitate 1.000/secunda]
         ↓
  9.000 cereri: timeout → eroare 503`,
        usecases: ['Diagnosticare: "de ce e lent?"', 'Decizie: CDN vs mai multe servere', 'Intelegerea erorilor 503, 504'],
        pros: [],
        cons: [],
      },
      {
        id: 'scalabilitate',
        label: 'Scalabilitate',
        subtitle: 'Load balancing, Kubernetes si distribuirea cererilor',
        branchIndex: 3,
        gradient: BRANCH_GRADIENTS_ARHI[3],
        category: BRANCH_CATS_ARHI[3],
        position: { x: 75.4, y: 22.9 },
        connections: ['latenta', 'clientserver', 'stateless'],
        explain: [
          '<strong>Scalare verticala</strong> inseamna sa dai serverului mai multa memorie si CPU. Are limite fizice si devine scump rapid. <strong>Scalare orizontala</strong> inseamna sa adaugi mai multe servere identice care impart incarcatura. Asta e ce se foloseste in productie pentru sisteme mari.',
          '<strong>Load balancer</strong> sta in fata tuturor serverelor si distribuie cererile intre ele. Primeste 10.000 de cereri/secunda si le trimite echilibrat catre 10 servere — 1.000 fiecare. Cererile se distribuie: <em>round-robin</em>, <em>least connections</em>, sau <em>geographic routing</em>.',
          '<strong>Kubernetes</strong> e un orchestrator care gestioneaza containere. Stie sa <em>adauge servere automat</em> cand incarcatura creste (autoscaling) si sa le <em>opreasca</em> cand scade — infrastructura care se adapteaza singura la trafic.',
        ],
        diagram: `Fara scalare:
  10.000 useri → [Server 1] → sufocat, 503

Cu load balancer:
  10.000 useri → [Load Balancer]
                       ├── [Server 1]  round-robin
                       ├── [Server 2]  sau least-connections
                       └── [Server 3]  sau geographic

Kubernetes + autoscaling:
  Trafic mic   →  2 servere active
  Spike trafic →  Kubernetes porneste automat 8 servere`,
        usecases: ['SaaS-uri cu multi clienti', 'Aplicatii cu trafic variabil', 'Black Friday / spike-uri de trafic'],
        pros: ['suporta orice volum de trafic teoretic', 'costuri proportionale cu utilizarea', 'rezistenta la caderea unui server'],
        cons: ['complexitate infrastructura mult mai mare', 'sesiunile user trebuie gestionate stateless', 'debugging mai dificil'],
      },
      {
        id: 'http',
        label: 'HTTP / HTTPS',
        subtitle: 'Anatomia fiecarei comunicari dintre client si server',
        branchIndex: 1,
        gradient: BRANCH_GRADIENTS_ARHI[1],
        category: BRANCH_CATS_ARHI[1],
        position: { x: 24.6, y: 39.8 },
        connections: ['clientserver', 'stateless', 'ssr', 'spa', 'webhooks'],
        explain: [
          'Orice comunicare HTTP — <em>absolut orice</em> — are: o <strong>metoda</strong> (ce vrei sa faci), o <strong>adresa URL</strong> (unde), si <strong>headere</strong> (metadate: cine esti, ce format accepti, token-ul de autentificare). Body-ul e optional: GET nu are body, POST si PUT au body cu datele.',
          'Cand bagi un URL in browser si apesi Enter, browser-ul trimite automat un <strong>GET request</strong>. Click pe un link = GET. Form submit = POST. Toate sunt HTTP requests cu metoda, URL si headere.',
          'Raspunsul are intotdeauna un <strong>status code</strong>: 200 OK, 201 creat, 400 cererea ta e gresita, 401 neautentificat, 403 fara acces, 404 resursa nu exista, 500 eroare pe server.',
          '<strong>HTTPS</strong> e HTTP cu criptare TLS. Tot ce trimiti e criptat in tranzit — ISP-ul tau, un hacker pe acelasi WiFi, nimeni nu poate citi continutul.',
        ],
        diagram: `URL in browser → GET automat:
  GET /dashboard HTTP/1.1
  Host: avise.com
  Authorization: Bearer eyJhbGc...
  Accept: text/html

Form submit sau API call → POST cu body:
  POST /api/invoices HTTP/1.1
  Content-Type: application/json
  { "amount": 1500, "client": "Acme SRL" }

Raspuns intotdeauna cu status code:
  HTTP/1.1 201 Created`,
        usecases: ['Orice comunicare browser-server', 'API calls intre servicii', 'Download si upload fisiere'],
        pros: ['universal — orice limbaj il suporta', 'simplu de debuguit in DevTools (tab Network)', 'stateless — usor de scalat'],
        cons: ['stateless — necesita token la fiecare request', 'pull-only — serverul nu poate initia comunicarea'],
      },
      {
        id: 'stateless',
        label: 'Stateless',
        subtitle: 'Serverul nu tine minte cine esti — si de ce asta e bine',
        branchIndex: 1,
        gradient: BRANCH_GRADIENTS_ARHI[1],
        category: BRANCH_CATS_ARHI[1],
        position: { x: 75.4, y: 39.8 },
        connections: ['http', 'scalabilitate'],
        explain: [
          '<strong>Stateless</strong> inseamna ca serverul nu tine minte conversatia anterioara. Dupa ce ti-a raspuns la un request, te-a uitat complet. Urmatorul request il trateaza ca si cum te-ar vedea pentru prima data.',
          'Consecinta: <em>fiecare request trebuie sa contina tot ce serverul are nevoie ca sa raspunda</em>. Inclusiv cine esti. De aceea in fiecare API call ai in header un <strong>token de autentificare</strong> (JWT).',
          'De ce stateless = scalabil? Daca serverul nu tine stare despre tine, <em>oricare dintre cele 10 servere din spatele load balancer-ului poate raspunde la cererea ta.</em> Nu conteaza la care server ai vorbit ultima data.',
        ],
        diagram: `STATEFUL (problematic la scalare):
  Request 1 → Server 1 (memoreaza: "userul X e logat")
  Request 2 → Server 2 (nu stie nimic: "cine e X?") ← PROBLEMA

STATELESS (scalabil):
  Request 1 → Server 1 (citeste token, verifica, raspunde)
  Request 2 → Server 7 (citeste token, verifica, raspunde)
  ← orice server poate raspunde, nu conteaza care`,
        usecases: ['REST API-uri', 'Microservicii distribuite', 'Orice sistem cu load balancing'],
        pros: ['orice server poate raspunde la orice request', 'scalare orizontala simpla', 'serverul nu tine sesiuni in memorie'],
        cons: ['fiecare request e mai mare (token adaugat mereu)', 'nu poti face push de la server la client'],
      },
      {
        id: 'ssr',
        label: 'SSR',
        subtitle: 'Server-Side Rendering: HTML-ul se naste pe server la fiecare cerere',
        branchIndex: 2,
        gradient: BRANCH_GRADIENTS_ARHI[2],
        category: BRANCH_CATS_ARHI[2],
        position: { x: 24.6, y: 56.1 },
        connections: ['http', 'spa', 'ssg'],
        explain: [
          'In SSR, la fiecare cerere serverul <strong>construieste HTML-ul complet</strong> — cu date reale, proaspete din baza de date — si il trimite gata catre browser. Browser-ul primeste pagina completa si o afiseaza direct.',
          'Cand un utilizator acceseaza /cursul-meu/lectia-3, serverul interogheaza baza de date, asambleaza HTML-ul cu toate datele si il trimite. <em>La click pe urmatoarea lectie, se face un nou request complet</em>.',
          '<strong>De ce SEO e excelent:</strong> un robot Google care acceseaza pagina ta vede HTML real cu titlu, descriere, continut complet — il indexeaza imediat. Frameworkuri: Next.js, Nuxt, Laravel, Django, Rails.',
        ],
        diagram: `Browser cere /curs/lectia-3
        ↓
    Server SSR
    ├── query DB: "ce e lectia 3?"
    ├── query DB: "are userul acces?"
    ├── asambleaza HTML cu toate datele
    └── trimite HTML complet gata
        ↓
Browser afiseaza pagina — Google vede acelasi HTML ✓`,
        usecases: ['Platforme de cursuri cu continut dinamic', 'Magazin online (pagini de produs)', 'Blog, stiri, orice site indexat pe Google'],
        pros: ['SEO nativ si corect', 'continut dinamic personalizat per user', 'prima incarcare rapida'],
        cons: ['fiecare navigare = request nou catre server', 'server mai solicitat', 'experienta mai putin fluida decat SPA'],
      },
      {
        id: 'spa',
        label: 'SPA',
        subtitle: 'Single Page Application: browser-ul face toata munca',
        branchIndex: 2,
        gradient: BRANCH_GRADIENTS_ARHI[2],
        category: BRANCH_CATS_ARHI[2],
        position: { x: 24.6, y: 72.4 },
        connections: ['ssr', 'ssg', 'http', 'stateless'],
        explain: [
          'La primul request catre o aplicatie SPA, serverul trimite o pagina HTML aproape goala — un div si un fisier JavaScript mare (bundle). <em>Tot JavaScript-ul aplicatiei</em> vine in acel prim GET.',
          'De acolo incolo, <strong>nu mai ceri HTML de la server niciodata.</strong> Cand navighezi intre sectiuni, JavaScript schimba ce se vede pe ecran. Datele vin prin API calls — cereri care returneaza JSON pur, nu HTML.',
          '<strong>De ce SEO e prost:</strong> Googlebot acceseaza pagina ta si vede un div gol. JavaScript-ul care construieste pagina nu ruleaza. Solutia e SSR hibrid — Next.js poate face SSR pentru pagini publice si SPA pentru dashboard.',
        ],
        diagram: `Prima incarcare (un singur GET pentru tot JS-ul):
  Browser → GET / → Server trimite index.html + bundle.js
  Browser executa JS → construieste tot UI-ul

Navigare la /dashboard (fara request HTTP pentru HTML!):
  JavaScript schimba URL si UI instant
  Browser → GET /api/dashboard-data → { JSON }

Ce vede Google:
  GET / → <div id="root"></div>  ← div gol, SEO prost`,
        usecases: ['Aplicatii SaaS', 'Dashboard-uri si tool-uri interne', 'Aplicatii complexe unde SEO nu conteaza'],
        pros: ['navigare instant dupa prima incarcare', 'server serveste doar JSON (mai eficient)', 'separare clara frontend/backend'],
        cons: ['prima incarcare lenta (bundle mare)', 'SEO prost fara configurare suplimentara', 'mai complex de construit'],
      },
      {
        id: 'ssg',
        label: 'SSG',
        subtitle: 'Static Site Generation: paginile se nasc o singura data la build',
        branchIndex: 2,
        gradient: BRANCH_GRADIENTS_ARHI[2],
        category: BRANCH_CATS_ARHI[2],
        position: { x: 75.4, y: 56.1 },
        connections: ['ssr', 'spa', 'cdn'],
        explain: [
          'SSG genereaza toate paginile HTML <strong>la build time</strong> — inainte ca vreun utilizator sa acceseze site-ul. Rezultatul e un set de fisiere HTML statice, gata de servit. La cerere, serverul nu face nimic: primeste request, trimite fisierul pre-generat.',
          'Diferenta critica fata de SSR: in SSR serverul construieste HTML-ul <em>la fiecare cerere</em>. In SSG, HTML-ul e construit <em>o singura data la build</em>. Daca datele se schimba, trebuie sa rebuilzi.',
          'Limita clara: nu functioneaza pentru continut personalizat per utilizator. Pagina /cursuri e aceeasi pentru toata lumea = SSG. Pagina /progresul-meu e diferita per user = SSR sau SPA.',
        ],
        diagram: `BUILD TIME (o singura data, la fiecare deploy):
  Cod + date → generator → 500 fisiere .html pre-generate

REQUEST TIME (de mii de ori pe zi):
  Browser → CDN → fisier .html gata
  Fara DB, fara calcule, fara server = instant`,
        usecases: ['Pagini de marketing si landing pages', 'Blog-uri si documentatie', 'Site-uri cu continut rar schimbat'],
        pros: ['viteza maxima', 'ieftin de hostuit', 'SEO perfect', 'securitate maxima'],
        cons: ['rebuild necesar la orice schimbare', 'nu suporta date personalizate per user', 'nu e potrivit pentru aplicatii dinamice'],
      },
      {
        id: 'cdn',
        label: 'CDN',
        subtitle: 'Retea globala de servere care reduce latenta prin distanta',
        branchIndex: 3,
        gradient: BRANCH_GRADIENTS_ARHI[3],
        category: BRANCH_CATS_ARHI[3],
        position: { x: 75.4, y: 72.4 },
        connections: ['ssg', 'latenta'],
        explain: [
          'Un CDN (Content Delivery Network) e o retea de sute de servere amplasate geografic in toata lumea. Stocheaza copii ale continutului static — imagini, CSS, JavaScript bundle — pe toate aceste servere.',
          'Efectul: fara CDN, un utilizator din Tokyo asteapta ~200ms. Cu CDN, imaginea e stocata pe un server din Tokyo — utilizatorul o primeste local, ~5ms. <em>CDN rezolva latenta cauzata de distanta fizica.</em>',
          'CDN nu e potrivit pentru continut dinamic — datele care difera per user trebuie sa vina de la serverul real. Provideri: Cloudflare (cel mai comun, plan gratuit), AWS CloudFront, Fastly.',
        ],
        diagram: `Fara CDN:
  User Tokyo ──────────────── Server Romania (~200ms)

Cu CDN:
  User Tokyo ── CDN Tokyo ─── Server Romania (~5ms)
  User Londra ─ CDN Londra ── Server Romania (~15ms)

Ce se pune pe CDN:
  ✓ bundle.js, styles.css, imagini, fonturi
  ✗ /api/dashboard-data (dinamic, vine de la server)`,
        usecases: ['Orice site cu utilizatori internationali', 'Assets statice pentru SPA', 'Site-uri SSG'],
        pros: ['latenta mult mai mica pentru useri departe', 'reduce incarcarea serverului principal', 'rezistenta la DDoS'],
        cons: ['continut cached poate fi invechit (TTL)', 'cost suplimentar', 'debugging mai complex'],
      },
      {
        id: 'webhooks',
        label: 'Webhooks & Retry',
        subtitle: 'Cand serverul vrea sa-ti spuna ceva — fara ca tu sa intrebi',
        branchIndex: 4,
        gradient: BRANCH_GRADIENTS_ARHI[4],
        category: BRANCH_CATS_ARHI[4],
        position: { x: 50.0, y: 88.8 },
        connections: ['http', 'stateless'],
        explain: [
          'HTTP e in mod normal pull: <em>clientul cere, serverul raspunde.</em> Dar uneori un serviciu extern are ceva de anuntat — o plata a fost procesata, un fisier e gata. Tu nu stii cand se intampla.',
          '<strong>Webhook</strong> e un HTTP POST pe care <em>serverul extern il trimite catre un endpoint al tau</em> cand se intampla un eveniment. Tu dai Stripe o adresa: "cand o plata e confirmata, trimite POST la /api/payment-confirmed".',
          '<strong>Retry mechanism:</strong> daca serverul tau raspunde cu altceva decat 200, Stripe stie ca webhook-ul n-a ajuns. Retrimite dupa 1 minut, dupa 5, dupa 30. Status code 200 = primit, orice altceva = esec, retrimite.',
        ],
        diagram: `PULL (trebuie sa intrebi tu periodic — ineficient):
  Browser → GET /api/payment-status → "pending" x3...

PUSH prin webhook:
  Stripe proceseaza plata
       ↓
  Stripe → POST /api/payment-confirmed → Serverul tau
  Serverul tau → 200 OK → Stripe marcheaza ca livrat

Retry (serverul tau era down 2 minute):
  Stripe → POST → down → timeout → retry dupa 1 min
  Stripe → POST → up   → 200 OK  → livrat ✓`,
        usecases: ['Notificari de plata (Stripe, PayPal)', 'CI/CD — GitHub notifica la push', 'Integrari intre platforme'],
        pros: ['eficient — nu trebuie sa intrebi periodic', 'real-time', 'serverul proceseaza indiferent daca userul e activ'],
        cons: ['endpoint-ul tau trebuie sa fie accesibil public', 'trebuie verificata autenticitatea', 'debugging mai dificil'],
      },
    ],
  },

  // ─── Web Patterns ────────────────────────────────────────────────────────────
  {
    slug: 'web-patterns',
    title: 'Web Patterns',
    language: 'ro',
    description: 'REST, Webhooks, WebSocket, Event-Driven, Retry, Circuit Breaker, GraphQL — patternurile oricarui sistem modern.',
    theme: 'dark',
    concepts: [
      {
        id: 'restapi',
        label: 'REST API',
        subtitle: 'Cerere–Raspuns: tu intrebi, serverul raspunde',
        branchIndex: 0,
        gradient: BRANCH_GRADIENTS_WP[0],
        category: BRANCH_CATS_WP[0],
        position: { x: 50.0, y: 7.6 },
        connections: ['webhook', 'graphql', 'polling'],
        explain: [
          'Un API REST functioneaza pe modelul <strong>cerere–raspuns sincron</strong>: tu trimiti o cerere HTTP, astepti, primesti raspunsul, continui. E cel mai simplu model de integrare intre doua sisteme.',
          'Cand sistemul A vrea date de la sistemul B, A face un request HTTP catre B. B proceseaza si raspunde imediat. <strong>A trebuie sa stie cand sa intrebe</strong> si sa astepte activ raspunsul.',
          'Limitarea fundamentala: daca vrei sa stii cand s-a schimbat ceva pe server, trebuie sa intrebi periodic (<em>polling</em>). Nu exista un mecanism nativ prin care serverul sa te anunte el.',
        ],
        diagram: `Sistem A                    Sistem B
    │                              │
    │── GET /comenzi/status/42 ──► │
    │                              │  proceseaza
    │◄── 200 OK { status: "livrat"}│
    │
   (A stie doar daca intreaba)`,
        usecases: ['Integrari simple intre sisteme', 'CRUD operations', 'Cand ai nevoie de date la cerere, nu in timp real'],
        pros: ['simplu, universal, usor de testat', 'orice limbaj il suporta', 'usor de debuguit'],
        cons: ['nu poti primi notificari — trebuie sa intrebi tu', 'polling = ineficient si lent', 'coupling strans intre sisteme'],
      },
      {
        id: 'webhook',
        label: 'Webhook',
        subtitle: 'Serverul te anunta el, nu tu il intrebi',
        branchIndex: 0,
        gradient: BRANCH_GRADIENTS_WP[0],
        category: BRANCH_CATS_WP[0],
        position: { x: 21.2, y: 20.3 },
        connections: ['restapi', 'eventdriven', 'retry'],
        explain: [
          'Un Webhook inverseaza modelul REST: <strong>serverul te anunta el</strong> cand se intampla ceva. Tu inregistrezi o adresa URL la care vrei sa primesti notificari — serverul face un POST catre acea adresa.',
          'Concret: inregistrezi la Stripe URL-ul tau. Cand un client plateste, Stripe face imediat un POST cu detaliile platii. Tu nu trebuie sa intrebi Stripe la fiecare secunda.',
          '<strong>Problema principala</strong>: daca aplicatia ta e offline, pierzi webhook-ul. De-aci vine nevoia de retry mechanism — Stripe va incerca din nou dupa 1 minut, 5 minute, 30 minute.',
        ],
        diagram: `Fara Webhook (polling):
  Aplicatia → Stripe: "a platit cineva?" (la fiecare 5 sec)
  Aplicatia → Stripe: "a platit cineva?"  ← ineficient

Cu Webhook:
  Client plateste pe Stripe
       ↓
  Stripe → POST https://app-ta.ro/webhooks
           { event: "payment.success", amount: 100 }
  (instant, o singura data, fara polling)`,
        usecases: ['Notificari de plata (Stripe, PayPal)', 'CI/CD declansat de push pe GitHub', 'Sincronizare date intre sisteme'],
        pros: ['eficient — serverul anunta doar cand e nevoie', 'timp real', 'fara polling'],
        cons: ['aplicatia ta trebuie sa fie online', 'greu de testat local', 'necesita retry logic'],
      },
      {
        id: 'polling',
        label: 'Polling',
        subtitle: 'Intrebi periodic daca s-a schimbat ceva',
        branchIndex: 0,
        gradient: BRANCH_GRADIENTS_WP[0],
        category: BRANCH_CATS_WP[0],
        position: { x: 21.2, y: 33.1 },
        connections: ['restapi', 'webhook', 'websocket'],
        explain: [
          'Polling inseamna sa intrebi serverul la intervale regulate: "s-a schimbat ceva?". E cel mai simplu mecanism pentru a simula date in timp real, dar si cel mai ineficient.',
          '<strong>Short polling</strong>: faci un request la fiecare N secunde. Serverul raspunde imediat. Simplu dar genereaza trafic inutil — 95% din cereri pot fi "nimic nou".',
          '<strong>Long polling</strong>: faci un request, serverul <em>tine conexiunea deschisa</em> pana are ceva de trimis. Cand vine un eveniment, serverul raspunde si inchide conexiunea. Mai eficient decat short polling.',
        ],
        diagram: `Short Polling (ineficient):
  Client → Server: "ceva nou?" → "nu"   (t=0s)
  Client → Server: "ceva nou?" → "nu"   (t=5s)
  Client → Server: "ceva nou?" → "DA!"  (t=15s)

Long Polling (mai eficient):
  Client → Server: "ceva nou?"
  Server tine conexiunea deschisa... (12s)
  Server → Client: "DA, iata datele"
  Client face imediat un nou request`,
        usecases: ['Sisteme simple fara suport de WebSocket', 'Verificare status job de lunga durata', 'Fallback cand webhooks nu sunt disponibile'],
        pros: ['simplu de implementat', 'functioneaza cu orice server HTTP', 'usor de debuguit'],
        cons: ['ineficient — genereaza trafic inutil', 'latenta (intarzie intre poll-uri)', 'solicita serverul cu cereri inutile'],
      },
      {
        id: 'websocket',
        label: 'WebSocket',
        subtitle: 'Conexiune persistenta bidirectionala',
        branchIndex: 1,
        gradient: BRANCH_GRADIENTS_WP[1],
        category: BRANCH_CATS_WP[1],
        position: { x: 21.2, y: 46.6 },
        connections: ['polling', 'eventdriven', 'restapi'],
        explain: [
          'HTTP e unidirectional: clientul cere, serverul raspunde, conexiunea se inchide. WebSocket stabileste o <strong>conexiune persistenta, bidirectionala</strong>: odata deschisa, atat clientul cat si serverul pot trimite mesaje oricand.',
          'Conexiunea incepe cu un "handshake" HTTP special (Upgrade: websocket). Dupa aceea protocolul se schimba: nu mai e request–response, e un canal deschis permanent.',
          '<strong>Serverul poate trimite date clientului fara ca acesta sa fi cerut ceva.</strong> Asta e imposibil in HTTP clasic — e revolutia WebSocket.',
        ],
        diagram: `HTTP clasic:
  Client → Server (request) → response → conexiune inchisa

WebSocket:
  Client → Server (handshake HTTP)
  [conexiune deschisa permanent]
  Client → Server: "mesaj de la user"
  Server → Client: "mesaj de la alt user"
  Server → Client: "notificare noua"
  [conexiunea ramane deschisa]`,
        usecases: ['Chat in timp real (Slack, Discord)', 'Colaborare live (Figma, Google Docs)', 'Dashboarduri cu date live', 'Jocuri multiplayer'],
        pros: ['bidirectional — serverul poate trimite oricand', 'latenta minima', 'eficient — nu se repeta handshake HTTP'],
        cons: ['conexiunile persistente consuma resurse pe server', 'mai complex de implementat si scalat', 'nu e cacheabil'],
      },
      {
        id: 'eventdriven',
        label: 'Event-Driven',
        subtitle: 'Sistemele comunica prin evenimente, nu prin apeluri directe',
        branchIndex: 1,
        gradient: BRANCH_GRADIENTS_WP[1],
        category: BRANCH_CATS_WP[1],
        position: { x: 21.2, y: 60.2 },
        connections: ['webhook', 'messagequeue', 'websocket'],
        explain: [
          'In arhitectura event-driven, sistemele nu se apeleaza direct. In loc de "sistemul A apeleaza sistemul B", avem: <strong>"sistemul A publica un eveniment, sistemul B il consuma cand e disponibil"</strong>.',
          'Un eveniment e o notificare ca ceva s-a intamplat: <em>OrderPlaced</em>, <em>PaymentReceived</em>. Sistemul care produce evenimentul nu stie cine il consuma — si nici nu ii pasa.',
          'Marele avantaj: <strong>decuplare</strong>. Poti adauga un nou consumator fara sa modifici producatorul. Poti scala consumatorii independent.',
        ],
        diagram: `Arhitectura directa (coupling strans):
  OrderService → PaymentService  → fragil
  OrderService → EmailService

Arhitectura Event-Driven:
  OrderService → [OrderPlaced] → Message Broker
                                      │
                    ┌─────────────────┼──────────┐
                    ▼                 ▼           ▼
             PaymentService  InventoryService EmailService`,
        usecases: ['Sisteme cu multe componente (microservicii)', 'Procesare asincron (comenzi, plati)', 'Audit logs si analytics'],
        pros: ['decuplare — sistemele nu se cunosc direct', 'scalare independenta', 'rezilienta — un consumator cazut nu blocheaza'],
        cons: ['mai greu de debuguit (fluxul nu e liniar)', 'consistenta eventuala', 'complexitate operationala'],
      },
      {
        id: 'messagequeue',
        label: 'Message Queue',
        subtitle: 'Coada care decupleaza producatorul de consumator',
        branchIndex: 1,
        gradient: BRANCH_GRADIENTS_WP[1],
        category: BRANCH_CATS_WP[1],
        position: { x: 21.2, y: 73.7 },
        connections: ['eventdriven', 'retry', 'webhook'],
        explain: [
          'O message queue e un <strong>intermediar care stocheaza mesaje pana sunt procesate</strong>. Producatorul pune mesaje in coada, consumatorul le ia si le proceseaza in ritmul lui.',
          'Modelul fundamental: <strong>producer → queue → consumer</strong>. Queue-ul garanteaza ca mesajele nu se pierd chiar daca consumatorul e offline.',
          'Provideri: <strong>RabbitMQ</strong> (open source), <strong>AWS SQS</strong> (managed), <strong>Kafka</strong> (volum extrem, retentie pe termen lung).',
        ],
        diagram: `Fara queue (sincron):
  Producer → Consumer
  [daca Consumer e offline → mesaj pierdut]

Cu Message Queue:
  Producer → [Queue] ← Consumer procesa cand poate
               │
               ├─ mesaj 1 (procesat)
               ├─ mesaj 2 (procesat)
               └─ mesaj 3 (asteapta) ← consumatorul era offline`,
        usecases: ['Procesare comenzi e-commerce', 'Trimitere emailuri in bulk', 'Procesare imagini/video', 'Orice task care poate astepta'],
        pros: ['mesajele nu se pierd daca consumatorul e offline', 'decupleaza viteza producatorului de consumator', 'scalare: mai multi consumatori'],
        cons: ['consistenta eventuala', 'mesaje duplicate posibile', 'infrastructura suplimentara'],
      },
      {
        id: 'retry',
        label: 'Retry + Backoff',
        subtitle: 'Ce faci cand o operatie esueaza',
        branchIndex: 2,
        gradient: BRANCH_GRADIENTS_WP[2],
        category: BRANCH_CATS_WP[2],
        position: { x: 78.8, y: 25.4 },
        connections: ['webhook', 'messagequeue', 'circuitbreaker'],
        explain: [
          'Intr-un sistem distribuit, operatiile esueaza. Reteaua are probleme, un serviciu e suprasolicitat. <strong>Retry</strong> inseamna sa incerci din nou automat dupa un esec.',
          'Retry simplu (incearca imediat) e periculos: daca serverul e suprasolicitat, instant retries il agraveaza. De-aci vine <strong>Exponential Backoff</strong>: cresti intervalul intre retry-uri exponential.',
          'Formula: primul retry dupa 1s, al doilea dupa 2s, al treilea dupa 4s. Plus <strong>jitter</strong> (variatie aleatorie) ca nu toti clientii sa retry simultan. Dupa max retries → dead letter queue.',
        ],
        diagram: `Retry cu Exponential Backoff:
  t=0s   → request → ESEC (server down)
  t=1s   → retry 1 → ESEC
  t=3s   → retry 2 → ESEC
  t=7s   → retry 3 → ESEC
  t=15s  → retry 4 → SUCCES ✓

  Dupa max retries → Dead Letter Queue
  ┌─────────────────────────────────┐
  │ mesaje esuate → alerta manuala  │
  └─────────────────────────────────┘`,
        usecases: ['Apeluri HTTP intre microservicii', 'Procesare mesaje din queue', 'Retry webhook-uri'],
        pros: ['rezilienta la erori temporare', 'transparent pentru utilizator daca retry reuseste', 'reduce impactul erorilor de retea'],
        cons: ['operatia trebuie sa fie idempotenta', 'poate masca probleme reale', 'complexitate in implementare'],
      },
      {
        id: 'circuitbreaker',
        label: 'Circuit Breaker',
        subtitle: 'Opreste-te din a incerca cand stii ca va esua',
        branchIndex: 2,
        gradient: BRANCH_GRADIENTS_WP[2],
        category: BRANCH_CATS_WP[2],
        position: { x: 78.8, y: 44.1 },
        connections: ['retry', 'eventdriven'],
        explain: [
          'Retry e util pentru erori temporare. Dar daca serviciul extern e complet cazut pentru 30 de minute, sa incerci la infinit e inutil. <strong>Circuit Breaker</strong> rezolva asta.',
          'Functioneaza ca un intrerupator electric — trei stari: <em>Closed</em> (normal, cererile trec), <em>Open</em> (serviciul e down, toate cererile esueaza imediat), <em>Half-Open</em> (test: lasi o cerere sa treaca).',
          'Tranzitia Closed → Open cand erori > 50% din ultimele 20 cereri. Tranzitia Open → Half-Open dupa 30 secunde timeout.',
        ],
        diagram: `CLOSED (normal):
  Client → Circuit Breaker → Serviciu extern
  [erori > 50%] → trece in OPEN

OPEN (serviciu cazut):
  Client → Circuit Breaker → ✗ (esec imediat)
  [dupa 30s] → trece in HALF-OPEN

HALF-OPEN (test):
  [succes] → CLOSED  |  [esec] → OPEN`,
        usecases: ['Microservicii care depind unele de altele', 'Apeluri catre API-uri externe', 'Prevenirea cascade failures'],
        pros: ['previne cascade failures', 'fail fast — eroare imediata in loc de timeout lung', 'permite serviciului sa se recupereze'],
        cons: ['complexitate suplimentara', 'starea circuitului trebuie partajata intre instante', 'tuning dificil al pragurilor'],
      },
      {
        id: 'graphql',
        label: 'GraphQL',
        subtitle: 'Tu ceri exact ce date vrei, nimic mai mult',
        branchIndex: 3,
        gradient: BRANCH_GRADIENTS_WP[3],
        category: BRANCH_CATS_WP[3],
        position: { x: 78.8, y: 64.4 },
        connections: ['restapi', 'websocket'],
        explain: [
          'In REST, serverul decide ce date trimite. Vrei un profil de user? Primesti toate campurile, chiar daca ai nevoie doar de nume si avatar. GraphQL inverseaza controlul: <strong>clientul specifica exact ce campuri vrea</strong>.',
          'Exista un singur endpoint (<em>/graphql</em>). Clientul trimite o "query" care descrie exact structura datelor dorite. Serverul raspunde cu exact acea structura — nimic in plus.',
          'Rezolva: <strong>over-fetching</strong> (primesti prea multe date) si <strong>under-fetching</strong> (ai nevoie de mai multe request-uri). Suporta si <strong>subscriptions</strong> — echivalentul WebSocket.',
        ],
        diagram: `REST (serverul decide):
  GET /users/1 → { id, name, email, address, phone, ... }
  (date in plus, posibil 2 request-uri)

GraphQL (clientul decide):
  POST /graphql
  query {
    user(id: 1) { name avatar posts { title } }
  }
  → exact { name, avatar, posts: [{title}] }
  (1 request, exact ce ai cerut)`,
        usecases: ['Aplicatii mobile (bandwidth limitat)', 'Frontend-uri complexe cu multe tipuri de date', 'API-uri publice cu clienti diversi'],
        pros: ['elimina over-fetching si under-fetching', 'un singur endpoint', 'schema auto-documentata', 'subscriptions pentru real-time'],
        cons: ['mai complex de implementat pe server', 'caching mai dificil', 'query-uri complexe pot suprasolicita serverul'],
      },
    ],
  },
];

export function getCourse(slug: string): CourseData | undefined {
  return COURSES.find((c) => c.slug === slug);
}
