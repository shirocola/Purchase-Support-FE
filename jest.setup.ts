import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Mock Next.js router
jest.mock('next/navigation', () => require('next-router-mock'));

// Setup global fetch polyfill
global.fetch = require('whatwg-fetch').fetch;

// Polyfill for TextEncoder/TextDecoder (required by some MUI components)
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}