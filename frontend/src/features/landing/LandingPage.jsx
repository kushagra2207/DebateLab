import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import SetupForm from './components/SetupForm';

export default function LandingPage() {
  return (
    <div>
      <Hero />
      <div className="mx-auto max-w-2xl">
        <SetupForm />
      </div>
      <HowItWorks />
    </div>
  );
}
