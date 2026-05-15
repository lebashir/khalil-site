import { Fragment, type ReactNode } from 'react';

// Renders *word* → <strong>word</strong>. Doesn't handle nested formatting; intentional —
// the editor's only formatting affordance is "wrap in stars to make bold".
export const renderBold = (text: string): ReactNode => {
  if (!text) return null;
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <strong key={i}>{part.slice(1, -1)}</strong>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
};
