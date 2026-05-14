import type { Metadata } from "next";
import "./globals.css";
import FaceApiLoader from "@/components/FaceApiLoader";

export const metadata: Metadata = {
  title: "Emergency Face Tracker",
  description: "Emergency details tracking with face detection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <FaceApiLoader />
        {children}
      </body>
    </html>
  );
}
