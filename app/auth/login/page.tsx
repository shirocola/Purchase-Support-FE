// Updated Login Component with proper backend integration

'use client';

import React, { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { BrowserAuthError } from "@azure/msal-browser";
import axios from 'axios';
import { useAuth } from '../../../lib/contexts/auth-context';
import { saveAuth } from '../../../lib/api/auth';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { Microsoft as MicrosoftIcon } from '@mui/icons-material';
import Link from 'next/link';
import { transactionlog } from "../../../lib/utils/utils";

const Login = () => {
  const { instance } = useMsal();
  const { setCurrentUser } = useAuth();

  const [azureLoading, setAzureLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const envModuleId = process.env.NEXT_PUBLIC_MODULE_ID || '';
  const enableClientMsal = process.env.NEXT_PUBLIC_ENABLE_CLIENT_MSAL === 'true';
  
  // Backend API URL
  const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3001/api';

  const graphConfig = {
    graphMeEndpoint: process.env.NEXT_PUBLIC_GRAPH_ME_ENDPOINT || "https://graph.microsoft.com/v1.0/me"
  };

  async function callMsGraph(accessToken: string) {
    const headers = new Headers();
    headers.append("Authorization", `Bearer ${accessToken}`);

    try {
      const response = await fetch(graphConfig.graphMeEndpoint, {
        method: "GET",
        headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Graph API error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get user info from Microsoft Graph: ${error}`);
    }
  }

  async function handleAzureAuthentication() {
    if (!enableClientMsal) {
      setLoginError('Azure AD authentication is disabled in this environment');
      return;
    }

    try {
      setAzureLoading(true);
      setLoginError("");

      // Step 1: Get user info from Azure AD
      const azureResponse = await instance.loginPopup({
        scopes: [
          process.env.NEXT_PUBLIC_USER_READ_SCOPE || "User.Read",
          "openid",
          "profile",
          "email"
        ]
      });

      const userInfo = await callMsGraph(azureResponse.accessToken);
      
      // Step 2: Authenticate with your backend using the user's email
      const { data: authResponse } = await axios.post(`${backendApiUrl}/auth/login`, {
        username: userInfo.mail,
        password: 'azure_ad_auth'
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Step 3: Save authentication data with proper structure
      const authDataWithMeta = {
        ...authResponse,
        azure: true,
        loginMethod: 'azure',
        loginTimestamp: new Date().toISOString()
      };

      saveAuth(authDataWithMeta);
      setCurrentUser(authResponse.user);

      // Step 4: Log successful login
      await transactionlog({ log: 'azure_login', type: 'access' });

      // Step 5: Redirect to home
      window.location.href = '/';

    } catch (error: unknown) {
      saveAuth(undefined);

      if (error instanceof BrowserAuthError) {
        if (error.errorCode === "user_cancelled") {
          setLoginError("❌ Azure AD Login Cancelled\n\nUser cancelled the login popup.");
        } else {
          setLoginError(`❌ Azure AD Error\n\n${error.errorCode}: ${error.errorMessage}`);
        }
      } else if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setLoginError('❌ Authentication Failed\n\nInvalid credentials or user not found in the system.');
        } else if (error.response?.status === 500) {
          setLoginError('❌ Server Error\n\nInternal server error. Please try again later.');
        } else {
          setLoginError(`❌ Authentication Error\n\n${error.response?.data?.error || error.message}`);
        }
      } else if (error instanceof Error) {
        setLoginError(error.message);
      } else {
        setLoginError('❌ Unknown error occurred');
      }
    } finally {
      setAzureLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #2440AF 0%, #13256C 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2
      }}
    >
      <Box sx={{ mb: 2 }}>
        <img
          src="/PurchaseSupport.Logo.png"
          alt="Logo"
          style={{ width: 150, height: 'auto' }}
        />
      </Box>

      <Typography
        variant="h3"
        component="h1"
        sx={{
          color: 'white',
          fontWeight: 300,
          textAlign: 'center',
          mb: 4,
          fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' }
        }}
      >
        Purchase Support System
      </Typography>

      <Paper
        elevation={8}
        sx={{
          width: { xs: '100%', sm: 400 },
          maxWidth: 400,
          p: 3,
          borderRadius: 2
        }}
      >
        <Typography
          variant="h5"
          component="h2"
          sx={{
            textAlign: 'center',
            mb: 1,
            fontWeight: 300
          }}
        >
          เข้าสู่ระบบด้วย
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            textAlign: 'center',
            mb: 3,
            color: 'text.secondary',
            fontWeight: 300
          }}
        >
          (Login With)
        </Typography>

        {enableClientMsal && (
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleAzureAuthentication}
            disabled={azureLoading}
            startIcon={azureLoading ? <CircularProgress size={20} /> : <MicrosoftIcon />}
            sx={{
              mb: 2,
              py: 1.5,
              backgroundColor: '#122B6F',
              '&:hover': {
                backgroundColor: '#0d1f54'
              }
            }}
          >
            {azureLoading ? 'กำลังเข้าสู่ระบบ...' : 'AD USER หรือ EMAIL บริษัท'}
          </Button>
        )}

        {loginError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {loginError}
          </Alert>
        )}
      </Paper>

      <Button
        component={Link}
        href="/"
        sx={{
          mt: 3,
          color: 'white',
          textDecoration: 'none',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        กลับหน้าหลัก
      </Button>

      <Box
        sx={{
          width: 400,
          height: 40,
          backgroundColor: '#070C7A',
          borderRadius: '20px',
          filter: 'blur(50px)',
          mt: 4,
          opacity: 0.6
        }}
      />
    </Box>
  );
};

export default Login;
