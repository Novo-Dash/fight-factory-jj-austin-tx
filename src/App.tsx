import { useScrollDepth } from './hooks/useScrollDepth'
import { BookingProvider } from './nd'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/sections/Footer'
import {
  Hero,
  WhyBeginners,
  Programs,
  Coach,
  Process,
  Gallery,
  Testimonials,
  Facility,
  FAQ,
} from './components/sections'
import { Marquee } from './components/ui/Marquee'
// Black Friday (porte da roupagem da Carmel): provisória; sai com estas linhas, as 4 do JSX, o data-book do Button e a pasta src/blackfriday.
import { lazy, Suspense } from 'react'
import BfTicker from './blackfriday/BfTicker'
import BfOffer from './blackfriday/BfOffer'
import BfFormBadge from './blackfriday/BfFormBadge'
const BfCtaFx = lazy(() => import('./blackfriday/BfCtaFx'))

export default function App() {
  useScrollDepth()

  return (
    <BookingProvider>
      <Navbar />
      <BfTicker />
      <main>
        <Hero />
        <Marquee />
        <BfOffer />
        <Programs />
        <WhyBeginners />
        <Process />
        <Gallery />
        <Testimonials />
        <Facility />
        <Coach />
        <FAQ />
      </main>
      <Footer />
      <BfFormBadge />
      <Suspense fallback={null}><BfCtaFx /></Suspense>
    </BookingProvider>
  )
}
