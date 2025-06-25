import { useState, useEffect } from 'react';

/**
 * Hook for detecting if the current viewport matches a media query
 * 
 * @param query - CSS media query string
 * @returns boolean indicating if the media query matches
 */
const useMediaQuery = (query: string): boolean => {
  // Initialize with false to avoid hydration issues
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if window is available (client-side only)
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);
      
      // Set initial value
      setMatches(media.matches);
      
      const updateMatches = () => {
        setMatches(media.matches);
      };
      
      // Add listener for changes
      if (media.addEventListener) {
        media.addEventListener('change', updateMatches);
        return () => media.removeEventListener('change', updateMatches);
      } else {
        // Fallback for older browsers
        media.addListener(updateMatches);
        return () => media.removeListener(updateMatches);
      }
    }
  }, [query]);

  return matches;
};

export default useMediaQuery;