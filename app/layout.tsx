import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ContractProvider } from "./_contexts/ContractContext";

import Sidebar from "./_components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Swartz",
  description: "Decentralized social media platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <ContractProvider>
        <body className={inter.className}>
          <div className="flex h-screen bg-slate-300">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto pb-12 sm:px-6 lg:px-4">
                {/* <ConnectWallet/> */}
                {/* <ConnectButton client={client} /> */}
                {children}
              </div>
            </main>
          </div>
        </body>
      </ContractProvider>
    </html>
  );
}
