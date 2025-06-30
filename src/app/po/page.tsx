'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import POList from '@/components/POList';
import { Permission } from '@/types/po';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Mock user permissions for demonstration
// In real app, this would come from authentication context
const mockUserPermissions: Permission[] = [
  Permission.VIEW_ALL_PO,
  Permission.EDIT_PO,
  Permission.SEND_PO_EMAIL,
  Permission.DELETE_PO,
];

const POListPage: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <POList userPermissions={mockUserPermissions} />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default POListPage;