import Link from 'next/link'

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Purchase Support System</h1>
      <div className="space-y-4">
        <Link 
          href="/po/po-001" 
          className="block p-4 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
        >
          View Sample PO Detail (PO-001)
        </Link>
      </div>
    </main>
  )
}
