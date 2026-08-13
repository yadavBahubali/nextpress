import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import "bootstrap/dist/css/bootstrap.min.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "aos/dist/aos.css";
import "yet-another-react-lightbox/styles.css";
import "react-quill-new/dist/quill.snow.css";

import Providers from "@/components/common/Providers";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NextPress | Premium Ecommerce CMS",
  description: "Enterprise-grade Ecommerce and CMS platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head />
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
