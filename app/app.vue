<script setup lang="ts">
import { contact, disclosure, leaders } from '~/data/site'

const { siteUrl } = useRuntimeConfig().public
const TITLE = 'Artis Ventures | Building financial businesses across the UAE, UK and Mauritius'
const DESCRIPTION =
  'Boutique consulting for founders and financial institutions: turnkey setup, M&A, strategy and regulatory licensing across the UAE, UK and Mauritius.'

useSeoMeta({
  title: TITLE,
  description: DESCRIPTION,
  ogTitle: TITLE,
  ogDescription: DESCRIPTION,
  ogType: 'website',
  ogUrl: siteUrl,
  ogSiteName: 'Artis Ventures',
  ogImage: `${siteUrl}/Artis_Final.png`,
  twitterCard: 'summary',
  robots: 'index, follow',
})

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Artis Ventures LLC-FZ',
  url: siteUrl,
  logo: `${siteUrl}/Artis_Final.png`,
  slogan: contact.tagline,
  description: DESCRIPTION,
  disambiguatingDescription: disclosure,
  telephone: contact.tel,
  email: contact.email,
  areaServed: ['AE', 'GB', 'MU', 'HK'],
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'The Meydan Hotel, Grandstand, 6th Floor, Meydan Road, Nad Al Sheba',
    addressLocality: 'Dubai',
    addressCountry: 'AE',
  },
  employee: leaders.map((l) => ({ '@type': 'Person', name: l.name, jobTitle: l.role })),
}

useHead({
  link: [{ rel: 'canonical', href: siteUrl }],
  script: [{ type: 'application/ld+json', innerHTML: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }],
})
</script>

<template>
  <a href="#main" class="sr-only-focusable btn btn-gold fixed top-3 left-3 z-[70]">Skip to content</a>
  <div aria-hidden="true" class="grain" />
  <SiteHeader />
  <main id="main">
    <HeroSection />
    <AboutSection />
    <MarketsBand />
    <CapabilitiesSection />
    <ApproachSection />
    <RegulatorySection />
    <ServicesSection />
    <LeadershipSection />
    <PresenceSection />
    <ContactSection />
  </main>
  <SiteFooter />
</template>
