import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  // Use a template to automatically add '| FrontRow' to all page titles
  title: {
    template: '%s | FrontRow', 
    default: 'FrontRow', // Title for the root of your application
  },
  description: 'Browse movies and book movie tickets',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <Toaster richColors position="top-right" />
        <main className="">{children}</main>
        <Footer/>
      </body>
    </html>
  );
}
