import { useCallback } from 'react';

// Librería simple de analytics (puedes integrar Google Analytics más tarde)
export function useTracking() {
  const trackProductClick = useCallback(async () => {
    // Aquí puedes agregar tracking con Google Analytics, Mixpanel, etc.
    console.log('Product clicked');
    return Promise.resolve();
  }, []);

  const trackLinkClick = useCallback(async () => {
    console.log('Link clicked');
    return Promise.resolve();
  }, []);

  const trackSearch = useCallback(async (query: string) => {
    console.log('Search:', query);
    return Promise.resolve();
  }, []);

  return {
    trackProductClick,
    trackLinkClick,
    trackSearch,
  };
}
