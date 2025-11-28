/**
 * Accessibility Utilities and Hooks
 * Comprehensive keyboard navigation and accessibility improvements
 */

import { useEffect, useRef, useState, useCallback } from 'react';

// Keyboard navigation utilities
export const keyboardKeys = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown'
};

// Focus management hook
export const useFocusManagement = (initialFocusRef = null) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const containerRef = useRef(null);
  const previousFocusRef = useRef(null);

  const trapFocus = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    return () => container.removeEventListener('keydown', handleTabKey);
  }, []);

  const savePreviousFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement;
  }, []);

  const restorePreviousFocus = useCallback(() => {
    if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
      previousFocusRef.current.focus();
    }
  }, []);

  const setInitialFocus = useCallback(() => {
    if (initialFocusRef && initialFocusRef.current) {
      initialFocusRef.current.focus();
    } else if (containerRef.current) {
      const firstFocusable = containerRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }
  }, [initialFocusRef]);

  return {
    containerRef,
    focusedIndex,
    setFocusedIndex,
    trapFocus,
    savePreviousFocus,
    restorePreviousFocus,
    setInitialFocus
  };
};

// Keyboard navigation hook for lists
export const useKeyboardNavigation = ({
  items,
  onSelect,
  orientation = 'vertical',
  loop = true,
  disabled = false
}) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);

  const handleKeyDown = useCallback((e) => {
    if (disabled || !isOpen) return;

    switch (e.key) {
      case keyboardKeys.ARROW_DOWN:
        e.preventDefault();
        setSelectedIndex(prev => {
          const next = prev + 1;
          return loop && next >= items.length ? 0 : next < items.length ? next : prev;
        });
        break;

      case keyboardKeys.ARROW_UP:
        e.preventDefault();
        setSelectedIndex(prev => {
          const next = prev - 1;
          return loop && next < 0 ? items.length - 1 : next >= 0 ? next : prev;
        });
        break;

      case keyboardKeys.ARROW_RIGHT:
        if (orientation === 'horizontal') {
          e.preventDefault();
          setSelectedIndex(prev => {
            const next = prev + 1;
            return loop && next >= items.length ? 0 : next < items.length ? next : prev;
          });
        }
        break;

      case keyboardKeys.ARROW_LEFT:
        if (orientation === 'horizontal') {
          e.preventDefault();
          setSelectedIndex(prev => {
            const next = prev - 1;
            return loop && next < 0 ? items.length - 1 : next >= 0 ? next : prev;
          });
        }
        break;

      case keyboardKeys.ENTER:
      case keyboardKeys.SPACE:
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < items.length) {
          onSelect(items[selectedIndex], selectedIndex);
        }
        break;

      case keyboardKeys.ESCAPE:
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        break;

      case keyboardKeys.HOME:
        e.preventDefault();
        setSelectedIndex(0);
        break;

      case keyboardKeys.END:
        e.preventDefault();
        setSelectedIndex(items.length - 1);
        break;
    }
  }, [disabled, isOpen, items, onSelect, orientation, loop, selectedIndex]);

  return {
    selectedIndex,
    setSelectedIndex,
    isOpen,
    setIsOpen,
    handleKeyDown
  };
};

// Skip link component
export const SkipLink = ({ href = '#main-content', children = 'Skip to main content' }) => {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      {children}
    </a>
  );
};

// Announcer for screen readers
export const useAnnouncer = () => {
  const [announcement, setAnnouncement] = useState('');
  const announcerRef = useRef(null);

  const announce = useCallback((message, priority = 'polite') => {
    setAnnouncement(message);
    
    setTimeout(() => {
      if (announcerRef.current) {
        announcerRef.current.setAttribute('aria-live', priority);
        announcerRef.current.textContent = message;
      }
    }, 100);

    setTimeout(() => {
      setAnnouncement('');
    }, 1000);
  }, []);

  const AnnouncerComponent = () => (
    <div
      ref={announcerRef}
      className="sr-only"
      aria-live="polite"
      aria-atomic="true"
    />
  );

  return { announce, AnnouncerComponent };
};

// Focus visible hook for better keyboard navigation styling
export const useFocusVisible = () => {
  const [isFocusVisible, setIsFocusVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        setIsFocusVisible(true);
      }
    };

    const handleMouseDown = () => {
      setIsFocusVisible(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const focusProps = {
    ref,
    className: isFocusVisible ? 'focus-visible' : ''
  };

  return { isFocusVisible, focusProps };
};

// Accessible modal hook
export const useAccessibleModal = ({ isOpen, onClose, initialFocusRef }) => {
  const { 
    containerRef, 
    trapFocus, 
    savePreviousFocus, 
    restorePreviousFocus, 
    setInitialFocus 
  } = useFocusManagement(initialFocusRef);

  useEffect(() => {
    if (isOpen) {
      savePreviousFocus();
      setInitialFocus();
      const cleanup = trapFocus();
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      return () => {
        cleanup();
        document.body.style.overflow = '';
        restorePreviousFocus();
      };
    }
  }, [isOpen, trapFocus, savePreviousFocus, restorePreviousFocus, setInitialFocus]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === keyboardKeys.ESCAPE) {
      onClose();
    }
  }, [onClose]);

  return {
    modalRef: containerRef,
    handleKeyDown
  };
};

// Accessible tooltip hook
export const useAccessibleTooltip = () => {
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  const showTooltip = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hideTooltip = useCallback(() => {
    setIsVisible(false);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === keyboardKeys.ESCAPE) {
      hideTooltip();
    }
  }, [hideTooltip]);

  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    trigger.addEventListener('focus', showTooltip);
    trigger.addEventListener('blur', hideTooltip);
    trigger.addEventListener('mouseenter', showTooltip);
    trigger.addEventListener('mouseleave', hideTooltip);
    trigger.addEventListener('keydown', handleKeyDown);

    return () => {
      trigger.removeEventListener('focus', showTooltip);
      trigger.removeEventListener('blur', hideTooltip);
      trigger.removeEventListener('mouseenter', showTooltip);
      trigger.removeEventListener('mouseleave', hideTooltip);
      trigger.removeEventListener('keydown', handleKeyDown);
    };
  }, [showTooltip, hideTooltip, handleKeyDown]);

  return {
    triggerRef,
    tooltipRef,
    isVisible,
    showTooltip,
    hideTooltip
  };
};

// Accessible menu hook
export const useAccessibleMenu = ({ items, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case keyboardKeys.ARROW_DOWN:
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          setFocusedIndex(prev => (prev + 1) % items.length);
        }
        break;

      case keyboardKeys.ARROW_UP:
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex(prev => prev === 0 ? items.length - 1 : prev - 1);
        }
        break;

      case keyboardKeys.ENTER:
      case keyboardKeys.SPACE:
        e.preventDefault();
        if (isOpen && focusedIndex >= 0) {
          onSelect(items[focusedIndex], focusedIndex);
          setIsOpen(false);
        } else {
          setIsOpen(true);
          setFocusedIndex(0);
        }
        break;

      case keyboardKeys.ESCAPE:
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
    }
  }, [isOpen, focusedIndex, items, onSelect]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && 
          triggerRef.current && !triggerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return {
    isOpen,
    setIsOpen,
    focusedIndex,
    setFocusedIndex,
    menuRef,
    triggerRef,
    handleKeyDown
  };
};

// ARIA live region component
export const AriaLiveRegion = ({ 
  children, 
  politeness = 'polite', 
  atomic = true, 
  className = '' 
}) => {
  return (
    <div
      className={`sr-only ${className}`}
      aria-live={politeness}
      aria-atomic={atomic}
    >
      {children}
    </div>
  );
};

// Accessible button component with keyboard support
export const AccessibleButton = ({ 
  children, 
  onClick, 
  onKeyDown, 
  disabled = false, 
  ariaLabel,
  ariaDescribedBy,
  className = '',
  ...props 
}) => {
  const handleKeyDown = useCallback((e) => {
    if (disabled) return;
    
    if (e.key === keyboardKeys.ENTER || e.key === keyboardKeys.SPACE) {
      e.preventDefault();
      onClick?.(e);
    }
    
    onKeyDown?.(e);
  }, [disabled, onClick, onKeyDown]);

  return (
    <button
      onClick={onClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
};

// Keyboard shortcut hook
export const useKeyboardShortcut = (keys, callback, options = {}) => {
  const { target = window, enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      const isMatch = Array.isArray(keys) 
        ? keys.includes(e.key)
        : keys === e.key;

      if (isMatch) {
        e.preventDefault();
        callback(e);
      }
    };

    target.addEventListener('keydown', handleKeyDown);
    return () => target.removeEventListener('keydown', handleKeyDown);
  }, [keys, callback, target, enabled]);
};

export default {
  keyboardKeys,
  useFocusManagement,
  useKeyboardNavigation,
  SkipLink,
  useAnnouncer,
  useFocusVisible,
  useAccessibleModal,
  useAccessibleTooltip,
  useAccessibleMenu,
  AriaLiveRegion,
  AccessibleButton,
  useKeyboardShortcut
};