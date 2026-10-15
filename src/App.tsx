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
/* Halloween: camada decorativa provisoria, so nesta pagina; sai tirando estas 2 linhas e src/halloween */
import HalloweenLayer from './halloween/HalloweenLayer'

export default function App() {
  useScrollDepth()

  return (
    <BookingProvider>
      <Navbar />
      <main>
        <Hero />
        <Marquee />
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
      <HalloweenLayer />
    </BookingProvider>
  )
}
