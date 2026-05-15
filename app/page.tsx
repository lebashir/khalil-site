import { ModeToggleBanner } from '@/components/ModeToggleBanner';
import { Hero } from '@/components/Hero';
import { Videos } from '@/components/Videos';
import { About } from '@/components/About';
import { Books } from '@/components/Books';
import { Footer } from '@/components/Footer';
import { BgShapes } from '@/components/BgShapes';
import { getContent } from '@/lib/content';

const HomePage = () => {
  const content = getContent();
  return (
    <>
      <BgShapes />
      <ModeToggleBanner />
      <main className="relative z-10 mx-auto max-w-[1200px] px-4 pb-20 pt-9 sm:px-8">
        <Hero content={content} />
        <Videos />
        <About content={content} />
        <Books content={content} />
      </main>
      <Footer content={content} />
    </>
  );
};

export default HomePage;
