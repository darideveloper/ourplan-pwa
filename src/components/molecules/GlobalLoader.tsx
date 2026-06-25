import React from 'react';
import { useFormStore } from '@/store/form';
import { LoadingOverlay } from './LoadingOverlay';

export const GlobalLoader: React.FC = () => {
  const isNavigating = useFormStore((state) => state.isNavigating);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Show a loading state until hydration is complete OR when navigating
  const isVisible = !mounted || isNavigating;

  return <LoadingOverlay isVisible={isVisible} message={!mounted ? "Loading..." : "Loading next step..."} />;
};
