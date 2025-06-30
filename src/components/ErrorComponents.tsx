import Link from 'next/link'

interface ErrorDisplayProps {
  error: Error
  retry?: () => void
}

export function ErrorDisplay({ error, retry }: ErrorDisplayProps) {
  const isNotFound = error.message.includes('Not found')
  const isForbidden = error.message.includes('Access denied')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          {isNotFound ? (
            <>
              <div className="text-red-600 text-6xl mb-4">404</div>
              <h2 className="text-xl font-semibold text-red-800 mb-2">
                Purchase Order Not Found
              </h2>
              <p className="text-red-600 mb-4">
                The requested purchase order could not be found.
              </p>
            </>
          ) : isForbidden ? (
            <>
              <div className="text-red-600 text-6xl mb-4">🔒</div>
              <h2 className="text-xl font-semibold text-red-800 mb-2">
                Access Denied
              </h2>
              <p className="text-red-600 mb-4">
                You don&apos;t have permission to view this purchase order.
              </p>
            </>
          ) : (
            <>
              <div className="text-red-600 text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-red-800 mb-2">
                Something went wrong
              </h2>
              <p className="text-red-600 mb-4">
                {error.message || 'An unexpected error occurred.'}
              </p>
            </>
          )}
          
          <div className="space-y-2">
            {retry && (
              <button
                onClick={retry}
                className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            )}
            <Link
              href="/"
              className="block w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
            >
              Go Back Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-8">
      <div className="text-gray-400 text-4xl mb-4">📋</div>
      <p className="text-gray-600">{message}</p>
    </div>
  )
}