import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase/client";
import { AuthProvider } from "@/context/auth-context";
import { TranslationProvider } from "@/context/translation-context";
import { AppShell } from "@/components/layout/app-shell";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${spaceGrotesk.className} h-full antialiased`}>
        <FirebaseClientProvider>
          <AuthProvider>
            <TranslationProvider>
              <AppShell>{children}</AppShell>
              <Toaster />
            </TranslationProvider>
          </AuthProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
