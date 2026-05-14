import { QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

import { SoundscapeOrchestrator } from '../features/soundscape/SoundscapeOrchestrator';
import { createAppQueryClient } from '../query/createQueryClient';
import { AppAtmosphere } from './AppAtmosphere';

export function AppProviders({ children }: { children: ReactNode }) {
  const [client] = useState(() => createAppQueryClient());
  return (
    <QueryClientProvider client={client}>
      <AppAtmosphere />
      <SoundscapeOrchestrator />
      {children}
    </QueryClientProvider>
  );
}
