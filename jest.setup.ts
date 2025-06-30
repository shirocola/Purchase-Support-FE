import '@testing-library/jest-dom';

// Polyfill for TextEncoder/TextDecoder (required by some MUI components)
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}