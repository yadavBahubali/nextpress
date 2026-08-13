import Script from "next/script";
import "./globals.css";

export const metadata = {
  title: "Home",
  description: "",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com/" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com/"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Albert+Sans:ital,wght@0,100..900;1,100..900&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Outfit:wght@100..900&display=swap"
        rel="stylesheet"
      />

      {/* Vendor CSS */}
      <link rel="stylesheet" href="/assets/vendor/bootstrap/bootstrap.min.css" />
      <link rel="stylesheet" href="/assets/vendor/fontawesome-pro/fontawesome.min.css" />
      {/* <link rel="stylesheet" href="/assets/vendor/animate/animate.min.css" /> */}
      <link rel="stylesheet" href="/assets/css/spacing.css" />
      <link rel="stylesheet" href="/assets/css/main.css" />

      <div className="public-layout d-flex flex-column min-vh-100">
        <main>{children}</main>
      </div>

      <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" strategy="lazyOnload" />
    </>
  );
}
