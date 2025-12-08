import React from 'react';
import { Toaster } from 'sonner';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Google Fonts - Roboto */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
          
          :root {
            /* Material Design Color Palette */
            --color-primary: #1976D2;
            --color-primary-light: #BBDEFB;
            --color-primary-dark: #1565C0;
            --color-secondary: #BBDEFB;
            
            --color-text-primary: #212121;
            --color-text-secondary: #757575;
            --color-text-disabled: #9E9E9E;
            
            --color-background: #F5F5F5;
            --color-surface: #FFFFFF;
            --color-border: #E0E0E0;
            --color-divider: #E0E0E0;
            
            --color-success: #4CAF50;
            --color-success-light: #E8F5E9;
            --color-error: #F44336;
            --color-error-light: #FFEBEE;
            --color-warning: #FF9800;
            --color-warning-light: #FFF3E0;
            --color-info: #2196F3;
            --color-info-light: #E3F2FD;
            
            /* Shadows - Material Design Elevation */
            --shadow-1: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
            --shadow-2: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
            --shadow-3: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
            --shadow-4: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
            
            /* Border Radius */
            --radius-sm: 4px;
            --radius-md: 8px;
            --radius-lg: 12px;
            --radius-xl: 16px;
            --radius-full: 9999px;
            
            /* Spacing */
            --spacing-xs: 4px;
            --spacing-sm: 8px;
            --spacing-md: 16px;
            --spacing-lg: 24px;
            --spacing-xl: 32px;
          }
          
          * {
            font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          }
          
          body {
            background-color: var(--color-background);
            color: var(--color-text-primary);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          /* Custom Button Styles */
          .btn-primary {
            background-color: var(--color-primary) !important;
            color: white !important;
            border-radius: var(--radius-md) !important;
            box-shadow: var(--shadow-1) !important;
            transition: all 0.2s ease-in-out !important;
          }
          
          .btn-primary:hover {
            background-color: var(--color-primary-dark) !important;
            box-shadow: var(--shadow-2) !important;
            transform: translateY(-1px) !important;
          }
          
          .btn-secondary {
            background-color: transparent !important;
            color: var(--color-primary) !important;
            border: 1px solid var(--color-primary) !important;
            border-radius: var(--radius-md) !important;
            transition: all 0.2s ease-in-out !important;
          }
          
          .btn-secondary:hover {
            background-color: var(--color-primary-light) !important;
            transform: translateY(-1px) !important;
          }
          
          /* Card Styles */
          .card-elevated {
            background-color: var(--color-surface);
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-1);
            transition: box-shadow 0.2s ease-in-out;
          }
          
          .card-elevated:hover {
            box-shadow: var(--shadow-2);
          }
          
          /* Input Styles */
          .input-material {
            border: 1px solid var(--color-border) !important;
            border-radius: var(--radius-md) !important;
            transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out !important;
          }
          
          .input-material:focus {
            border-color: var(--color-primary) !important;
            box-shadow: 0 0 0 2px var(--color-primary-light) !important;
            outline: none !important;
          }
          
          .input-error {
            border-color: var(--color-error) !important;
          }
          
          .input-error:focus {
            box-shadow: 0 0 0 2px var(--color-error-light) !important;
          }
          
          /* Toast Customization */
          [data-sonner-toaster] {
            font-family: 'Roboto', sans-serif !important;
          }
          
          /* Scrollbar Styling */
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: var(--color-background);
          }
          
          ::-webkit-scrollbar-thumb {
            background: var(--color-border);
            border-radius: var(--radius-full);
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: var(--color-text-secondary);
          }
          
          /* Mobile Touch Optimization */
          @media (max-width: 768px) {
            button, 
            a, 
            [role="button"] {
              min-height: 44px;
              min-width: 44px;
            }
            
            .touch-target {
              padding: 12px !important;
            }
          }
          
          /* Table Responsive */
          @media (max-width: 640px) {
            .table-responsive {
              display: block;
              overflow-x: auto;
              -webkit-overflow-scrolling: touch;
            }
          }
          
          /* ============================================
             ANIMAÇÕES PADRONIZADAS DO SISTEMA
             ============================================ */

          /* Fade suave sem movimento (modais, dialogs, popups) */
          @keyframes fadeInSmooth {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes fadeOut {
            from {
              opacity: 1;
            }
            to {
              opacity: 0;
            }
          }

          /* Desenrolar de cima (listas de seleção) */
          @keyframes slideDownFromTop {
            from {
              opacity: 0;
              transform: translateY(-10px) scaleY(0.95);
              transform-origin: top center;
            }
            to {
              opacity: 1;
              transform: translateY(0) scaleY(1);
              transform-origin: top center;
            }
          }

          @keyframes slideUpToTop {
            from {
              opacity: 1;
              transform: translateY(0) scaleY(1);
              transform-origin: top center;
            }
            to {
              opacity: 0;
              transform: translateY(-10px) scaleY(0.95);
              transform-origin: top center;
            }
          }

          /* ============================================
             APLICAÇÃO DAS ANIMAÇÕES
             ============================================ */

          /* Modais e Dialogs - apenas fade suave */
          [data-state="open"][role="dialog"],
          .modal-smooth-fade[data-state="open"],
          [data-radix-dialog-content][data-state="open"],
          [data-radix-alert-dialog-content][data-state="open"] {
            animation: fadeInSmooth 0.3s ease-out forwards !important;
          }

          [data-radix-dialog-content][data-state="closed"],
          [data-radix-alert-dialog-content][data-state="closed"] {
            animation: fadeOut 0.2s ease-in forwards !important;
          }

          /* Listas de Seleção, Popovers, Dropdowns, Context Menus - desenrolar de cima */
          [data-radix-select-content][data-state="open"],
          [role="listbox"][data-state="open"],
          [data-radix-popper-content][data-state="open"],
          [data-radix-dropdown-menu-content][data-state="open"],
          [data-radix-context-menu-content][data-state="open"] {
            animation: slideDownFromTop 0.25s ease-out forwards !important;
          }

          [data-radix-select-content][data-state="closed"],
          [role="listbox"][data-state="closed"],
          [data-radix-popper-content][data-state="closed"],
          [data-radix-dropdown-menu-content][data-state="closed"],
          [data-radix-context-menu-content][data-state="closed"] {
            animation: slideUpToTop 0.2s ease-in forwards !important;
          }
          
          /* Tooltip Styles */
          [role="tooltip"] {
            background-color: var(--color-text-primary) !important;
            color: white !important;
            border-radius: var(--radius-sm) !important;
            font-size: 12px !important;
            padding: 6px 10px !important;
          }
          
          /* Focus visible for accessibility */
          :focus-visible {
            outline: 2px solid var(--color-primary);
            outline-offset: 2px;
          }
          
          /* Smooth transitions */
          * {
            transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
            transition-duration: 150ms;
          }
        `}
      </style>
      
      {/* Toast Container */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'white',
            border: '1px solid #E0E0E0',
            borderRadius: '8px',
            boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
            fontFamily: 'Roboto, sans-serif',
          },
          className: 'font-sans',
          duration: 4000,
        }}
        richColors
        closeButton
      />
      
      {/* Main Content */}
      {children}
    </div>
  );
}