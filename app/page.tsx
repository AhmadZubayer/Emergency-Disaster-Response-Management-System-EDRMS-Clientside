import Link from 'next/link';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';

const Home = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Emergency Disaster Response Management System
          </h1>
          <p className="text-lg text-muted-foreground">
            A real-time coordination platform connecting citizens, volunteers, and relief organizations during crises.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button render={<Link href="/sign-in" />} size="lg">
              Sign In / Get Started
            </Button>
            <Button render={<Link href="/dashboard" />} variant="outline" size="lg">
              Go to Dashboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
