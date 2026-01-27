import { useState, useEffect, useCallback } from "react";

export interface PlatformSettings {
  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  activityDigest: boolean;
  
  // Security
  twoFactorRequired: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  
  // Platform
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
  defaultLanguage: string;
  
  // Branding
  platformName: string;
  supportEmail: string;
}

const STORAGE_KEY = "platform_settings";

const defaultSettings: PlatformSettings = {
  emailNotifications: true,
  pushNotifications: true,
  activityDigest: false,
  twoFactorRequired: false,
  sessionTimeout: 60,
  maxLoginAttempts: 5,
  maintenanceMode: false,
  allowNewRegistrations: true,
  defaultLanguage: 'fr',
  platformName: 'iDETUDE',
  supportEmail: 'support@idetude.app',
};

const getStoredSettings = (): PlatformSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultSettings, ...parsed };
    }
  } catch {
    // ignore parse errors
  }
  return defaultSettings;
};

export const usePlatformSettings = () => {
  const [settings, setSettingsState] = useState<PlatformSettings>(getStoredSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialSettings, setInitialSettings] = useState<PlatformSettings>(getStoredSettings);

  // Check for changes
  useEffect(() => {
    const hasChanged = JSON.stringify(settings) !== JSON.stringify(initialSettings);
    setHasChanges(hasChanged);
  }, [settings, initialSettings]);

  const updateSetting = useCallback(<K extends keyof PlatformSettings>(
    key: K, 
    value: PlatformSettings[K]
  ) => {
    setSettingsState(prev => ({ ...prev, [key]: value }));
  }, []);

  const saveSettings = useCallback(async () => {
    setIsSaving(true);
    try {
      // Simulate network delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setInitialSettings(settings);
      setHasChanges(false);
      return true;
    } catch (error) {
      console.error("Error saving settings:", error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [settings]);

  const resetSettings = useCallback(() => {
    setSettingsState(defaultSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSettings));
    setInitialSettings(defaultSettings);
    setHasChanges(false);
  }, []);

  const revertChanges = useCallback(() => {
    setSettingsState(initialSettings);
    setHasChanges(false);
  }, [initialSettings]);

  return {
    settings,
    updateSetting,
    saveSettings,
    resetSettings,
    revertChanges,
    isSaving,
    hasChanges,
    defaultSettings,
  };
};

// Export a getter for use outside of React components
export const getPlatformSettings = (): PlatformSettings => getStoredSettings();

// Check if maintenance mode is enabled
export const isMaintenanceMode = (): boolean => {
  const settings = getStoredSettings();
  return settings.maintenanceMode;
};

// Check if new registrations are allowed
export const isRegistrationAllowed = (): boolean => {
  const settings = getStoredSettings();
  return settings.allowNewRegistrations;
};
