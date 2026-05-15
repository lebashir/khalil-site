import { ModeToggleBanner } from '@/components/ModeToggleBanner';
import { Hero } from '@/components/Hero';
import { Videos } from '@/components/Videos';
import { About } from '@/components/About';
import { Books } from '@/components/Books';
import { Footer } from '@/components/Footer';
import { Stage3D } from '@/components/Stage3D';
import { SectionStage } from '@/components/SectionStage';
import { ToggleTakeover } from '@/components/ToggleTakeover';
import { getContent } from '@/lib/content';

const HomePage = () => {
  const content = getContent();
  return (
    <>
      <ModeToggleBanner />
      <Stage3D>
        <Hero content={content} />
        <main className="relative z-10 mx-auto max-w-[1200px] px-4 sm:px-8">
          <SectionStage as="div">
            <Videos />
          </SectionStage>
          <SectionStage as="div">
            <About content={content} />
          </SectionStage>
          <SectionStage as="div" disabled>
            <Books content={content} />
          </SectionStage>
        </main>
        <SectionStage as="div" disabled>
          <Footer content={content} />
        </SectionStage>
      </Stage3D>
      <ToggleTakeover />
    </>
  );
};

export default HomePage;
