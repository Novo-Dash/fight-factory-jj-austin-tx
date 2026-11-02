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
    </BookingProvider>
  )
}
