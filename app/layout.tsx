import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vita Clinic - Clinic Management System",
  description: "Booking and Queue Management System for VitaPharm Wellness Clinic",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.Node;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Lato:wght@300;400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-stone-900 font-body text-stone-100 antialiased selection:bg-primary selection:text-white">
        {children}
      </body>
    </html>
  );
}
