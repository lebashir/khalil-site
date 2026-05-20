'use client';

import type { SiteContent } from '@/lib/content';
import { ED, FONT } from '../constants';
import { EditPin } from './EditPin';

interface BookPreviewProps {
  book: SiteContent['book'];
  onEdit: (key: 'book') => void;
}

const PREVIEW_BG = 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0.4))';

// Mini-mockup of the Book card on the homepage.
export const BookPreview = ({ book, onEdit }: BookPreviewProps) => (
  <div
    style={{
      position: 'relative',
      padding: 18,
      backgroundImage: PREVIEW_BG,
      border: `1px solid ${ED.line}`,
      borderRadius: 5
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        paddingRight: 110
      }}
    >
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 10,
          color: ED.pink,
          letterSpacing: 2,
          textTransform: 'uppercase'
        }}
      >
        book
      </div>
      <span
        style={{
          padding: '2px 7px',
          background: book.visible ? `${ED.green}22` : `${ED.red}22`,
          border: `1px solid ${book.visible ? ED.green : ED.red}`,
          borderRadius: 2,
          fontFamily: FONT.mono,
          fontSize: 8,
          color: book.visible ? ED.green : ED.red,
          letterSpacing: 1.4,
          fontWeight: 700,
          textTransform: 'uppercase'
        }}
      >
        {book.visible ? 'live' : 'hidden'}
      </span>
    </div>
    <div
      style={{
        padding: 14,
        background: 'rgba(0,0,0,0.55)',
        border: `1px solid ${ED.line}`,
        borderRadius: 4,
        display: 'flex',
        gap: 12
      }}
    >
      {/* Faux cover */}
      <div
        style={{
          width: 64,
          minHeight: 92,
          flexShrink: 0,
          borderRadius: 3,
          backgroundImage: `linear-gradient(135deg, ${ED.pink}, ${ED.amber})`,
          display: 'flex',
          alignItems: 'flex-end',
          padding: 6,
          fontFamily: FONT.stencil,
          fontSize: 9,
          color: '#1a0a0a',
          letterSpacing: 1,
          textTransform: 'uppercase',
          lineHeight: 1.1,
          boxShadow: 'inset -4px 0 6px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.4)'
        }}
      >
        {book.chapter}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontFamily: FONT.stencil,
            fontSize: 18,
            color: ED.ink,
            lineHeight: 1.1,
            letterSpacing: -0.5
          }}
        >
          {book.title}
        </div>
        <div
          style={{
            fontFamily: FONT.body,
            fontSize: 12,
            color: ED.amber,
            fontWeight: 700,
            marginTop: 4,
            lineHeight: 1.3
          }}
        >
          {book.subtitle}
        </div>
        <div
          style={{
            fontFamily: FONT.body,
            fontSize: 11,
            color: ED.inkDim,
            lineHeight: 1.4,
            marginTop: 6,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {book.description}
        </div>
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 9,
            color: ED.green,
            letterSpacing: 1.4,
            textTransform: 'uppercase',
            marginTop: 8
          }}
        >
          {book.status}
        </div>
      </div>
    </div>
    <EditPin
      label="BOOK"
      accent={ED.pink}
      onClick={() => onEdit('book')}
      style={{ top: 10, right: 10 }}
    />
  </div>
);
