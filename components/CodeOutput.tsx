import React, { useState, useEffect } from 'react';
import type { WidgetConfig, Platform, PlatformConfig, ButtonAnimation, MenuSpacing } from '../types';
import { PLATFORMS, PLATFORM_DETAILS } from '../constants';
import CodeIcon from './icons/CodeIcon';
import CheckIcon from './icons/CheckIcon';
import { getIconSvgString } from './icons/getIconSvgString';

interface CodeOutputProps {
  config: WidgetConfig;
}

const generateWidgetCode = (config: WidgetConfig): string => {
  const enabledPlatforms = PLATFORMS.filter(p => config.platforms[p.id].enabled);

  const getPlatformLink = (platform: Platform, platformConfig: PlatformConfig): string => {
    const { contactId, predefinedMessage, emailLinkType } = platformConfig;
    switch (platform) {
      case 'whatsapp':
        if (predefinedMessage) {
          const encodedMessage = encodeURIComponent(predefinedMessage);
          return `https://wa.me/${contactId}?text=${encodedMessage}`;
        }
        return `https://wa.me/${contactId}`;
      case 'messenger':
        return `https://m.me/${contactId}`;
      case 'telegram':
        return `https://t.me/${contactId}`;
      case 'phone':
        return `tel:${contactId.replace(/\s+/g, '')}`;
      case 'email':
        return emailLinkType === 'mailto' ? `mailto:${contactId}` : contactId;
      default:
        return '#';
    }
  };

  const getAnimationCss = (animation: ButtonAnimation) => {
    switch (animation) {
      case 'pulse':
        return `
  .scw-fab {
    animation: scw-pulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
  }
  @keyframes scw-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }`;
      case 'bounce':
        return `
  .scw-fab {
    animation: scw-bounce 1.5s infinite ease-in-out;
  }
  @keyframes scw-bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-15%); }
  }`;
      case 'fade':
        return `
  .scw-fab {
    animation: scw-fade 2.5s infinite linear;
  }
  @keyframes scw-fade {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }`;
      case 'shake':
        return `
  .scw-fab {
    animation: scw-shake 0.8s infinite ease-in-out;
  }
  @keyframes scw-shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }`;
      default:
        return '';
    }
  };
  
  const spacingValues: Record<MenuSpacing, string> = {
    compact: '0.125rem',
    default: '0.25rem',
    relaxed: '0.5rem',
  };
  const menuSpacingValue = spacingValues[config.menuSpacing];

  const fabBorderRadius = config.widgetShape === 'rounded' ? '50%' : '16px';
  const platformIconBorderRadius = config.widgetShape === 'rounded' ? '50%' : '8px';

  const positionStyles = config.position === 'bottom-right'
    ? `bottom: 2rem; right: 2rem;`
    : `bottom: 2rem; left: 2rem;`;
    
  const menuTransformOrigin = config.position === 'bottom-right' ? 'bottom right' : 'bottom left';

  const html = `
<!-- Social Contact Widget Container -->
<div class="scw-widget-container" id="scw-widget">
  <!-- Widget Menu -->
  <div class="scw-widget-menu" role="dialog" aria-modal="true" aria-labelledby="scw-header-text" aria-hidden="true">
    <div class="scw-header" style="background-color: ${config.headerBgColor}; color: ${config.headerTextColor};">
      <span class="scw-header-text" id="scw-header-text">${config.headerText}</span>
      <button class="scw-close-button" aria-label="Close menu">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${config.headerTextColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
    <div class="scw-platform-list">
      ${enabledPlatforms.map(p => {
          const platformConfig = config.platforms[p.id];
          const iconHtml = platformConfig.customIconSvg || getIconSvgString(p.id, '#FFFFFF');
          const bgColor = platformConfig.color || PLATFORM_DETAILS[p.id].defaultColor;
          return `
      <a href="${getPlatformLink(p.id, config.platforms[p.id])}" target="_blank" rel="noopener noreferrer" class="scw-platform-item">
        <div class="scw-platform-icon" style="background-color: ${bgColor};">
          ${iconHtml}
        </div>
        <div class="scw-platform-info">
          <p class="scw-platform-name">${p.name}</p>
          <p class="scw-platform-cta">${PLATFORM_DETAILS[p.id].cta}</p>
        </div>
        <svg class="scw-arrow-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </a>`}).join('\n      ')}
    </div>
  </div>
  <!-- Floating Action Button -->
  <button class="scw-fab" aria-label="Open contact menu" aria-haspopup="dialog" aria-expanded="false">
    <div class="scw-fab-icon-open">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${config.mainIconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
    </div>
    <div class="scw-fab-icon-close">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${config.mainIconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </div>
  </button>
</div>`;

  const css = `
<style>
  .scw-widget-container {
    position: fixed;
    z-index: 9999;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    ${positionStyles}
  }
  .scw-widget-menu {
    width: 300px;
    margin-bottom: 1rem;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 10px 20px rgba(0,0,0,0.1), 0 3px 6px rgba(0,0,0,0.1);
    overflow: hidden;
    transform: scale(0.95);
    opacity: 0;
    visibility: hidden;
    transition: transform 0.2s ease-out, opacity 0.2s ease-out, visibility 0s 0.2s;
    position: absolute;
    bottom: 100%;
    transform-origin: ${menuTransformOrigin};
    ${config.position === 'bottom-right' ? `right: 0;` : `left: 0;`}
  }
  .scw-widget-container.open .scw-widget-menu {
    transform: scale(1);
    opacity: 1;
    visibility: visible;
    transition: transform 0.2s ease-out, opacity 0.2s ease-out;
  }
  .scw-header {
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .scw-header-text {
    font-weight: bold;
    font-size: 1.1rem;
  }
  .scw-close-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    opacity: 0.8;
    transition: opacity 0.2s;
  }
  .scw-close-button:hover { opacity: 1; }
  .scw-platform-list {
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: ${menuSpacingValue};
  }
  .scw-platform-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    border-radius: 8px;
    text-decoration: none;
    color: inherit;
    transition: background-color 0.2s;
  }
  .scw-platform-item:hover { background-color: #f3f4f6; }
  .scw-platform-icon {
    width: 40px;
    height: 40px;
    border-radius: ${platformIconBorderRadius};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: #fff; /* For custom SVGs using currentColor */
  }
  .scw-platform-icon svg {
    width: 24px;
    height: 24px;
  }
  .scw-platform-info { flex-grow: 1; }
  .scw-platform-name { font-weight: 600; font-size: 0.95rem; color: #111827; }
  .scw-platform-cta { font-size: 0.85rem; color: #6b7280; }
  .scw-arrow-icon { color: #9ca3af; margin-left: auto; }
  .scw-fab {
    width: 64px;
    height: 64px;
    background-color: ${config.mainButtonColor};
    border-radius: ${fabBorderRadius};
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    transition: transform 0.2s ease-in-out;
    position: relative;
    overflow: hidden;
  }
  .scw-fab:hover { transform: scale(1.05); }
  .scw-fab-icon-open, .scw-fab-icon-close {
    position: absolute;
    transition: transform 0.3s ease, opacity 0.3s ease;
  }
  .scw-fab-icon-open { transform: rotate(0) scale(1); opacity: 1; }
  .scw-widget-container.open .scw-fab-icon-open { transform: rotate(-90deg) scale(0); opacity: 0; }
  .scw-fab-icon-close { transform: rotate(90deg) scale(0); opacity: 0; }
  .scw-widget-container.open .scw-fab-icon-close { transform: rotate(0) scale(1); opacity: 1; }
  ${getAnimationCss(config.buttonAnimation)}
</style>`;

  const js = `
<script>
  document.addEventListener('DOMContentLoaded', function() {
    const widgetContainer = document.getElementById('scw-widget');
    if (!widgetContainer) return;

    const fab = widgetContainer.querySelector('.scw-fab');
    const menu = widgetContainer.querySelector('.scw-widget-menu');
    const closeButton = widgetContainer.querySelector('.scw-close-button');

    if (!fab || !menu || !closeButton) return;

    const focusableElements = menu.querySelectorAll('a[href], button');
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    const openWidget = () => {
      widgetContainer.classList.add('open');
      fab.setAttribute('aria-expanded', 'true');
      menu.setAttribute('aria-hidden', 'false');
      if (firstFocusableElement) {
        firstFocusableElement.focus();
      }
      document.addEventListener('keydown', handleKeyDown);
    };

    const closeWidget = () => {
      widgetContainer.classList.remove('open');
      fab.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
      fab.focus();
      document.removeEventListener('keydown', handleKeyDown);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeWidget();
        return;
      }
      
      if (!focusableElements || focusableElements.length === 0) return;

      if (e.key === 'Tab') {
        if (e.shiftKey) { // Shift + Tab
          if (document.activeElement === firstFocusableElement) {
            e.preventDefault();
            lastFocusableElement.focus();
          }
        } else { // Tab
          if (document.activeElement === lastFocusableElement) {
            e.preventDefault();
            firstFocusableElement.focus();
          }
        }
      }
    };

    fab.addEventListener('click', () => {
      const isOpen = widgetContainer.classList.contains('open');
      if (isOpen) {
        closeWidget();
      } else {
        openWidget();
      }
    });

    closeButton.addEventListener('click', closeWidget);
  });
</script>`;

  return `<!-- Start Social Contact Widget -->
${html}
${css}
${js}
<!-- End Social Contact Widget -->`;
};


const CodeOutput: React.FC<CodeOutputProps> = ({ config }) => {
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCode(generateWidgetCode(config));
  }, [config]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy code: ', err);
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <CodeIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Embed Code</h3>
        </div>
        <button
          onClick={handleCopy}
          className="px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors duration-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
        >
          {copied ? (
            <>
              <CheckIcon className="w-4 h-4 text-green-500" />
              Copied!
            </>
          ) : (
            'Copy Code'
          )}
        </button>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Copy and paste this code snippet right before the closing <code>&lt;/body&gt;</code> tag of your HTML file.
      </p>
      <div className="bg-gray-900 rounded-lg overflow-hidden relative group">
         <pre className="language-html text-sm p-4 overflow-x-auto text-white/90 focus:outline-none" tabIndex={0}>
          <code className="font-mono">
            {code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
          </code>
        </pre>
      </div>
    </div>
  );
};

export default CodeOutput;
