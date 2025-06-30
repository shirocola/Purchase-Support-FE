import '@testing-library/jest-dom'

// Mock fetch for testing
global.fetch = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
})