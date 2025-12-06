import type { Metadata } from "next";
import {
  MedievalSharp,
  UnifrakturMaguntia,
  Bangers,
  Comic_Neue,
  Righteous,
  Press_Start_2P,
  Roboto,
  Oswald,
  PT_Sans,
  Montserrat,
  Rubik,
  Open_Sans,
} from "next/font/google";
import "@/styles/globals.css";

const medievalSharp = MedievalSharp({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-medieval",
});

const unifrakturMaguntia = UnifrakturMaguntia({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-decorative",
});

const bangers = Bangers({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bangers",
});

const comicNeue = Comic_Neue({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-comic-neue",
});

const righteous = Righteous({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-righteous",
});

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start-2p",
});

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin", "cyrillic"],
  variable: "--font-roboto",
});

const oswald = Oswald({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "cyrillic"],
  variable: "--font-oswald",
});

const ptSans = PT_Sans({
  weight: ["400", "700"],
  subsets: ["latin", "cyrillic"],
  variable: "--font-pt-sans",
});

const montserrat = Montserrat({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "cyrillic"],
  variable: "--font-montserrat",
});

const rubik = Rubik({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "cyrillic"],
  variable: "--font-rubik",
});

const openSans = Open_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "cyrillic"],
  variable: "--font-open-sans",
});

export const metadata: Metadata = {
  title: "Marginalia Memes - Medieval Meme Generator",
  description: "Create memes with medieval style images and text",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${medievalSharp.variable} ${unifrakturMaguntia.variable} ${bangers.variable} ${comicNeue.variable} ${righteous.variable} ${pressStart2P.variable} ${roboto.variable} ${oswald.variable} ${ptSans.variable} ${montserrat.variable} ${rubik.variable} ${openSans.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
