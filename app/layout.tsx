import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "swangcreates",
  description: "stuff I make",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('theme');
                if (theme === 'light' || theme === 'dark') {
                  document.documentElement.dataset.theme = theme;
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="bg-background text-foreground font-sans">

        <header className="p-6 border-b border-border bg-surface">
          <nav className="max-w-5xl mx-auto grid grid-cols-[1fr_auto_1fr] items-center">
            <div />
            <Link href="/" className="text-xl font-bold hover:underline">
              swangcreates.
            </Link>
            <div className="flex justify-end">
              <ThemeToggle />
            </div>
          </nav>
        </header>

        <main className="max-w-5xl mx-auto p-6">{children}</main>
        <footer className="text-center p-6 text-sm text-muted">
          © {new Date().getFullYear()} swangcreates
        </footer>
      </body>
    </html>
  );
}
