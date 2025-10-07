import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed left-0 right-0 top-6 z-50 flex justify-center pointer-events-auto">
      <div className="mx-4 w-full max-w-5xl">
        <div className="backdrop-blur-md bg-background/60 border border-white/6 dark:border-white/10 rounded-2xl shadow-lg px-5 py-3 flex items-center justify-between">
          <Link href="/" className="font-semibold text-lg">
            retrack
          </Link>
          <div className="flex gap-4">
              <Link href="/register" className="text-sm opacity-90 hover:opacity-100">
                Register
              </Link>
            <Link href="/login" className="text-sm opacity-90 hover:opacity-100">
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
