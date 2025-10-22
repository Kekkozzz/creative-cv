/**
 * Device Detection Utility
 * Detects mobile devices, screen size, and capabilities for adaptive UX
 */

import { useState, useEffect } from 'react';

/**
 * Check if current device is mobile based on screen width and user agent
 * @returns {boolean}
 */
export const isMobile = () => {
  if (typeof window === 'undefined') return false;

  const mobileWidth = window.innerWidth <= 1024;
  const mobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  return mobileWidth || mobileUserAgent;
};

/**
 * Check if device is touch-enabled
 * @returns {boolean}
 */
export const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;

  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
};

/**
 * Get device pixel ratio for performance optimization
 * @returns {number} Clamped between 1 and 2
 */
export const getDevicePixelRatio = () => {
  if (typeof window === 'undefined') return 1;

  // Clamp DPR between 1 and 2 for performance
  return Math.min(window.devicePixelRatio || 1, 2);
};

/**
 * Check if device supports WebGL for 3D rendering
 * @returns {boolean}
 */
export const supportsWebGL = () => {
  if (typeof window === 'undefined') return false;

  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
};

/**
 * Check if user prefers reduced motion for accessibility
 * @returns {boolean}
 */
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get screen size category
 * @returns {'mobile' | 'tablet' | 'desktop'}
 */
export const getScreenSize = () => {
  if (typeof window === 'undefined') return 'desktop';

  const width = window.innerWidth;

  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

/**
 * Check if device has enough performance for heavy animations
 * Heuristic based on device capabilities
 * @returns {boolean}
 */
export const canHandleHeavyAnimations = () => {
  if (typeof window === 'undefined') return true;

  // If mobile or prefers reduced motion, return false
  if (isMobile() || prefersReducedMotion()) return false;

  // If no WebGL support, likely low-end device
  if (!supportsWebGL()) return false;

  // Check hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency || 2;
  if (cores < 4) return false;

  // Check device memory if available (in GB)
  const memory = (navigator.deviceMemory || 4);
  if (memory < 4) return false;

  return true;
};

/**
 * Get optimal animation config based on device capabilities
 * @returns {Object} Animation configuration
 */
export const getAnimationConfig = () => {
  const isLowEnd = !canHandleHeavyAnimations();
  const reducedMotion = prefersReducedMotion();

  return {
    enabled: !reducedMotion,
    quality: isLowEnd ? 'low' : 'high',
    fps: isLowEnd ? 30 : 60,
    particleCount: isLowEnd ? 20 : 100,
    shadows: !isLowEnd,
    postProcessing: !isLowEnd,
    parallax: !isLowEnd,
    complexAnimations: !isLowEnd,
  };
};

/**
 * React hook for device detection with reactive updates
 * @returns {Object} Device info object
 */
export const useDeviceDetection = () => {
  const isServer = typeof window === 'undefined';

  const [deviceInfo, setDeviceInfo] = useState(() => {
    if (isServer) {
      return {
        isMobile: false,
        isTouch: false,
        screenSize: 'desktop',
        supportsWebGL: true,
        prefersReducedMotion: false,
        animationConfig: getAnimationConfig(),
      };
    }
    return {
      isMobile: isMobile(),
      isTouch: isTouchDevice(),
      screenSize: getScreenSize(),
      supportsWebGL: supportsWebGL(),
      prefersReducedMotion: prefersReducedMotion(),
      animationConfig: getAnimationConfig(),
    };
  });

  useEffect(() => {
    if (isServer) return;
    const handleResize = () => {
      setDeviceInfo({
        isMobile: isMobile(),
        isTouch: isTouchDevice(),
        screenSize: getScreenSize(),
        supportsWebGL: supportsWebGL(),
        prefersReducedMotion: prefersReducedMotion(),
        animationConfig: getAnimationConfig(),
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return deviceInfo;
};
