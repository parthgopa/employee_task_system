import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TaskFlow — Employee Daily Task System",
  description: "Professional employee productivity and task management system",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-light)",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--text-sm)",
              },
              success: { iconTheme: { primary: "var(--success)", secondary: "#fff" } },
              error:   { iconTheme: { primary: "var(--danger)",  secondary: "#fff" } },
            }}
          />
        </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
