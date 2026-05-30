import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { Sidebar } from "@/components/ui/Sidebar";

export const metadata: Metadata = {
  title: "My Dashboard",
  description: "Personal productivity dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-cream min-h-screen font-sans antialiased">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-56 p-6 min-h-screen">
            {children}
          </main>
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#fdf6ec",
              color: "#44403c",
              border: "1px solid #e7e5e4",
              borderRadius: "12px",
              fontFamily: "Georgia, serif",
            },
          }}
        />
      </body>
    </html>
  );
}
