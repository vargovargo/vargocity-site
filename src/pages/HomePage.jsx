import HeroSection from '../components/home/HeroSection'
import StatsBar from '../components/home/StatsBar'
import SectionCards from '../components/home/SectionCards'
import usePageTitle from '../lib/usePageTitle'

export default function HomePage() {
  usePageTitle(null)
  return (
    <div>
      <HeroSection />
      <StatsBar />
      <SectionCards />
    </div>
  )
}
