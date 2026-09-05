export {};

declare global {
  interface Window {
    Tawk_API?: {
      hideWidget?: () => void;
      showWidget?: () => void;
      toggle?: () => void;
      toggleVisibility?: () => void;
      maximize?: () => void;
      minimize?: () => void;
      popup?: () => void;
      isChatHidden?: () => boolean;
      isChatMinimized?: () => boolean;
      isChatMaximized?: () => boolean;
      onLoad?: () => void;
      onChatMaximized?: () => void;
      onChatMinimized?: () => void;
      onChatHidden?: () => void;
      [key: string]: unknown;
    };
    Tawk_LoadStart?: Date;
  }
}
