import React, { useState } from 'react';
import type { WidgetConfig, MenuSpacing, ButtonAnimation } from '../types';
import { PLATFORMS, PLATFORM_DETAILS } from '../constants';
import PlatformIcon from './PlatformIcon';
import ChatIcon from './icons/ChatIcon';
import CloseIcon from './icons/CloseIcon';

interface PreviewProps {
  config: WidgetConfig;
}

const animationClasses: Record<ButtonAnimation, string> = {
  none: '',
  pulse: 'scw-anim-pulse',
  bounce: 'scw-anim-bounce',
  fade: 'scw-anim-fade',
  shake: 'scw-anim-shake',
};

const Preview: React.FC<PreviewProps> = ({ config }) => {
  const [isOpen, setIsOpen] = useState(false);

  const enabledPlatforms = PLATFORMS.filter(p => config.platforms[p.id].enabled);

  const positionClasses = config.position === 'bottom-right' ? 'bottom-8 right-8' : 'bottom-8 left-8';
  const menuPositionClasses = config.position === 'bottom-right' ? 'bottom-[calc(100%+1rem)] right-0' : 'bottom-[calc(100%+1rem)] left-0';
  const menuTransformOrigin = config.position === 'bottom-right' ? 'origin-bottom-right' : 'origin-bottom-left';
  const animationClass = animationClasses[config.buttonAnimation];

  const fabShapeClass = config.widgetShape === 'rounded' ? 'rounded-full' : 'rounded-2xl';
  const platformIconShapeClass = config.widgetShape === 'rounded' ? 'rounded-full' : 'rounded-lg';

  const menuSpacingClasses: Record<MenuSpacing, string> = {
    compact: 'space-y-0.5',
    default: 'space-y-1',
    relaxed: 'space-y-2',
  };
  const listSpacingClass = menuSpacingClasses[config.menuSpacing];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
       <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-4">Live Preview</h3>
      <div className="relative bg-gray-100 dark:bg-gray-700/50 rounded-lg h-[450px] overflow-hidden flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400 text-lg select-none">Your website content appears here.</p>
      
        <div className={`absolute ${positionClasses} z-10`}>
          {/* Widget Menu */}
          <div 
            className={`absolute w-72 bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden transform transition-all duration-200 ease-out ${menuPositionClasses} ${menuTransformOrigin} ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
          >
            <header
              className="p-4 flex items-center justify-between"
              style={{ backgroundColor: config.headerBgColor, color: config.headerTextColor }}
            >
              <h4 className="font-bold text-lg">{config.headerText}</h4>
              <button onClick={() => setIsOpen(false)} className="opacity-70 hover:opacity-100 transition-opacity">
                <CloseIcon style={{ stroke: config.headerTextColor }} className="w-5 h-5" />
              </button>
            </header>
            <div className={`p-2 ${listSpacingClass}`}>
              {enabledPlatforms.map(platform => {
                const platformDetails = PLATFORM_DETAILS[platform.id];
                const platformConfig = config.platforms[platform.id];
                const message = platformConfig.predefinedMessage;
                const title = message ? `Start chat with pre-filled message: "${message}"` : `Contact us on ${platform.name}`;
                const bgColor = platformConfig.color || platformDetails.defaultColor;
                
                return (
                  <a
                    key={platform.id}
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    title={title}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors group"
                  >
                    <div className={`w-10 h-10 flex items-center justify-center shrink-0 ${platformIconShapeClass}`} style={{ backgroundColor: bgColor }}>
                       {platformConfig.customIconSvg ? (
                         <div className="w-6 h-6 text-white [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: platformConfig.customIconSvg }} />
                      ) : (
                         <PlatformIcon platform={platform.id} className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">{platform.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{platformDetails.cta}</p>
                    </div>
                    <svg className="w-5 h-5 ml-auto text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Floating Action Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-16 h-16 flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform relative overflow-hidden ${fabShapeClass} ${animationClass}`}
          >
            <div style={{ backgroundColor: config.mainButtonColor }} className="absolute inset-0"></div>
            <div className={`transform transition-all duration-300 absolute ${isOpen ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}>
              <ChatIcon style={{ stroke: config.mainIconColor }} className="w-8 h-8" />
            </div>
             <div className={`transform transition-all duration-300 absolute ${isOpen ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'}`}>
              <CloseIcon style={{ stroke: config.mainIconColor }} className="w-8 h-8"/>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Preview;
