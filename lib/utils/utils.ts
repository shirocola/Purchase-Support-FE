// Transaction logging utility
export async function transactionlog(data: { log: string; type: string }) {
  try {
    // Mock implementation for development
    console.log('Transaction log:', data);
    
    // In production, this would make an API call
    // const response = await axios.post('/api/transaction-log', data);
    // return response.data;
    
    return Promise.resolve();
  } catch (error) {
    console.error('Transaction log error:', error);
    throw error;
  }
}

// Other utility functions
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB'
  }).format(amount);
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}