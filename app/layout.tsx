import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "../contexts/AppContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Policy Hackathon AI Platform",
  description: "A web application for a Policy Hackathon with AI integration. It facilitates contest operations for both contestants and judges, featuring AI-powered topic generation, brainstorming chatbot, and scoring assistance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-100`}>
        <AppProvider>
          <div className="min-h-screen font-sans text-slate-900">
            {children}
          </div>
        </AppProvider>
      </body>
    </html>
  );
}