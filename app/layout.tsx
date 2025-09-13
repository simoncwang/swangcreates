import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "swangcreates",
  description: "stuff I make",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 font-sans">

        <header className="p-6 shadow-md bg-white">
          <nav className="max-w-5xl mx-auto flex justify-center items-center">
            <Link href="/" className="text-xl font-bold hover:underline">
              swangcreates
            </Link>
          </nav>
        </header>

        <main className="max-w-5xl mx-auto p-6">{children}</main>
        <footer className="text-center p-6 text-sm text-gray-500">
          © {new Date().getFullYear()} swangcreates
        </footer>
      </body>
    </html>
  );
}
