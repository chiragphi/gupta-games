import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Gupta Games - Play. Win. Reign.",
  description: "The ultimate Mughal Cyber Palace gaming experience. Play with Gupta Coins - pure entertainment, no real money.",
  keywords: ["casino", "games", "slots", "blackjack", "crash", "mines", "gupta coins"],
  openGraph: {
    title: "Gupta Games",
    description: "Play. Win. Reign.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Syne:wght@400;500;600;700;800&family=Orbitron:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col relative" style={{ backgroundColor: 'var(--void)', color: 'var(--text-primary)' }}>
        <div className="mandala-bg" />
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(13, 13, 31, 0.95)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                color: '#F5F5F0',
                fontFamily: "'Syne', sans-serif",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
