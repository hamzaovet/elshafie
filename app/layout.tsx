import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#047857",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "سوبر ماركت أولاد الشافعي | الحي السادس - 6 أكتوبر — تسوق البقالة والطازج",
  description: "سوبر ماركت أولاد الشافعي — خدمة التوصيل السريع للمنازل في مدينة السادس من أكتوبر والشيخ زايد. أجبان، لحوم، خضروات، بقالة، مؤن ومنظفات بأفضل جودة وأسعار الجملة.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning={true}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased font-['Cairo',sans-serif]"
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
