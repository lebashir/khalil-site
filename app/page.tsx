import { ModeToggleBanner } from '@/components/ModeToggleBanner';
import { HeroScene } from '@/components/HeroScene/HeroScene';
import { Videos } from '@/components/Videos';
import { About } from '@/components/About';
import { Books } from '@/components/Books';
import { Footer } from '@/components/Footer';
import { getContent } from '@/lib/content';

const HomePage = () => {
  const content = getContent();
  return (
    <>
      <ModeToggleBanner />
      <HeroScene content={content} />
      <main className="relative z-10 mx-auto max-w-[1200px] px-4 pb-20 sm:px-8">
        <Videos />
        <About content={content} />
        <Books content={content} />
      </main>
      <Footer content={content} />
    </>
  );
};

export default HomePage;
