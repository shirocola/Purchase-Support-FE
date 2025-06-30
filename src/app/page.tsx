import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center">
        <h1 className="text-4xl font-bold text-center">
          Purchase Order Management System
        </h1>
        <p className="text-lg text-center text-gray-600">
          ระบบจัดการใบสั่งซื้อ (Purchase Order)
        </p>
        
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Link
            href="/po"
            className="rounded-lg border border-solid border-transparent transition-colors flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 font-medium text-base h-12 px-6"
          >
            ดูรายการ Purchase Order
          </Link>
          <Link
            href="/po/create"
            className="rounded-lg border border-solid border-gray-300 transition-colors flex items-center justify-center hover:bg-gray-50 font-medium text-base h-12 px-6"
          >
            สร้าง PO ใหม่
          </Link>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <p className="text-sm text-gray-500">
          Purchase Order Management System
        </p>
      </footer>
    </div>
  );
}
