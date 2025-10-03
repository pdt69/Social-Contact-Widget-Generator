export type Platform = 'messenger' | 'whatsapp' | 'telegram' | 'phone' | 'email';
export type Position = 'bottom-right' | 'bottom-left';
export type ButtonAnimation = 'none' | 'pulse' | 'bounce' | 'fade' | 'shake';
export type WidgetShape = 'rounded' | 'square';
export type MenuSpacing = 'compact' | 'default' | 'relaxed';

export interface PlatformConfig {
  enabled: boolean;
  contactId: string;
  predefinedMessage?: string;
  emailLinkType?: 'mailto' | 'url';
  customIconSvg?: string;
  color?: string;
}

export interface WidgetConfig {
  platforms: Record<Platform, PlatformConfig>;
  headerText: string;
  headerBgColor: string;
  headerTextColor: string;
  mainButtonColor: string;
  mainIconColor: string;
  position: Position;
  buttonAnimation: ButtonAnimation;
  widgetShape: WidgetShape;
  menuSpacing: MenuSpacing;
}
