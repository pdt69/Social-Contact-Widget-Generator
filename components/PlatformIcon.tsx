import React from 'react';
import type { Platform } from '../types';
import WhatsAppIcon from './icons/WhatsAppIcon';
import MessengerIcon from './icons/MessengerIcon';
import TelegramIcon from './icons/TelegramIcon';
import PhoneIcon from './icons/PhoneIcon';
import EmailIcon from './icons/EmailIcon';

const PlatformIcon: React.FC<{ platform: Platform; className?: string }> = ({ platform, className }) => {
  switch (platform) {
    case 'whatsapp':
      return <WhatsAppIcon className={className} />;
    case 'messenger':
      return <MessengerIcon className={className} />;
    case 'telegram':
      return <TelegramIcon className={className} />;
    case 'phone':
      return <PhoneIcon className={className} />;
    case 'email':
      return <EmailIcon className={className} />;
    default:
      return null;
  }
};

export default PlatformIcon;
