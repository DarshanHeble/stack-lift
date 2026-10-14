/**
 * Design Tokens & Color Palette Definition
 * Extracted with pixel-level precision from the modern enterprise workspace design:
 * - Clean light surfaces (#FFFFFF, #F8F9FA, #F1F3F5)
 * - High-contrast text (#111827, #4B5563, #6B7280, #9CA3AF)
 * - Accent colors:
 *   - Emerald/Green (Accepted, Completed, Success): #10B981, #ECFDF5, #059669
 *   - Mint / Cyan / Aqua: #34D399, #A7F3D0
 *   - Purple / Indigo (New status, Badges): #8B5CF6, #EDE9FE
 *   - Pink / Coral (Important / Urgent): #F43F5E, #FFE4E6
 *   - Yellow / Amber (Comments, Highlights, Badges): #FACC15, #FEF08A
 *   - Blue / Brand: #2563EB, #EFF6FF
 *   - Subtle borders: #E5E7EB, #F3F4F6
 */

export const tokens = {
  colors: {
    // Canvas & Surfaces
    surface: {
      canvas: '#F8F9FA',         // App outer background
      card: '#FFFFFF',           // Card and container background
      subtle: '#F3F4F6',         // Muted input / section background
      hover: '#F9FAFB',          // Hover states
      active: '#F3F4F6',         // Active / selected row states
    },
    // Borders & Dividers
    border: {
      subtle: '#F3F4F6',
      default: '#E5E7EB',
      strong: '#D1D5DB',
      focus: '#111827',
    },
    // Typography Colors
    text: {
      primary: '#111827',       // Main headers, titles, high-contrast
      secondary: '#4B5563',     // Subtitles, descriptive labels
      muted: '#6B7280',         // Timestamps, helper copy, tertiary
      disabled: '#9CA3AF',      // Placeholders, disabled actions
      inverse: '#FFFFFF',       // Text on dark badges / buttons
    },
    // Brand & Interactive
    brand: {
      primary: '#111827',       // Primary buttons (Solid Black/Charcoal like screenshot)
      primaryHover: '#1F2937',
      primaryActive: '#030712',
      accent: '#2563EB',
    },
    // Functional Status Palettes
    status: {
      success: {
        text: '#047857',
        bg: '#ECFDF5',
        border: '#A7F3D0',
        dot: '#10B981',
      },
      progress: {
        text: '#0D9488',
        bg: '#CCFBF1',
        border: '#99F6E4',
        dot: '#14B8A6',
      },
      purple: {
        text: '#6D28D9',
        bg: '#EDE9FE',
        border: '#DDD6FE',
      },
      warning: {
        text: '#B45309',
        bg: '#FEF3C7',
        border: '#FDE68A',
        accent: '#FACC15',
      },
      danger: {
        text: '#BE123C',
        bg: '#FFE4E6',
        border: '#FECDD3',
        dot: '#F43F5E',
      },
      neutral: {
        text: '#374151',
        bg: '#F3F4F6',
        border: '#E5E7EB',
      }
    }
  },
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", "Inter", "Segoe UI", Roboto, sans-serif',
      mono: '"JetBrains Mono", "Fira Code", monospace',
    },
    fontSize: {
      'display': '2rem',          // 32px
      'h1': '1.5rem',             // 24px - Main section headings
      'h2': '1.25rem',            // 20px - Card & modal headings
      'h3': '1.0625rem',          // 17px - Subheadings
      'body-lg': '0.9375rem',     // 15px - Prominent body text
      'body': '0.875rem',         // 14px - Standard base text
      'body-sm': '0.8125rem',     // 13px - Secondary meta, tasks, list details
      'caption': '0.75rem',       // 12px - Timestamps, pills, meta badges
      'tiny': '0.6875rem',        // 11px - Micro indicators, counters
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.2',
      normal: '1.45',
      relaxed: '1.6',
    }
  },
  shadows: {
    subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
    card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
    dropdown: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
    modal: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
  },
  radii: {
    sm: '0.375rem',   // 6px - Badges, small inputs
    md: '0.5rem',     // 8px - Buttons, standard inputs
    lg: '0.75rem',    // 12px - Cards, panels
    xl: '1rem',       // 16px - Modals, outer containers
    full: '9999px',   // Avatars, pills
  }
} as const;
