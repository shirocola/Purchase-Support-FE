'use client';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { AuthProvider } from '../lib/contexts/auth-context';
import { msalConfig } from '../lib/config/msalConfig';
import theme from '../lib/theme/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>
        <MsalProvider instance={msalInstance}>
          <AuthProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <QueryClientProvider client={queryClient}>
                {children}
              </QueryClientProvider>
            </ThemeProvider>
          </AuthProvider>
        </MsalProvider>
      </body>
    </html>
  );
}
