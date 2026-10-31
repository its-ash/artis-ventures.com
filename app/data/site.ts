export const contact = {
  phone: '+971 50 440 1651',
  tel: '+971504401651',
  email: 'nilesh.joshi@artis-ventures.com',
  legal: 'Artis Ventures LLC-FZ · Licence 2307889.01 · Meydan Free Zone, Dubai.',
  tagline: 'Boutique by design · Institutional in capability',
  offices: [
    {
      id: 'registered',
      title: 'Registered Office',
      lines: ['The Meydan Hotel, Grandstand, 6th Floor', 'Meydan Road, Nad Al Sheba', 'Dubai, UAE'],
      map: 'https://maps.google.com/?q=The+Meydan+Hotel+Grandstand+Nad+Al+Sheba+Dubai',
    },
    {
      id: 'dubai',
      title: 'Dubai Branch',
      lines: ['Artis Ventures LLC-FZ', 'License DED 1629581', 'The Atrium Building, Unit SM24', 'Bank Street, Bur Dubai, Dubai, UAE'],
      map: 'https://maps.google.com/?q=The+Atrium+Building+Bank+Street+Bur+Dubai',
    },
    {
      id: 'hong-kong',
      title: 'Hong Kong',
      lines: ['Artis Global Advisory Limited', 'License 75582748-000-08-24-2', 'Unit B, 11/F, Yam TZE Commercial Building', '23 Thomson Road, Wan Chai, Hong Kong'],
      map: 'https://maps.google.com/?q=Yam+Tze+Commercial+Building+23+Thomson+Road+Wan+Chai',
    },
  ],
} as const

export const socials: readonly { label: string; href: string }[] = []

export const nav = [
  { href: '#about', label: 'About' },
  { href: '#capabilities', label: 'Capabilities' },
  { href: '#services', label: 'Services' },
  { href: '#approach', label: 'Approach' },
  { href: '#leadership', label: 'Leadership' },
  { href: '#contact', label: 'Contact' },
] as const

export const hero = {
  eyebrow: 'Artis Ventures · Dubai',
  lineA: 'Building Financial Businesses.',
  lineB: 'Creating Global Opportunities.',
  body: 'Boutique consulting for founders and institutions across global financial markets.',
  markets: 'UAE · UK · Mauritius',
} as const

export const sections = {
  about: {
    n: '02',
    label: 'Who We Are',
    title: 'A boutique consulting firm that turns ambition into executable advantage.',
    accent: ['executable', 'advantage.'],
  },
  capabilities: {
    n: '03',
    label: 'Capabilities',
    title: 'From first concept to growth, transition and exit.',
    accent: ['growth,', 'exit.'],
    lead: 'Four capabilities, one accountable team. Each runs alone or as part of a wider engagement.',
  },
  approach: {
    n: '04',
    label: 'Our Approach',
    title: 'A guided engagement, stage by stage.',
    accent: ['stage', 'by', 'stage.'],
    lead: 'Five stages take you from first diagnosis to scale. You always know where you are, and what comes next.',
  },
  regulatory: {
    n: '05',
    label: 'Regulatory Expertise',
    title: 'Licensing, mastered. Compliance, assured.',
    accent: ['mastered.', 'assured.'],
    lead: 'Licences are won on preparation. We manage the full path, then keep you compliant once you are live.',
  },
  services: {
    n: '06',
    label: 'Services',
    title: 'Four practice areas. One integrated team.',
    accent: ['One', 'integrated', 'team.'],
    lead: 'Each engagement draws on all four, so strategy, markets, growth and licensing move in step.',
  },
  leadership: {
    n: '07',
    label: 'Leadership',
    title: 'You work with the leadership team, not a pitch team.',
    accent: ['leadership', 'team,'],
    lead: 'More than 100 years of combined experience across markets, technology and finance, applied directly to your engagement.',
  },
  presence: {
    n: '08',
    label: 'Global Presence',
    title: 'Local insight. Global perspective.',
    accent: ['Global', 'perspective.'],
    lead: 'Teams on the ground in Dubai and Hong Kong, with UK market coverage from London.',
  },
  contact: {
    n: '09',
    label: 'Contact',
    title: 'Your gateway to excellence starts here.',
    accent: ['excellence'],
    lead: 'Speak directly with an adviser about your venture, licence or transaction.',
  },
} as const

export const regulators = [
  { code: 'CMA', authority: 'Capital Market Authority', country: 'United Arab Emirates' },
  { code: 'FCA', authority: 'Financial Conduct Authority', country: 'United Kingdom' },
  { code: 'FSC', authority: 'Financial Services Commission', country: 'Mauritius' },
] as const

export const presence = [
  { id: 'london', city: 'London', country: 'United Kingdom', role: 'UK market coverage', lon: -0.13, lat: 51.51 },
  { id: 'dubai', city: 'Dubai', country: 'United Arab Emirates', role: 'Headquarters', lon: 55.27, lat: 25.2 },
  { id: 'hong-kong', city: 'Hong Kong', country: 'Hong Kong SAR', role: 'Artis Global Advisory Limited', lon: 114.17, lat: 22.28 },
] as const

export const manifesto = {
  lineA: 'Boutique by design.',
  lineB: 'Institutional in capability.',
  body: 'A senior team that has built, licensed and scaled financial-services businesses across three jurisdictions. The people you meet on the first call lead your engagement, from diagnosis to the day you go live.',
  note: 'Over a century of combined leadership experience, applied to one venture at a time.',
} as const

export const markets = [
  ['Equities', 'Commodities', 'Forex', 'NDFs', 'CFDs', 'Exchange-traded derivatives'],
  ['Virtual assets', 'Tokenization', 'Payments', 'EMI / API', 'Brokerage', 'M&A'],
] as const

export const stats = [
  { value: 100, suffix: '+', label: 'Years of collective leadership experience' },
  { value: 40, suffix: '+', label: 'Global regulatory licences navigated' },
  { value: 15, suffix: '+', label: 'Countries of operational reach' },
  { value: 3, suffix: '', label: 'Jurisdictions', detail: 'UAE · UK · Mauritius' },
] as const

export const capabilities = [
  {
    id: 'turnkey',
    motif: 'circle',
    points: ['Business planning', 'Company formation', 'Turnkey brokerage setup', 'Operational readiness'],
    title: 'Turnkey Solutions',
    lead: 'A new venture, ready to operate.',
    body: 'End-to-end setup for new ventures: business planning, company formation and operational readiness, delivered as one coordinated programme.',
  },
  {
    id: 'brokerage-ma',
    motif: 'path',
    points: ['Buy-side advisory', 'Sell-side advisory', 'Valuation', 'Deal structuring', 'Negotiation'],
    title: 'Business Brokerage & M&A',
    lead: 'Transactions handled from first contact to completion.',
    body: 'Acquisition and sale of financial-services businesses. Buy-side and sell-side, end to end.',
  },
  {
    id: 'growth',
    motif: 'grid',
    points: ['Idea validation', 'Market entry', 'KPI design', 'Change management'],
    title: 'Strategy & Growth Advisory',
    lead: 'A clear route from idea to expansion.',
    body: 'Idea validation, market entry, operations, change management and expansion strategy, shaped around the stage your business is at.',
  },
  {
    id: 'regulatory',
    motif: 'frame',
    points: ['Jurisdiction structuring', 'Licensing', 'Due diligence', 'Ongoing compliance'],
    title: 'Regulatory & Compliance',
    lead: 'Licences won, and kept in good standing.',
    body: 'Licensing, due diligence and ongoing compliance, with specialist depth in brokerage, EMI/API and virtual assets.',
  },
] as const

export const approach = [
  {
    id: 'discover',
    title: 'Discover & Diagnose',
    lead: 'A clear, shared picture of where you stand.',
    body: 'We study your business model, market and regulatory position. We find the gaps and risks early, so later decisions rest on facts, not assumptions.',
  },
  {
    id: 'design',
    title: 'Design the Strategy',
    lead: 'A plan you can fund, licence and execute.',
    body: 'We set the structure, jurisdiction and operating model. Each decision links to a measurable outcome and a realistic timeline.',
  },
  {
    id: 'enable',
    title: 'Enable & Implement',
    lead: 'From plan to execution.',
    body: 'Setup, integrations and the operational scaffolding that makes your business live and investment-ready. We coordinate banks, providers and regulators so you do not have to.',
  },
  {
    id: 'govern',
    title: 'Govern & Assure',
    lead: 'Controls that regulators and investors trust.',
    body: 'We put governance, compliance monitoring and reporting in place. Your obligations stay visible and on schedule.',
  },
  {
    id: 'scale',
    title: 'Scale & Optimize',
    lead: 'Growth without new risk.',
    body: 'We refine operations, enter new markets and prepare for capital raise or exit. Each step builds on a stable base.',
  },
] as const

export const regulatory = [
  {
    numeral: 'I',
    strokes: 1,
    title: 'Comprehensive Licensing',
    steps: ['Licence application', 'Regulatory liaison', 'Approval management'],
  },
  {
    numeral: 'II',
    strokes: 2,
    title: 'Due Diligence Excellence',
    steps: ['Risk assessment', 'Gap analysis', 'Remediation roadmap'],
  },
  {
    numeral: 'III',
    strokes: 3,
    title: 'Compliance Management',
    steps: ['Ongoing monitoring', 'Regulatory reporting', 'Governance advisory'],
  },
] as const

export const services = [
  {
    id: 'svc-strategy',
    title: 'Strategy & Growth Advisory',
    lead: 'Turn an idea into an operating business with clear measures of progress.',
    items: [
      'Idea Validation & Business Planning',
      'Market-Entry & Go-to-Market Strategy',
      'Operations, KPI & Change Management',
      'Retainer Consulting to Management',
      'Capital-Raise Process Guidance',
    ],
  },
  {
    id: 'svc-ma',
    title: 'Mergers, Acquisitions & Brokerage',
    lead: 'Get a deal that holds its value from term sheet to close.',
    items: ['Buy-Side Advisory & Target Sourcing', 'Sell-Side & Exit Strategy', 'Business Valuation & Deal Structuring'],
  },
  {
    id: 'svc-licensing',
    title: 'Licensing, Compliance & Setup',
    lead: 'Enter new jurisdictions with the right structure and licence in place.',
    items: [
      'Company Formation & Structuring',
      'Regulatory Licensing (CMA · FCA · FSC)',
      'Virtual Asset (VARA / DFSA) Advisory',
      'Due Diligence & Compliance Management',
    ],
  },
  {
    id: 'svc-operations',
    title: 'Operations, Banking & Technology',
    lead: 'Launch with banking, liquidity and market infrastructure ready on day one.',
    items: [
      'Bank Account & Digital Payment Solutions',
      'Liquidity Provider Selection',
      'Technical Support, Systems & Outsourcing',
      'Documentation & Process Flow',
    ],
  },
] as const

export const leaders = [
  {
    id: 'nilesh-joshi',
    name: 'Nilesh Joshi',
    role: 'Founder & CEO',
    photo: '/leaders/nilesh-joshi.webp',
    summary: '25+ years of global financial-markets experience, with licensing depth across CMA, FCA and FSC.',
    bio: [
      'Nilesh has more than 25 years of experience in global financial markets. He has led licensing work with the CMA in the UAE, the FCA in the UK and the FSC in Mauritius.',
      'His market expertise covers equities, commodities, forex, NDFs, CFDs and exchange-traded derivatives. As Founder and CEO, he leads the firm and its engagements with founders and financial institutions.',
    ],
  },
  {
    id: 'vishal-kapoor',
    name: 'Vishal Kapoor',
    role: 'Strategic Advisory & Global Expansion',
    photo: '/leaders/vishal-kapoor.webp',
    summary: 'Nearly 30 years across financial markets, fintech, payments, blockchain and digital assets.',
    bio: [
      'Vishal has nearly 30 years of experience across financial markets, fintech, payments, blockchain and digital assets.',
      'He bridges traditional finance with crypto, DeFi, Web3 and tokenization, and guides clients who expand across these markets.',
    ],
  },
  {
    id: 'nawaz-ahmed',
    name: 'Nawaz Ahmed',
    role: 'Chief Financial Officer',
    photo: '/leaders/nawaz-ahmed.webp',
    summary: '30 years across manufacturing, services and technology in 15 countries.',
    bio: [
      'Nawaz has 30 years of experience across manufacturing, services and technology, in 15 countries.',
      'He specialises in business planning, market research and financial feasibility, and makes sure every plan stands on sound numbers.',
    ],
  },
] as const

export const disclosure =
  'Artis Ventures provides business consulting and advisory services. It is not a bank, broker, investment firm or law firm, does not hold client money, and does not give investment, legal or tax advice. References to CMA, FCA, FSC, VARA and DFSA describe the licensing experience of our team with those regulators. Licensing and transaction outcomes depend on regulators, counterparties and client circumstances, and are not guaranteed. Figures describe collective team experience.'
