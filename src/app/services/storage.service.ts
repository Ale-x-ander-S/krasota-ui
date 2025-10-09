import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  private storageAvailable(type: 'localStorage' | 'sessionStorage'): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    try {
      const storage = window[type];
      const x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    } catch (e) {
      return false;
    }
  }

  isLocalStorageAvailable(): boolean {
    return this.storageAvailable('localStorage');
  }

  isSessionStorageAvailable(): boolean {
    return this.storageAvailable('sessionStorage');
  }

  getStorageType(): 'localStorage' | 'sessionStorage' | 'memory' {
    if (this.isLocalStorageAvailable()) {
      return 'localStorage';
    } else if (this.isSessionStorageAvailable()) {
      return 'sessionStorage';
    } else {
      return 'memory';
    }
  }

  setItem(key: string, value: string): boolean {
    try {
      if (this.isLocalStorageAvailable()) {
        localStorage.setItem(key, value);
        return true;
      } else if (this.isSessionStorageAvailable()) {
        sessionStorage.setItem(key, value);
        return true;
      } else {
        // Fallback в память (не сохранится после перезагрузки)
        (window as any).__memoryStorage__ = (window as any).__memoryStorage__ || {};
        (window as any).__memoryStorage__[key] = value;
        return true;
      }
    } catch (e) {
      return false;
    }
  }

  getItem(key: string): string | null {
    try {
      if (this.isLocalStorageAvailable()) {
        return localStorage.getItem(key);
      } else if (this.isSessionStorageAvailable()) {
        return sessionStorage.getItem(key);
      } else {
        return (window as any).__memoryStorage__?.[key] || null;
      }
    } catch (e) {
      return null;
    }
  }

  removeItem(key: string): boolean {
    try {
      if (this.isLocalStorageAvailable()) {
        localStorage.removeItem(key);
        return true;
      } else if (this.isSessionStorageAvailable()) {
        sessionStorage.removeItem(key);
        return true;
      } else {
        if ((window as any).__memoryStorage__) {
          delete (window as any).__memoryStorage__[key];
        }
        return true;
      }
    } catch (e) {
      return false;
    }
  }

  clear(): boolean {
    try {
      if (this.isLocalStorageAvailable()) {
        localStorage.clear();
        return true;
      } else if (this.isSessionStorageAvailable()) {
        sessionStorage.clear();
        return true;
      } else {
        (window as any).__memoryStorage__ = {};
        return true;
      }
    } catch (e) {
      return false;
    }
  }
}
