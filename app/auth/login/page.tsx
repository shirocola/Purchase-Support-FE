'use client';

import React, { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { BrowserAuthError } from "@azure/msal-browser";
import axios from 'axios';
import { useAuth } from '../../../lib/contexts/auth-context';
import { getUserByToken, login, getUserByModule } from '../../../lib/api/auth';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Divider,
  Collapse
} from '@mui/material';
import {
  Microsoft as MicrosoftIcon,
  Login as LoginIcon,
  ExpandMore as ExpandMoreIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { transactionlog } from "../../../lib/utils/utils";

/**
 * Login Component
 * 
 * หน้าเข้าสู่ระบบที่รองรับ 2 วิธี:
 * 1. Azure AD Authentication (สำหรับ AD User หรือ Email บริษัท)
 * 2. Manual Login (สำหรับบัญชีแอปพลิเคชัน)
 * 
 * Features:
 * - OAuth2 token integration สำหรับ backend authentication
 * - Microsoft Graph API integration สำหรับดึงข้อมูล user
 * - Role-based access control (RBAC)
 * - Responsive design
 * - Form validation และ error handling
 * - Mock authentication สำหรับ development
 */
const Login = () => {
  // ===============================
  // MSAL และ Auth Context Hooks
  // ===============================

  /** MSAL hooks สำหรับ Azure AD authentication */
  const { accounts, instance } = useMsal();

  /** Auth context สำหรับจัดการ authentication state */
  const { saveAuth, setCurrentUser } = useAuth();

  // ===============================
  // Component State Management
  // ===============================

  /** ควบคุมการแสดง/ซ่อนฟอร์ม manual login */
  const [openManualLogin, setOpenManualLogin] = useState(false);

  /** Loading state สำหรับ manual login */
  const [isLoading, setIsLoading] = useState(false);

  /** Loading state สำหรับ Azure AD login */
  const [azureLoading, setAzureLoading] = useState(false);

  // ===============================
  // Form Input States
  // ===============================

  /** ชื่อผู้ใช้สำหรับ manual login */
  const [username, setUsername] = useState("");

  /** รหัสผ่านสำหรับ manual login */
  const [password, setPassword] = useState("");

  // ===============================
  // Error States
  // ===============================

  /** Error message สำหรับ field ชื่อผู้ใช้ */
  const [usernameError, setUsernameError] = useState("");

  /** Error message สำหรับ field รหัสผ่าน */
  const [passwordError, setPasswordError] = useState("");

  /** Error message ทั่วไปสำหรับกระบวนการ login */
  const [loginError, setLoginError] = useState("");

  // ===============================
  // Environment Configuration
  // ===============================

  /** Module ID สำหรับตรวจสอบสิทธิ์เข้าถึงโมดูล */
  const envModuleId = process.env.NEXT_PUBLIC_MODULE_ID || '';

  /** เปิด/ปิดโหมด mock authentication สำหรับ development */
  const enableMockAuth = process.env.NEXT_PUBLIC_ENABLE_MOCK_AUTH === 'true';

  /** เปิด/ปิดการใช้งาน Azure AD (MSAL) */
  const enableClientMsal = process.env.NEXT_PUBLIC_ENABLE_CLIENT_MSAL === 'true';

  /** Microsoft Graph API endpoint configuration */
  const graphConfig = {
    graphMeEndpoint: process.env.NEXT_PUBLIC_GRAPH_ME_ENDPOINT || "https://graph.microsoft.com/v1.0/me",
    graphMeUserEndpoint: process.env.NEXT_PUBLIC_GRAPH_ME_USER_ENDPOINT || "https://graph.microsoft.com/v1.0/users"
  };

  // ===============================
  // Microsoft Graph API Integration
  // ===============================

  /**
   * เรียก Microsoft Graph API เพื่อดึงข้อมูลผู้ใช้
   * 
   * @param accessToken - Azure AD access token
   * @returns Promise<UserInfo> - ข้อมูลผู้ใช้จาก Microsoft Graph
   * @throws Error - เมื่อ API call ล้มเหลว
   */
  async function callMsGraph(accessToken: string) {
    // สร้าง authorization header
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;
    headers.append("Authorization", bearer);

    const options = {
      method: "GET",
      headers: headers
    };

    try {
      console.log('Calling Microsoft Graph API...');

      // เรียก Microsoft Graph API
      const response = await fetch(graphConfig.graphMeEndpoint, options);

      // ตรวจสอบ response status
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Graph API error response:', errorText);
        throw new Error(`Graph API error: ${response.status} - ${errorText}`);
      }

      // Parse JSON response
      const userInfo = await response.json();
      console.log('Graph API success:', {
        mail: userInfo.mail,
        userPrincipalName: userInfo.userPrincipalName,
        displayName: userInfo.displayName
      });

      return userInfo;
    } catch (error) {
      console.error('Microsoft Graph API error:', error);
      throw new Error(`Failed to get user info from Microsoft Graph: ${error}`);
    }
  }

  // ===============================
  // OAuth2 Token Management
  // ===============================

  /**
   * ขอ OAuth2 client credentials token สำหรับ backend authentication
   * 
   * ใช้ client credentials flow เพื่อขอ app token จาก backend
   * Token นี้จะใช้ authenticate กับ backend API
   * 
   * @returns Promise<string> - OAuth2 access token
   * @throws Error - เมื่อไม่สามารถขอ token ได้
   */
  async function getOAuth2Token() {
    // ดึง configuration จาก environment variables
    const scApiUrl = process.env.NEXT_PUBLIC_SC_API_URL;
    const clientId = process.env.NEXT_PUBLIC_APP_CLIENT_ID;
    const clientSecret = process.env.NEXT_PUBLIC_APP_CLIENT_SECRET;
    const grantType = process.env.NEXT_PUBLIC_APP_GRANT_TYPE;

    // ตรวจสอบ required configuration
    if (!scApiUrl || !clientId || !clientSecret || !grantType) {
      throw new Error('Missing required OAuth2 configuration. Please check environment variables.');
    }

    // สร้าง form data สำหรับ OAuth2 token request
    const tokenParams = new URLSearchParams();
    tokenParams.append('client_id', clientId);
    tokenParams.append('client_secret', clientSecret);
    tokenParams.append('grant_type', grantType);

    // เรียก OAuth2 token endpoint
    const response = await fetch(`${scApiUrl}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams.toString()
    });

    // ตรวจสอบ response
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get OAuth2 token: ${response.status} - ${errorText}`);
    }

    // Parse และคืน access token
    const tokenData = await response.json();
    return tokenData.access_token;
  }

  // ===============================
  // Azure AD Authentication Flow
  // ===============================

  /**
   * จัดการกระบวนการ Azure AD authentication
   * 
   * ตอนนี้: ทดสอบเฉพาะ OAuth2 token ขั้นตอนแรก
   */
  async function handleAzureAuthentication() {
    if (!enableClientMsal) {
      setLoginError('Azure AD authentication is disabled in this environment');
      return;
    }

    try {
      setAzureLoading(true);
      setLoginError("");

      console.log('=== Testing OAuth2 + Azure AD Login ===');

      // ✅ Step 1: OAuth2 token (ผ่านแล้ว)
      console.log('Step 1: Getting OAuth2 client credentials token...');
      const oauthToken = await getOAuth2Token();
      console.log('✅ OAuth2 token obtained successfully');

      // ✅ Step 2: Azure AD login (ทดสอบขั้นตอนนี้)
      console.log('Step 2: Starting Azure AD login...');
      const azureResponse = await instance.loginPopup({
        scopes: [
          process.env.NEXT_PUBLIC_USER_READ_SCOPE || "User.Read",
          "openid",
          "profile",
          "email"
        ]
      });

      console.log('✅ Azure AD login successful:', {
        hasAccessToken: !!azureResponse.accessToken,
        hasIdToken: !!azureResponse.idToken,
        expiresOn: azureResponse.expiresOn,
        scopes: azureResponse.scopes
      });

      // แสดงผลสำเร็จ Step 2
      setLoginError(`✅ Step 1 & 2 Success!\n\nOAuth2 Token: ✅\nAzure AD Login: ✅\n\nNetwork tab should show:\n1. POST /oauth2/token → 200 OK\n2. Azure AD authentication flow\n\nReady for Step 3 (Microsoft Graph API)!`);

      // Step 3: Microsoft Graph API (ดึงข้อมูล user)
      console.log('Step 3: Calling Microsoft Graph API...');
      const userInfo = await callMsGraph(azureResponse.accessToken);

      console.log('✅ Microsoft Graph API success:', {
        mail: userInfo.mail,
        userPrincipalName: userInfo.userPrincipalName,
        displayName: userInfo.displayName
      });

      // แสดงผลลัพธ์บน UI
      setLoginError(
        `✅ Step 1, 2, 3 Success!
OAuth2 Token: ✅
Azure AD Login: ✅
Microsoft Graph API: ✅

User: ${userInfo.displayName || userInfo.userPrincipalName || userInfo.mail}`
      );

      // Step 4: Backend signin_az (uncomment ตรงนี้)
      console.log('Step 4: Sending authentication to backend...');
      const scApiUrl = process.env.NEXT_PUBLIC_SC_API_URL;
      const loginUrlAz = `${scApiUrl}/auth/signin_az`;

      console.log('Backend request details:', {
        url: loginUrlAz,
        username: userInfo.mail,
        hasOAuthToken: !!oauthToken,
        oauthTokenPreview: oauthToken?.substring(0, 20) + '...'
      });

      try {
        // ✅ ใหม่ - ส่งเฉพาะ username ตามโปรเจกต์ที่ใช้งานได้
        const { data: auth } = await axios.post(loginUrlAz, {
          username: userInfo.mail  // ส่งเฉพาะ username
        }, {
          headers: {
            'Authorization': `Bearer ${oauthToken}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('✅ Backend authentication successful:', {
          userId: auth.user?.id,
          accessToken: auth.accessToken ? 'received' : 'missing',
          user: auth.user?.username || auth.user?.email
        });

        // แสดงผลสำเร็จครบทุก step
        setLoginError(
          `✅ All Steps Success!
OAuth2 Token: ✅
Azure AD Login: ✅ 
Microsoft Graph API: ✅
Backend Authentication: ✅

User: ${userInfo.displayName}
Ready to redirect to main app!`
        );

        // Step 5: Module access check และ redirect
        saveAuth(auth);

        // 🚀 API Call 1: Verify token
        console.log('Step 5.1: Verifying token...');
        const { data: user } = await getUserByToken(auth.accessToken);
        console.log('✅ Token verification successful:', {
          userId: user.id,
          username: user.username,
          email: user.email
        });

        // 🚀 API Call 2: Check module access
        console.log('Step 5.2: Checking module access...');
        const userByModule = await getUserByModule(user.id, envModuleId);
        console.log('✅ Module access check:', {
          userId: user.id,
          moduleId: envModuleId,
          hasAccess: !!userByModule
        });

        if (userByModule) {
          await transactionlog({
            log: 'azure_login',
            type: 'access'
          });

          setCurrentUser(user);
          localStorage.setItem('azure', 'false');

          console.log('Authentication complete, redirecting...');
          window.location.href = '/';
          return;
        } else {
          setLoginError('User does not have access to this module.');
          return;
        }

      } catch (apiError) {
        console.error('Backend authentication failed:', apiError);

        if (axios.isAxiosError(apiError)) {
          const errorResponse = apiError.response;
          console.error('Backend error details:', {
            status: errorResponse?.status,
            data: errorResponse?.data,
            headers: errorResponse?.headers
          });

          if (errorResponse?.status === 401) {
            setLoginError(`❌ Backend Authentication Failed (401)

Error: ${errorResponse.data?.error || 'Unauthorized'}
Message: ${errorResponse.data?.error_description || 'Invalid credentials'}

Token Info:
• OAuth2 Token: ${oauthToken ? 'Available' : 'Missing'}
• Azure Token: ${azureResponse.accessToken ? 'Available' : 'Missing'}

Please check backend configuration.`);
          } else {
            const errorMsg = errorResponse?.data?.error_description ||
              errorResponse?.data?.message ||
              apiError.message;
            setLoginError(`❌ Backend Error: ${errorMsg}`);
          }
        } else {
          setLoginError('❌ Network error occurred');
        }
        return;
      }

    } catch (error: unknown) {
      console.error('❌ Authentication Error:', error);
      saveAuth(undefined);

      if (error instanceof BrowserAuthError) {
        if (error.errorCode === "user_cancelled") {
          setLoginError("❌ Azure AD Login Cancelled\n\nUser cancelled the login popup.");
        } else {
          setLoginError(`❌ Azure AD Error\n\n${error.errorCode}: ${error.errorMessage}`);
        }
      } else if (error instanceof Error) {
        if (error.message.includes('OAuth2')) {
          setLoginError(`❌ OAuth2 Token Error\n\n${error.message}`);
        } else {
          setLoginError(`❌ Error: ${error.message}`);
        }
      } else {
        setLoginError('❌ Unknown error occurred');
      }
    } finally {
      setAzureLoading(false);
    }
  }

  // ===============================
  // Manual Login Flow
  // ===============================

  /**
   * จัดการกระบวนการ manual login
   * 
   * รองรับ:
   * - Mock authentication สำหรับ development
   * - Real authentication ผ่าน backend API
   * - Form validation
   * - Module access control
   */
  async function handleManualLogin() {
    try {
      setIsLoading(true);
      clearErrors();

      // Form validation
      let hasErrors = false;
      if (!username.trim()) {
        setUsernameError('กรุณาระบุชื่อผู้ใช้');
        hasErrors = true;
      }
      if (!password.trim()) {
        setPasswordError('กรุณาระบุรหัสผ่าน');
        hasErrors = true;
      }

      if (hasErrors) {
        return;
      }

      // Mock authentication สำหรับ development
      if (enableMockAuth && username === 'admin' && password === 'admin') {
        const mockAuth = {
          id: 1,
          username: 'admin',
          email: 'admin@osotspa.com',
          roles: ['ADMIN'],
          accessToken: 'mock-admin-token',
          accessgroup: 1,
          fullname: 'Administrator',
          position: 'System Administrator'
        };

        saveAuth(mockAuth);
        setCurrentUser(mockAuth);
        localStorage.setItem('azure', 'false');

        await transactionlog({
          log: 'login',
          type: 'access'
        });

        window.location.href = '/';
        return;
      }

      // Real authentication ผ่าน backend API
      const { data: auth } = await login(username, password);
      saveAuth(auth);

      // ตรวจสอบ user และสิทธิ์เข้าถึงโมดูล
      const { data: user } = await getUserByToken(auth.accessToken);
      const userByModule = await getUserByModule(user.id, envModuleId);

      if (userByModule) {
        await transactionlog({
          log: 'login',
          type: 'access'
        });

        setCurrentUser(user);
        localStorage.setItem('azure', 'false');

        window.location.href = '/';
      }

    } catch (error: unknown) {
      saveAuth(undefined);
      console.error('Manual login error:', error);

      // จัดการ error message
      if (error instanceof Error) {
        if ('response' in error && typeof error.response === 'object' && error.response !== null) {
          const response = error.response as { data?: { message?: string } };
          if (response.data?.message) {
            setLoginError(response.data.message);
          } else {
            setLoginError(error.message);
          }
        } else if (error.message?.includes('no request')) {
          setLoginError("ไม่มีสิทธิ์เข้าถึงระบบ");
        } else {
          setLoginError(error.message);
        }
      } else {
        setLoginError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      }
    } finally {
      setIsLoading(false);
    }
  }

  // ===============================
  // Utility Functions
  // ===============================

  /**
   * ล้าง error messages ทั้งหมด
   */
  function clearErrors() {
    setUsernameError("");
    setPasswordError("");
    setLoginError("");
  }

  /**
   * สลับการแสดง/ซ่อนฟอร์ม manual login
   */
  function handleToggleManualLogin() {
    setOpenManualLogin(!openManualLogin);
    if (!openManualLogin) {
      setUsername("");
      setPassword("");
      clearErrors();
    }
  }

  /**
   * จัดการการเปลี่ยนแปลงค่าใน username field
   */
  function handleUsernameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUsername(e.target.value);
    setUsernameError("");
    setLoginError("");
  }

  /**
   * จัดการการเปลี่ยนแปลงค่าใน password field
   */
  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value);
    setPasswordError("");
    setLoginError("");
  }

  /**
   * จัดการการกดปุ่ม Enter ในฟอร์ม
   */
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (username.trim() && password.trim()) {
        handleManualLogin();
      }
    }
  }

  // ===============================
  // Component Render
  // ===============================

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
      {/* Logo Section */}
      <Box sx={{ mb: 2 }}>
        <img
          src="/PurchaseSupport.Logo.png"
          alt="Logo"
          style={{ width: 150, height: 'auto' }}
        />
      </Box>

      {/* Title Section */}
      <Typography
        variant="h3"
        component="h1"
        sx={{
          color: 'white',
          fontWeight: 300,
          textAlign: 'center',
          mb: openManualLogin ? 2 : 4,
          fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' }
        }}
      >
        Purchase Support System
      </Typography>

      {/* Main Login Card */}
      <Paper
        elevation={8}
        sx={{
          width: { xs: '100%', sm: 400 },
          maxWidth: 400,
          p: 3,
          borderRadius: 2
        }}
      >
        {/* Card Header */}
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

        {/* Azure AD Login Button */}
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

        {/* Alternative Login Hint */}
        <Typography
          variant="body2"
          sx={{
            textAlign: 'center',
            color: '#009FB0',
            mb: 2,
            lineHeight: 1.5
          }}
        >
          ไม่มีบัญชีผู้ใช้ AD User หรือ Email บริษัท
          <br />
          (No AD User or Company Email)
        </Typography>

        {/* Global Error Display (แสดงเมื่อไม่ได้เปิดฟอร์ม manual login) */}
        {loginError && !openManualLogin && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {loginError}
          </Alert>
        )}

        {/* Manual Login Toggle Button */}
        <Button
          fullWidth
          variant="outlined"
          onClick={handleToggleManualLogin}
          endIcon={
            <ExpandMoreIcon
              sx={{
                transform: openManualLogin ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }}
            />
          }
          sx={{ mb: 2 }}
        >
          เข้าสู่ระบบด้วยบัญชีแอปพลิเคชัน
        </Button>

        {/* Manual Login Form (Collapsible) */}
        <Collapse in={openManualLogin}>
          <Box sx={{ pt: 2 }}>
            <Divider sx={{ mb: 3 }} />

            {/* Username Input Field */}
            <TextField
              fullWidth
              label="ชื่อผู้ใช้ *"
              variant="outlined"
              value={username}
              onChange={handleUsernameChange}
              error={!!usernameError}
              helperText={usernameError}
              sx={{ mb: 2 }}
              autoComplete="username"
            />

            {/* Password Input Field */}
            <TextField
              fullWidth
              label="รหัสผ่าน *"
              type="password"
              variant="outlined"
              value={password}
              onChange={handlePasswordChange}
              onKeyDown={handleKeyDown}
              error={!!passwordError}
              helperText={passwordError}
              sx={{ mb: 2 }}
              autoComplete="current-password"
            />

            {/* Login Error Display */}
            {loginError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {loginError}
              </Alert>
            )}

            {/* Manual Login Submit Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleManualLogin}
              disabled={isLoading || !username.trim() || !password.trim()}
              startIcon={isLoading ? <CircularProgress size={20} /> : <LoginIcon />}
              sx={{
                py: 1.5,
                backgroundColor: '#122B6F',
                '&:hover': {
                  backgroundColor: '#0d1f54'
                }
              }}
            >
              {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </Button>

            {/* Development Mode Hint */}
            {enableMockAuth && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="caption">
                  โหมดพัฒนา: ใช้ admin/admin สำหรับทดสอบ
                </Typography>
              </Alert>
            )}
          </Box>
        </Collapse>
      </Paper>

      {/* Back to Home Link */}
      <Button
        component={Link}
        href="/"
        startIcon={<HomeIcon />}
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

      {/* Background Decoration - Blur Effect */}
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