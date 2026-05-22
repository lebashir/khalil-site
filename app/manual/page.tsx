import type { Metadata } from 'next';
import { getContent } from '@/lib/content';
import { ManualShell } from '@/components/manual/ManualShell';

export const metadata: Metadata = {
  title: 'KHALIL.OPS · Operator Manual',
  description:
    'How khalil.gg works. The two modes, the tunnel, the arena, and the secret /edit door.'
};

// Public route. NOT gated by the intro cookie — anyone can read this,
// including first-time visitors who haven't done the tunnel walk yet
// (the manual will explain what they're about to see). content.json
// is read server-side so the cover stays personalized (real handle +
// sub count + portrait photo).
const ManualPage = () => {
  const content = getContent();
  return <ManualShell content={content} />;
};

export default ManualPage;
