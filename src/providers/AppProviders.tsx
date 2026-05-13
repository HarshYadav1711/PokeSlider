import { QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

import { createAppQueryClient } from '../query/createQueryClient';
import { AppAtmosphere } from './AppAtmosphere';

export function AppProviders({ children }: { children: ReactNode }) {
  const [client] = useState(() => createAppQueryClient());
  return (
    <QueryClientProvider client={client}>
      <AppAtmosphere />
      {children}
    </QueryClientProvider>
  );
}
