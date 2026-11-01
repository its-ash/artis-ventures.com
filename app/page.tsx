import { Experience } from '@/components/Experience'
import { Preloader } from '@/components/Preloader'
import { StageLayers } from '@/components/StageLayers'
import { Approach } from '@/components/sections/Approach'
import { Capabilities } from '@/components/sections/Capabilities'
import { Contact } from '@/components/sections/Contact'
import { Glance } from '@/components/sections/Glance'
import { Hero } from '@/components/sections/Hero'
import { Leadership } from '@/components/sections/Leadership'
import { Menu } from '@/components/sections/Menu'
import { Reach } from '@/components/sections/Reach'
import { Story } from '@/components/sections/Story'

export default function Home() {
  return (
    <>
      <Preloader />
      <StageLayers />
      <Hero />
      <Story />
      <Glance />
      <Capabilities />
      <Menu />
      <Approach />
      <Reach />
      <Leadership />
      <Contact />
      <Experience />
    </>
  )
}
