// All copy from the Artis Ventures Company Profile 2026 (page numbers as pN), unless marked "brief".

export const brand = {
  name: 'Artis Ventures LLC-FZ',
  legalName: 'ARTIS VENTURES L.L.C-FZ',
  tagline: 'Gateway to Excellence',
  url: 'https://www.artis-ventures.com',
  web: 'www.artis-ventures.com',
  phone: '+971 50 440 1651',
  tel: '+971504401651',
  email: 'nilesh.joshi@artis-ventures.com',
  presence: 'Consulting · Dubai · Hong Kong · London', // p1
} as const

export const nav = [
  { href: '#story', label: 'Story' },
  { href: '#capabilities', label: 'Capabilities' },
  { href: '#approach', label: 'Approach' },
  { href: '#reach', label: 'Reach' },
  { href: '#leadership', label: 'Leadership' },
  { href: '#contact', label: 'Contact' },
] as const

export const ui = {
  skip: 'Skip to content',
  cta: 'Begin a conversation', // brief
  menu: 'Menu',
  close: 'Close',
  copy: 'Click to copy',
  copied: 'Copied',
  primaryNav: 'Primary',
  footerNav: 'Footer',
  moved: 'This page has moved. Continue →',
  newTab: 'opens in a new tab',
} as const

// Section order drives the "[0X] NAME" index and the "[00/08]" counter.
export const sections = [
  { id: 'hero', label: 'Gateway to Excellence', tone: 'dark' },
  { id: 'story', label: 'Who We Are', tone: 'dark' },
  { id: 'glance', label: 'About the Firm', tone: 'light' },
  { id: 'capabilities', label: 'Capabilities', tone: 'light' },
  { id: 'menu', label: 'The Full Menu', tone: 'light' },
  { id: 'approach', label: 'Our Approach', tone: 'dark' },
  { id: 'reach', label: 'Regulatory & Compliance', tone: 'dark' },
  { id: 'leadership', label: 'Leadership', tone: 'light' },
  { id: 'contact', label: 'Contact', tone: 'dark' },
] as const

export type SectionId = (typeof sections)[number]['id']

export const hero = {
  label: 'ARTIS VENTURES L.L.C-FZ', // p1
  headline: 'Gateway to Excellence', // p1
  sub: 'Empowering multi-asset brokerages.', // p1
  pitch:
    'A 360° global business builder assisting financial institutions, fintechs and entrepreneurs establish, scale and expand across global financial markets — with a long-term public-listing ambition.', // p1
} as const

export const story = {
  eyebrow: 'Our Positioning', // p2
  label: 'Who We Are', // p2
  statement: 'A boutique consulting firm that turns ambition into executable advantage.', // p2
  body: 'Artis Ventures LLC-FZ partners with founders, enterprises and institutions in financial services — from first idea to market entry, growth and transition. We bring the discipline of a seasoned advisory practice, deep financial-services specialisation, and the discretion and rigour our clients expect, converting complexity into a clear, executable path.', // p2
  pillars: [
    {
      n: '01',
      title: 'Discretion by default',
      body: 'Sensitive mandates handled with the confidentiality institutional clients require.',
    },
    {
      n: '02',
      title: 'Specialist depth',
      body: 'A financial-services focus — brokerage, licensing and cross-border structuring at the core.',
    },
    {
      n: '03',
      title: 'Execution, not theory',
      body: 'We convert strategy into a live, investment-ready operating reality.',
    },
  ],
  facts: [
    { k: 'EST.', v: '2023', note: 'Meydan Free Zone, Dubai' },
    { k: 'LICENSE', v: '2307889.01', note: 'UAE Free Zone Company' },
    { k: 'MANDATE', v: 'Financial', note: 'Consulting & Advisory' },
  ],
} as const

export const glance = {
  stats: [
    { value: '100+', label: 'Years of collective leadership experience' },
    { value: '40+', label: 'Global regulatory licences navigated' },
    { value: '15+', label: 'Countries of operational reach' },
    { value: '3', label: 'Jurisdictions: UAE · UK · Mauritius' },
  ],
  motto: 'Boutique by design · Institutional in capability', // p3
  about: {
    label: 'About the Firm', // p3
    headline: 'A partner from inception to scale', // p3
    body: [
      'Artis Ventures LLC-FZ is a dynamic, forward-thinking UAE Free Zone company holding licence number 2307889.01, issued by Meydan Free Zone in Dubai. Established in 2023, we are a boutique consulting firm serving founders, enterprises and institutions in financial services — with recognised depth across global financial markets.',
      'Every entrepreneurial journey carries risk and reward. Our specialists de-risk that journey — guiding startups, MSMEs and established companies through idea validation, market entry, operations, mergers & acquisitions, licensing and global expansion with the precision of a seasoned advisory partner.',
    ],
  },
  expertise: {
    label: 'Areas of Expertise', // p3
    items: [
      'Strategy, M&A and Corporate Advisory',
      'Financial Markets & Brokerage Advisory',
      'Startups, MSMEs & Enterprise Growth',
      'Market Entry & Global Expansion',
    ],
  },
} as const

// p7 practice lists, keyed to the p4 capability they serve.
const practices = {
  strategy: {
    title: 'Strategy & Growth Advisory',
    items: [
      'Idea Validation & Business Planning',
      'Market-Entry & Go-to-Market Strategy',
      'Operations, KPI & Change Management',
      'Retainer Consulting to Management',
    ],
  },
  mna: {
    title: 'Mergers, Acquisitions & Brokerage',
    items: [
      'Buy-Side Advisory & Target Sourcing',
      'Sell-Side & Exit Strategy',
      'Business Valuation & Deal Structuring',
      'Capital-Raise Process Guidance',
    ],
  },
  licensing: {
    title: 'Licensing, Compliance & Setup',
    items: [
      'Company Formation & Structuring',
      'Client Licence Acquisition (CMA · FCA · FSC)',
      'Virtual Asset (VARA / DFSA) Advisory',
      'Due Diligence & Compliance Management',
    ],
  },
  operations: {
    title: 'Operations, Banking & Technology',
    items: [
      'Bank Account & Digital Payment Solutions',
      'Liquidity Provider Selection',
      'Technical Support, Systems & Outsourcing',
      'Documentation & Process Flow',
    ],
  },
} as const

export const capabilities = {
  label: 'Capabilities', // p4
  headline: 'Capabilities built for financial services', // p4
  intro:
    'Four integrated practice areas cover the full lifecycle of a business — from first concept to growth, transition and exit. Deep specialists in financial services.', // p4
  cards: [
    {
      n: '01',
      title: 'Turnkey Solutions',
      body: 'End-to-end setup for new ventures — business planning, company formation and operational readiness, so you launch fully prepared in your target market.',
      services: practices.operations.items,
    },
    {
      n: '02',
      title: 'Business Brokerage & M&A',
      body: 'Acquisition and sale of financial-services businesses — buy-side and sell-side advisory, valuation, deal structuring and negotiation, handled end to end.',
      services: practices.mna.items,
    },
    {
      n: '03',
      title: 'Strategy & Growth Advisory',
      body: 'Idea validation, market-entry, operations, change management and expansion strategy — the consulting backbone for founders and institutions alike.',
      services: practices.strategy.items,
    },
    {
      n: '04',
      title: 'Regulatory & Compliance',
      body: 'Licensing, due diligence and ongoing compliance — with specialist depth in financial services, brokerage, EMI/API and virtual assets.',
      services: practices.licensing.items,
    },
  ],
} as const

export const menu = {
  label: 'The Full Menu', // p7
  headline: 'One firm, four practices, a financial-services focus', // p7
  intro:
    'From a single idea to a full exit, Artis brings an integrated consulting toolkit — a financial-services focus, with specialist depth where it matters most.', // p7
  groups: [practices.strategy, practices.mna, practices.licensing, practices.operations],
  marquee: ['Financial services specialist', 'Specialist where it counts', 'From idea to exit'], // brief
} as const

export const approach = {
  label: 'Our Approach', // p5
  eyebrow: 'How We Engage', // p5
  headline: 'A structured consulting engagement, end to end', // p5
  intro:
    'Whether advising a startup or an established institution, every Artis engagement follows the same disciplined consulting methodology — clear deliverables, defined milestones and measurable KPIs at each stage, so value is visible from day one.', // p5
  steps: [
    {
      title: 'Discover & Diagnose',
      body: 'We immerse ourselves in your objectives, market and constraints — pressure-testing the idea and defining the strategic question that matters most.',
    },
    {
      title: 'Design the Strategy',
      body: 'A bespoke roadmap covering operating model, market entry, structure and jurisdiction — built around your specific goals, not a template.',
    },
    {
      title: 'Enable & Implement',
      body: 'We move from plan to execution: setup, integrations and the operational scaffolding your business needs to become live and investment-ready.',
    },
    {
      title: 'Govern & Assure',
      body: 'Controls, due diligence and ongoing governance that keep the engagement aligned with every relevant standard and expectation.',
    },
    {
      title: 'Scale & Optimize',
      body: 'A forward roadmap for growth, global expansion and continuous improvement — with Artis as a long-term advisory partner.',
    },
  ],
} as const

export const reach = {
  label: 'Regulatory & Compliance', // p6
  headline: 'Licensing, mastered. Compliance, assured.', // p6
  intro:
    'We turn regulatory complexity into a managed, predictable process — from first application through approvals to ongoing governance, across every jurisdiction we serve.', // p6
  items: [
    {
      n: 'I',
      title: 'Comprehensive Licensing',
      body: 'End-to-end support through the intricacies of obtaining regulatory licences — navigating complex landscapes while ensuring strict compliance. Our fee-based model lets clients focus on their core business while we handle the regulatory machinery.',
      tags: ['Licence Application', 'Regulatory Liaison', 'Approval Management'],
    },
    {
      n: 'II',
      title: 'Due Diligence Excellence',
      body: 'A meticulous examination that surfaces potential regulatory challenges early and resolves them proactively — securing every necessary approval and minimising risk at each stage of the process.',
      tags: ['Risk Assessment', 'Gap Analysis', 'Remediation Roadmap'],
    },
    {
      n: 'III',
      title: 'Compliance Management',
      body: 'Comprehensive, ongoing support that keeps clients aligned with all relevant standards and obligations — extending beyond transactions into day-to-day operations and corporate governance.',
      tags: ['Ongoing Monitoring', 'Regulatory Reporting', 'Governance Advisory'],
    },
  ],
  reachLabel: 'Regulatory Reach', // p6
  caption: 'Licences we help clients acquire',
  regulators: [
    { code: 'CMA', country: 'United Arab Emirates', lat: 24.45, lon: 54.38 },
    { code: 'FCA', country: 'United Kingdom', lat: 51.51, lon: -0.13 },
    { code: 'FSC', country: 'Mauritius', lat: -20.16, lon: 57.5 },
  ],
} as const

export type Office = {
  id: string
  label: string
  entity?: string
  licence?: string
  lines: readonly string[]
  lat: number
  lon: number
}

export const offices = {
  label: 'Our Offices', // p9
  items: [
    {
      id: 'registered',
      label: 'Registered Office',
      entity: 'The Meydan Hotel',
      lines: ['Grandstand, 6th Floor, Meydan Road,', 'Nad Al Sheba, Dubai,', 'United Arab Emirates.'],
      lat: 25.16,
      lon: 55.3,
    },
    {
      id: 'dubai',
      label: 'Dubai Branch',
      entity: 'Artis Ventures L.L.C-FZ',
      licence: 'License Number: DED 1629581',
      lines: ['The Atrium Building, Unit SM24,', 'Bank Street, Bur Dubai, Dubai, U.A.E.'],
      lat: 25.26,
      lon: 55.3,
    },
    {
      id: 'hong-kong',
      label: 'Hong Kong',
      entity: 'Artis Global Advisory Limited',
      licence: 'License Number: 75582748-000-08-24-2',
      lines: ['Unit B, 11/F, Yam TZE Commercial Building,', '23 Thomson Road, Wan Chai, Hong Kong.'],
      lat: 22.28,
      lon: 114.17,
    },
    {
      id: 'london',
      label: 'London',
      lines: ['UK market access & FCA licensing advisory'], // brief: no address
      lat: 51.51,
      lon: -0.13,
    },
  ] satisfies Office[],
} as const

export type Leader = {
  name: string
  role: string
  bio: readonly [string, string]
  photo: string | null // client-supplied only
  linkedin: string | null
}

export const leadership = {
  label: 'Leadership', // p8
  eyebrow: 'The People', // p8
  headline: 'Leadership with institutional weight', // p8
  intro:
    'Decades spanning global finance and cross-sector consulting — the judgement that only comes from having built, scaled and de-risked businesses through real market cycles.', // p8
  linkedin: 'LinkedIn ↗',
  people: [
    {
      name: 'Nilesh Joshi',
      role: 'Founder & Chief Executive Officer',
      bio: [
        "Founder & CEO of Artis Ventures LLC-FZ and Artis Global Advisory Limited, with 25+ years of global financial-markets experience — the strategic force behind the Group's turnkey brokerage and financial-services vision across Dubai, London and Mauritius.",
        'Expertise across Equities, Commodities, Forex, NDFs, CFDs and Exchange-Traded Derivatives on CME, NYMEX, LME and SGX, with CMA (UAE), FCA (UK) and FSC (Mauritius) licensing depth.',
      ],
      photo: null,
      linkedin: null, // TODO: client to supply URL
    },
    {
      name: 'Vishal Kapoor',
      role: 'Strategic Advisory & Global Expansion',
      bio: [
        'A strategic entrepreneurial leader with nearly 30 years of global experience across financial markets, fintech, payments, blockchain and digital assets — bridging traditional finance with next-generation infrastructure including crypto, DeFi, Web3, tokenization and cross-border payments.',
        'Founder of VK Advisory Group, advising brokers, fintechs, PSPs and digital-asset firms on licensing, structuring, go-to-market strategy, partnerships and international expansion across Asia, the GCC and other high-growth markets.',
      ],
      photo: null,
      linkedin: null, // TODO: client to supply URL
    },
    {
      name: 'Nawaz Ahmed',
      role: 'Chief Financial Officer',
      bio: [
        'A seasoned Business Analyst with 30 years across industries, specialising in Business Planning, Market Research, Demand & Supply Chain management and Financial Feasibility — spanning Manufacturing, Services and Technology across 15 countries.',
        'Retainer consultant to esteemed global firms and founder of a boutique consultancy supporting numerous start-ups and MSMEs with tailored business plans.',
      ],
      photo: null,
      linkedin: null, // TODO: client to supply URL
    },
  ] satisfies Leader[],
} as const

export const contact = {
  eyebrow: 'Let Us Begin', // p9
  label: 'Contact', // p9
  headline: 'Your gateway to excellence starts here.', // p9
  channels: [
    { k: 'Call', v: brand.phone, href: `tel:${brand.tel}` },
    { k: 'Email', v: brand.email, href: `mailto:${brand.email}`, copy: true },
    { k: 'Visit', v: brand.web, href: brand.url },
  ],
  form: {
    title: 'Enquiry',
    fields: {
      name: 'Name',
      company: 'Company',
      email: 'Email',
      phone: 'Phone',
      interest: 'Area of interest',
      message: 'Message',
      consent: 'I agree that Artis Ventures can use these details to reply to my enquiry.',
    },
    interests: ['Turnkey setup', 'Brokerage & M&A', 'Licensing & compliance', 'Strategy & growth', 'Other'],
    choose: 'Select an area',
    submit: 'Send enquiry',
    sending: 'Sending…',
    sent: 'Thank you. We will reply soon.',
    failed: 'The enquiry did not send. Please try again, or email us.',
    offline: 'The online form is not active yet. Please call or email us.',
    errors: {
      required: 'This field is necessary.',
      email: 'Enter a valid email address.',
      phone: 'Enter a valid phone number.',
      consent: 'You must agree before you send.',
      long: 'This text is too long.',
    },
  },
} as const

export const footer = {
  legal:
    'Artis Ventures LLC-FZ is a boutique consulting firm duly registered and incorporated as a Domestic Company under the laws of the United Arab Emirates.', // current site
  privacy: { label: 'Privacy Statement', href: '/privacy-statement' },
  opportunities: { label: 'Opportunities', href: '/affiliate-program' },
  copyright: '© 2026 Artis Ventures LLC-FZ',
  word: 'ARTIS',
} as const

export const pages = {
  opportunities: {
    title: 'Opportunities',
    body: 'TODO: client to supply Opportunities copy.',
    back: 'Back to home',
  },
  privacy: {
    title: 'Privacy Statement',
    body: 'TODO: client to supply Privacy Statement copy.',
    back: 'Back to home',
  },
} as const

export const seo = {
  title: 'Artis Ventures LLC-FZ — Gateway to Excellence',
  description: hero.pitch,
} as const
