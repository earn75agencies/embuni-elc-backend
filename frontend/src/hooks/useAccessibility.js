/**
 * Accessibility Hook
 * Provides accessibility utilities and ARIA management
 */

import { useEffect, useState, useCallback } from 'react';

export const useAccessibility = (options = {}) => {
  const {
    enableKeyboardNavigation = true,
    enableScreenReader = true,
    enableFocusManagement = true,
    announceChanges = false
  } = options;

  const [focusedElement, setFocusedElement] = useState(null);
  const [keyboardUser, setKeyboardUser] = useState(false);


  // Detect keyboard navigation
  useEffect(() => {
    if (!enableKeyboardNavigation) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        setKeyboardUser(true);
        document.body.setAttribute('data-keyboard-nav', 'true');
      }
    };

    const handleMouseDown = () => {
      setKeyboardUser(false);
      document.body.removeAttribute('data-keyboard-nav');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [enableKeyboardNavigation]);

  // Focus management
  const trapFocus = useCallback((element) => {
    if (!enableFocusManagement || !element) return;

    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    firstFocusable?.focus();

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  }, [enableFocusManagement]);

  // Screen reader announcements
  const announce = useCallback((message, priority = 'polite') => {
    if (!enableScreenReader || !announceChanges) return;

    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, [enableScreenReader, announceChanges]);

  // ARIA attributes management
  const setAriaAttributes = useCallback((element, attributes) => {
    if (!element) return;

    Object.entries(attributes).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        element.removeAttribute(`aria-${key}`);
      } else {
        element.setAttribute(`aria-${key}`, value);
      }
    });
  }, []);

  // Focus visible indicator
  const addFocusVisible = useCallback((element) => {
    if (!element) return;

    const handleFocus = () => {
      element.classList.add('focus-visible');
      setFocusedElement(element);
    };

    const handleBlur = () => {
      element.classList.remove('focus-visible');
      setFocusedElement(null);
    };

    element.addEventListener('focus', handleFocus);
    element.addEventListener('blur', handleBlur);

    return () => {
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Skip navigation link
  const createSkipLink = useCallback((targetId, text = 'Skip to main content') => {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.textContent = text;
    skipLink.className = 'skip-link';
    skipLink.setAttribute('aria-label', text);

    return skipLink;
  }, []);

  // Heading hierarchy check
  const validateHeadingHierarchy = useCallback(() => {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const hierarchy = [];
    let previousLevel = 0;

    headings.forEach((heading, index) => {
      const currentLevel = parseInt(heading.tagName.charAt(1));
      
      if (currentLevel > previousLevel + 1) {
        console.warn(`Heading hierarchy issue at index ${index}: h${currentLevel} follows h${previousLevel}`);
      }
      
      hierarchy.push(currentLevel);
      previousLevel = currentLevel;
    });

    return hierarchy;
  }, []);

  // Alt text validation for images
  const validateImageAltText = useCallback(() => {
    const images = document.querySelectorAll('img');
    const issues = [];

    images.forEach((img, index) => {
      if (!img.alt && img.alt !== '') {
        issues.push({
          index,
          src: img.src,
          issue: 'Missing alt attribute'
        });
      }
    });

    return issues;
  }, []);

  // Color contrast checker
  const checkColorContrast = useCallback((element) => {
    if (!element) return null;

    const styles = window.getComputedStyle(element);
    const color = styles.color;
    const backgroundColor = styles.backgroundColor;

    // This is a simplified check - in production, use a proper contrast calculation library
    const rgbToHex = (rgb) => {
      const result = rgb.match(/\d+/g);
      if (!result) return '#000000';
      return '#' + result.slice(0, 3).map(x => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join('');
    };

    return {
      color: rgbToHex(color),
      backgroundColor: rgbToHex(backgroundColor),
      element: element.tagName + (element.className ? '.' + element.className : '')
    };
  }, []);

  // Keyboard navigation patterns
  const handleKeyboardNavigation = useCallback((e, handlers = {}) => {
    if (!keyboardUser) return;

    const {
      onEnter = () => {},
      onSpace = () => {},
      onEscape = () => {},
      onArrowUp = () => {},
      onArrowDown = () => {},
      onArrowLeft = () => {},
      onArrowRight = () => {},
      onTab = () => {},
      onShiftTab = () => {}
    } = handlers;

    switch (e.key) {
      case 'Enter':
        onEnter(e);
        break;
      case ' ':
        onSpace(e);
        break;
      case 'Escape':
        onEscape(e);
        break;
      case 'ArrowUp':
        onArrowUp(e);
        break;
      case 'ArrowDown':
        onArrowDown(e);
        break;
      case 'ArrowLeft':
        onArrowLeft(e);
        break;
      case 'ArrowRight':
        onArrowRight(e);
        break;
      case 'Tab':
        if (e.shiftKey) {
          onShiftTab(e);
        } else {
          onTab(e);
        }
        break;
    }
  }, [keyboardUser]);

  return {
    // State
    focusedElement,
    keyboardUser,
    
    // Methods
    trapFocus,
    announce,
    setAriaAttributes,
    addFocusVisible,
    createSkipLink,
    validateHeadingHierarchy,
    validateImageAltText,
    checkColorContrast,
    handleKeyboardNavigation
  };
};

export default useAccessibility;
