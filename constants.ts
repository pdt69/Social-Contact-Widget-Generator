import type { WidgetConfig, Platform } from './types';

export const PLATFORMS: { id: Platform; name: string }[] = [
  { id: 'whatsapp', name: 'WhatsApp' },
  { id: 'messenger', name: 'Facebook Messenger' },
  { id: 'telegram', name: 'Telegram' },
  { id: 'phone', name: 'Phone Call' },
  { id: 'email', name: 'Email / Contact Form' },
];

export const DEFAULT_CONFIG: WidgetConfig = {
  platforms: {
    whatsapp: { enabled: true, contactId: '15551234567', predefinedMessage: 'Hello! I have a question about your services.' },
    messenger: { enabled: true, contactId: 'Meta' },
    telegram: { enabled: true, contactId: 'mychannel' },
    phone: { enabled: false, contactId: '15551234567' },
    email: { enabled: false, contactId: 'hello@example.com', emailLinkType: 'mailto' },
  },
  headerText: 'Contact Us',
  headerBgColor: '#128C7E',
  headerTextColor: '#FFFFFF',
  mainButtonColor: '#25D366',
  mainIconColor: '#FFFFFF',
  position: 'bottom-right',
  buttonAnimation: 'pulse',
  widgetShape: 'rounded',
  menuSpacing: 'default',
};

export const PLATFORM_DETAILS: Record<Platform, { 
    placeholder: string; 
    label: string; 
    defaultColor: string; 
    helpText: string;
    supportsPrefilledMessage: boolean;
    cta: string;
}> = {
  whatsapp: {
    placeholder: 'e.g., 15551234567',
    label: 'WhatsApp Number',
    defaultColor: '#25D366',
    helpText: 'Country code + number, digits only (e.g., 15551234567).',
    supportsPrefilledMessage: true,
    cta: 'Chat with us',
  },
  messenger: {
    placeholder: 'e.g., Meta',
    label: 'Facebook Page ID/Username',
    defaultColor: '#0084FF',
    helpText: 'Your page\'s unique username or ID.',
    supportsPrefilledMessage: false,
    cta: 'Chat with us',
  },
  telegram: {
    placeholder: 'e.g., mychannel',
    label: 'Telegram Username',
    defaultColor: '#2AABEE',
    helpText: 'Your public Telegram username (without @).',
    supportsPrefilledMessage: false,
    cta: 'Chat with us',
  },
  phone: {
    placeholder: 'e.g., 15551234567',
    label: 'Phone Number',
    defaultColor: '#4CAF50',
    helpText: 'Include country code for international calls.',
    supportsPrefilledMessage: false,
    cta: 'Call us',
  },
  email: {
    placeholder: 'e.g., hello@example.com or /contact',
    label: 'Email Address / Contact URL',
    defaultColor: '#757575',
    helpText: 'Your email address or a link to your contact page.',
    supportsPrefilledMessage: false,
    cta: 'Email us',
  },
};
