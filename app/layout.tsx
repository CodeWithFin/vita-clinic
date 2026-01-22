import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vitapharm Wellness Spa",
  description: "An invitation to slow down. Restore your body, quiet the mind, and reconnect within.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Lato:wght@300;400&display=swap" rel="stylesheet" />
      </head>
      <body
        className="bg-stone-900 font-body text-stone-100 antialiased selection:bg-[#4A5D4F] selection:text-white w-full min-h-screen overflow-x-hidden relative"
      >
        {children}
      </body>
    </html>
  );
}
