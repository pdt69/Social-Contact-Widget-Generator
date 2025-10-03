import React, { useState, useEffect } from 'react';
import type { WidgetConfig, Position, Platform, ButtonAnimation, PlatformConfig, WidgetShape, MenuSpacing } from '../types';
import { PLATFORMS, PLATFORM_DETAILS } from '../constants';
import PlatformIcon from './PlatformIcon';

interface ConfiguratorProps {
  config: WidgetConfig;
  setConfig: React.Dispatch<React.SetStateAction<WidgetConfig>>;
}

const validators: Record<string, (value: string) => string | undefined> = {
  whatsapp: (value) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return 'WhatsApp number is required.';
    if (!/^\d+$/.test(trimmedValue)) return 'Please enter digits only, without "+" or spaces.';
    if (trimmedValue.length < 7 || trimmedValue.length > 15) return 'Number must be between 7 and 15 digits.';
    return undefined;
  },
  messenger: (value) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return 'Page ID or username is required.';
    if (/\s/.test(trimmedValue)) return 'Cannot contain spaces.';
    return undefined;
  },
  telegram: (value) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return 'Telegram username is required.';
    if (!/^[a-zA-Z0-9_]{5,32}$/.test(trimmedValue)) return 'Must be 5-32 letters, numbers, or underscores.';
    return undefined;
  },
  phone: (value) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return 'Phone number is required.';
    if (!/^(?=.*\d{7})[\d\s()+-]+$/.test(trimmedValue)) {
      return 'Please enter a valid phone number.';
    }
    return undefined;
  },
  email: (value) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return 'Email address is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(trimmedValue)) return undefined;
    return 'Please enter a valid email address.';
  },
  url: (value) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return 'URL is required.';
    
    // Allow relative paths starting with '/' or anchor links starting with '#'
    if (trimmedValue.startsWith('/') || trimmedValue.startsWith('#')) {
        return undefined;
    }
    
    // Prepend 'https://' if no protocol is present to validate domain-like strings
    let testUrl = trimmedValue;
    if (!/^https?:\/\//i.test(testUrl)) {
      testUrl = `https://${testUrl}`;
    }

    try {
      const urlObject = new URL(testUrl);
      // Basic check to ensure it's a plausible hostname (e.g., contains a dot)
      if (!urlObject.hostname || !urlObject.hostname.includes('.')) {
        throw new Error('Invalid hostname');
      }
      return undefined;
    } catch (_) {
      return 'Please enter a valid URL (e.g., https://example.com) or path (e.g., /contact).';
    }
  },
};

const getValidationError = (platformId: Platform, pConfig: PlatformConfig): string | undefined => {
    const contactId = pConfig.contactId || '';
    switch (platformId) {
        case 'whatsapp': return validators.whatsapp(contactId);
        case 'messenger': return validators.messenger(contactId);
        case 'telegram': return validators.telegram(contactId);
        case 'phone': return validators.phone(contactId);
        case 'email':
            return pConfig.emailLinkType === 'mailto'
                ? validators.email(contactId)
                : validators.url(contactId);
        default:
            return undefined;
    }
};

const getContrastingTextColor = (hexColor: string): string => {
    if (!hexColor || hexColor.length < 7) return '#000000';
    try {
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        // http://www.w3.org/TR/AERT#color-contrast
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? '#111827' : '#FFFFFF';
    } catch(e) {
        return '#000000';
    }
};

const TooltipLabel: React.FC<{ htmlFor: string, text: string, tooltip: string }> = ({ htmlFor, text, tooltip }) => (
    <label htmlFor={htmlFor} className="block font-semibold text-gray-700 dark:text-gray-300 relative group cursor-help w-fit">
        {text}
        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max max-w-[220px] bg-gray-900 text-white text-xs rounded-md py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 dark:bg-gray-700 text-center">
            {tooltip}
            <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900 dark:border-t-gray-700"></span>
        </span>
    </label>
);


const Configurator: React.FC<ConfiguratorProps> = ({ config, setConfig }) => {
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    const newErrors: Record<string, string | undefined> = {};
    PLATFORMS.forEach(p => {
        const platformConfig = config.platforms[p.id];
        if (platformConfig.enabled) {
            const error = getValidationError(p.id, platformConfig);
            if(error) {
              newErrors[p.id] = error;
            }
        }
    });
    setErrors(newErrors);
  }, [config]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  }

  const handleRadioChange = <T,>(name: keyof WidgetConfig, value: T) => {
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handlePlatformToggle = (platformId: Platform) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      platforms: {
        ...prevConfig.platforms,
        [platformId]: {
          ...prevConfig.platforms[platformId],
          enabled: !prevConfig.platforms[platformId].enabled,
        }
      }
    }));
  };

  const handlePlatformFieldChange = (platformId: Platform, field: keyof PlatformConfig, value: any) => {
      setConfig(prevConfig => {
        const updatedPlatformConfig: PlatformConfig = {
            ...prevConfig.platforms[platformId],
            [field]: value
        };

        // When switching email type, clear the contact ID to avoid validation errors
        if (platformId === 'email' && field === 'emailLinkType') {
            updatedPlatformConfig.contactId = '';
        }

        return {
            ...prevConfig,
            platforms: {
                ...prevConfig.platforms,
                [platformId]: updatedPlatformConfig
            }
        };
    });
  };
  

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4">Configuration</h2>
      
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Platforms</h3>
        <div className="space-y-3">
          {PLATFORMS.map(platform => {
            const platformConfig = config.platforms[platform.id];
            const platformDetails = PLATFORM_DETAILS[platform.id];
            const error = errors[platform.id];

            let contactLabel = platformDetails.label;
            let contactPlaceholder = platformDetails.placeholder;
            let contactHelpText = platformDetails.helpText;

            if (platform.id === 'email') {
                const isMailto = platformConfig.emailLinkType === 'mailto';
                contactLabel = isMailto ? 'Email Address' : 'Contact Page URL';
                contactPlaceholder = isMailto ? 'e.g., hello@example.com' : 'e.g., /contact-us';
                contactHelpText = isMailto ? 'A direct mailto: link.' : 'A link to your website\'s contact page.';
            }

            return (
              <div key={platform.id} className="space-y-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <label htmlFor={`enabled-${platform.id}`} className="flex items-center justify-between cursor-pointer select-none">
                  <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-3">
                    <PlatformIcon platform={platform.id} className="w-5 h-5" />
                    {platform.name}
                  </span>
                  <input
                    type="checkbox"
                    id={`enabled-${platform.id}`}
                    checked={platformConfig.enabled}
                    onChange={() => handlePlatformToggle(platform.id)}
                    className="w-5 h-5 text-blue-500 bg-gray-200 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                </label>
                {platformConfig.enabled && (
                  <div className="space-y-4 pt-3 border-t border-gray-200 dark:border-gray-700 animate-[fadeIn_0.3s_ease-out]">
                    {platform.id === 'email' && (
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Link Type</label>
                            <div className="flex gap-1 rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
                                <button onClick={() => handlePlatformFieldChange('email', 'emailLinkType', 'mailto')} className={`w-full p-1.5 text-xs font-semibold rounded-md transition-colors ${platformConfig.emailLinkType === 'mailto' ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>Email Address</button>
                                <button onClick={() => handlePlatformFieldChange('email', 'emailLinkType', 'url')} className={`w-full p-1.5 text-xs font-semibold rounded-md transition-colors ${platformConfig.emailLinkType === 'url' ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>Contact URL</button>
                            </div>
                        </div>
                    )}
                    <div>
                      <label htmlFor={`contactId-${platform.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {contactLabel}
                      </label>
                      <input
                        type="text"
                        id={`contactId-${platform.id}`}
                        value={platformConfig.contactId}
                        onChange={(e) => handlePlatformFieldChange(platform.id, 'contactId', e.target.value)}
                        placeholder={contactPlaceholder}
                        className={`w-full px-4 py-2 mt-1 bg-gray-100 dark:bg-gray-700 border rounded-lg focus:ring-2 focus:border-blue-500 outline-none transition ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-600 focus:ring-blue-500'}`}
                        aria-invalid={!!error}
                        aria-describedby={error ? `error-${platform.id}` : undefined}
                      />
                      {error && <p id={`error-${platform.id}`} className="text-xs text-red-500 pt-1">{error}</p>}
                      {!error && <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">{contactHelpText}</p>}
                    </div>

                    <div>
                        <div className="flex justify-between items-center">
                            <label htmlFor={`color-${platform.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Brand Color
                            </label>
                            {platformConfig.color && platformConfig.color.toLowerCase() !== platformDetails.defaultColor.toLowerCase() && (
                                <button
                                    onClick={() => handlePlatformFieldChange(platform.id, 'color', '')}
                                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    Reset to Default
                                </button>
                            )}
                        </div>
                        <div className="relative group mt-1">
                            <input
                                type="color"
                                id={`color-${platform.id}`}
                                value={platformConfig.color || platformDetails.defaultColor}
                                onChange={(e) => handlePlatformFieldChange(platform.id, 'color', e.target.value)}
                                className="absolute inset-0 w-full h-10 opacity-0 cursor-pointer"
                            />
                            <div
                                className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center font-mono text-sm transition-colors"
                                style={{
                                    backgroundColor: platformConfig.color || platformDetails.defaultColor,
                                    color: getContrastingTextColor(platformConfig.color || platformDetails.defaultColor)
                                }}
                            >
                                {(platformConfig.color || platformDetails.defaultColor).toUpperCase()}
                            </div>
                        </div>
                    </div>

                    {platformDetails.supportsPrefilledMessage && (
                      <div>
                        <label htmlFor={`predefinedMessage-${platform.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Pre-filled Message (Optional)
                        </label>
                        <textarea
                            id={`predefinedMessage-${platform.id}`}
                            rows={3}
                            value={platformConfig.predefinedMessage || ''}
                            onChange={(e) => handlePlatformFieldChange(platform.id, 'predefinedMessage', e.target.value)}
                            placeholder="Hi! I'd like to ask about..."
                            className="w-full px-4 py-2 mt-1 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">This text will pre-fill the user's message box.</p>
                      </div>
                    )}
                    <div>
                        <label htmlFor={`customIconSvg-${platform.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Custom Icon SVG (Optional)
                        </label>
                        <textarea
                            id={`customIconSvg-${platform.id}`}
                            rows={4}
                            value={platformConfig.customIconSvg || ''}
                            onChange={(e) => handlePlatformFieldChange(platform.id, 'customIconSvg', e.target.value)}
                            placeholder='e.g., <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>'
                            className="w-full px-4 py-2 mt-1 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm font-mono"
                          />
                          <div className="flex justify-between items-center pt-1">
                              <p className="text-xs text-gray-500 dark:text-gray-400">Paste your own SVG code. Use `fill="currentColor"` for best results.</p>
                              {platformConfig.customIconSvg && (
                                  <button onClick={() => handlePlatformFieldChange(platform.id, 'customIconSvg', '')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Reset to Default</button>
                              )}
                          </div>
                      </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Appearance</h3>
        
      <div className="space-y-2">
        <TooltipLabel htmlFor="headerText" text="Header Text" tooltip="The title displayed at the top of the contact menu." />
        <input
          type="text"
          id="headerText"
          name="headerText"
          value={config.headerText}
          onChange={handleInputChange}
          className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <TooltipLabel htmlFor="headerBgColor" text="Header BG" tooltip="Background color of the menu header." />
          <div className="relative group">
            <input type="color" id="headerBgColor" name="headerBgColor" value={config.headerBgColor} onChange={handleColorChange} className="absolute inset-0 w-full h-10 opacity-0 cursor-pointer"/>
            <div className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600" style={{ backgroundColor: config.headerBgColor }}></div>
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max bg-gray-900 text-white text-xs rounded-md py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 dark:bg-gray-700">
                {config.headerBgColor.toUpperCase()}
                <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900 dark:border-t-gray-700"></span>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <TooltipLabel htmlFor="headerTextColor" text="Header Text" tooltip="Text color of the menu header." />
           <div className="relative group">
            <input type="color" id="headerTextColor" name="headerTextColor" value={config.headerTextColor} onChange={handleColorChange} className="absolute inset-0 w-full h-10 opacity-0 cursor-pointer"/>
            <div className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600" style={{ backgroundColor: config.headerTextColor }}></div>
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max bg-gray-900 text-white text-xs rounded-md py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 dark:bg-gray-700">
                {config.headerTextColor.toUpperCase()}
                <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900 dark:border-t-gray-700"></span>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <TooltipLabel htmlFor="mainButtonColor" text="Button" tooltip="Background color of the floating action button." />
          <div className="relative group">
            <input type="color" id="mainButtonColor" name="mainButtonColor" value={config.mainButtonColor} onChange={handleColorChange} className="absolute inset-0 w-full h-10 opacity-0 cursor-pointer"/>
            <div className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600" style={{ backgroundColor: config.mainButtonColor }}></div>
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max bg-gray-900 text-white text-xs rounded-md py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 dark:bg-gray-700">
                {config.mainButtonColor.toUpperCase()}
                <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900 dark:border-t-gray-700"></span>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <TooltipLabel htmlFor="mainIconColor" text="Button Icon" tooltip="Color of the icon inside the floating action button." />
           <div className="relative group">
            <input type="color" id="mainIconColor" name="mainIconColor" value={config.mainIconColor} onChange={handleColorChange} className="absolute inset-0 w-full h-10 opacity-0 cursor-pointer"/>
            <div className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600" style={{ backgroundColor: config.mainIconColor }}></div>
             <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max bg-gray-900 text-white text-xs rounded-md py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 dark:bg-gray-700">
                {config.mainIconColor.toUpperCase()}
                <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900 dark:border-t-gray-700"></span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
          <TooltipLabel htmlFor="" text="Widget Shape" tooltip="Choose between rounded or square corners for the widget." />
          <div className="flex gap-2 rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
            <button onClick={() => handleRadioChange<WidgetShape>('widgetShape', 'rounded')} className={`w-full p-2 text-sm font-semibold rounded-md transition-colors ${config.widgetShape === 'rounded' ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>Rounded</button>
            <button onClick={() => handleRadioChange<WidgetShape>('widgetShape', 'square')} className={`w-full p-2 text-sm font-semibold rounded-md transition-colors ${config.widgetShape === 'square' ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>Square</button>
          </div>
      </div>

      <div className="space-y-3">
          <TooltipLabel htmlFor="" text="Menu Spacing" tooltip="Control the vertical spacing between contact items." />
          <div className="flex gap-2 rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
            <button onClick={() => handleRadioChange<MenuSpacing>('menuSpacing', 'compact')} className={`w-full p-2 text-sm font-semibold rounded-md transition-colors ${config.menuSpacing === 'compact' ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>Compact</button>
            <button onClick={() => handleRadioChange<MenuSpacing>('menuSpacing', 'default')} className={`w-full p-2 text-sm font-semibold rounded-md transition-colors ${config.menuSpacing === 'default' ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>Default</button>
            <button onClick={() => handleRadioChange<MenuSpacing>('menuSpacing', 'relaxed')} className={`w-full p-2 text-sm font-semibold rounded-md transition-colors ${config.menuSpacing === 'relaxed' ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>Relaxed</button>
          </div>
      </div>
      
      <div className="space-y-3">
          <TooltipLabel htmlFor="" text="Button Animation" tooltip="Add a subtle animation to the floating button to attract attention." />
          <div className="flex gap-2 rounded-lg bg-gray-100 dark:bg-gray-700 p-1 flex-wrap">
            <button onClick={() => handleRadioChange<ButtonAnimation>('buttonAnimation', 'none')} className={`flex-grow basis-24 p-2 text-xs sm:text-sm font-semibold rounded-md transition-colors ${config.buttonAnimation === 'none' ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>None</button>
            <button onClick={() => handleRadioChange<ButtonAnimation>('buttonAnimation', 'pulse')} className={`flex-grow basis-24 p-2 text-xs sm:text-sm font-semibold rounded-md transition-colors ${config.buttonAnimation === 'pulse' ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>Pulse</button>
            <button onClick={() => handleRadioChange<ButtonAnimation>('buttonAnimation', 'bounce')} className={`flex-grow basis-24 p-2 text-xs sm:text-sm font-semibold rounded-md transition-colors ${config.buttonAnimation === 'bounce' ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>Bounce</button>
            <button onClick={() => handleRadioChange<ButtonAnimation>('buttonAnimation', 'fade')} className={`flex-grow basis-24 p-2 text-xs sm:text-sm font-semibold rounded-md transition-colors ${config.buttonAnimation === 'fade' ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>Fade</button>
            <button onClick={() => handleRadioChange<ButtonAnimation>('buttonAnimation', 'shake')} className={`flex-grow basis-24 p-2 text-xs sm:text-sm font-semibold rounded-md transition-colors ${config.buttonAnimation === 'shake' ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>Shake</button>
          </div>
      </div>

      <div className="space-y-3">
          <TooltipLabel htmlFor="" text="Position on Page" tooltip="Choose where the widget appears on your page." />
          <div className="flex gap-2 rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
            <button onClick={() => handleRadioChange<Position>('position', 'bottom-right')} className={`w-full p-2 text-sm font-semibold rounded-md transition-colors ${config.position === 'bottom-right' ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>Bottom Right</button>
            <button onClick={() => handleRadioChange<Position>('position', 'bottom-left')} className={`w-full p-2 text-sm font-semibold rounded-md transition-colors ${config.position === 'bottom-left' ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>Bottom Left</button>
          </div>
      </div>
    </div>
  );
};

export default Configurator;
