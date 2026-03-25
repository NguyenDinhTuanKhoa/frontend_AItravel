import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import SmartSuggestion from './components/SmartSuggestion';
import Destinations from './components/Destinations';
import AISection from './components/AISection';
import Footer from './components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <SmartSuggestion />
      <Destinations />
      <AISection />
      <Footer />
    </main>
  );
}
