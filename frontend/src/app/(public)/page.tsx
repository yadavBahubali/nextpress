import { Metadata } from "next";
import { generatePageMetadata } from "@/utils/seoMetadata";
import { getPublicPageBySlug } from "@/utils/publicApi";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await getPublicPageBySlug("home");
    if (page) {
      return await generatePageMetadata("page", page.id, {
        title: page.title,
        slug: page.slug,
        excerpt: page.description || "",
      });
    }
  } catch (error) {
    console.error("Failed to generate metadata for home page:", error);
  }

  return {
    title: "Home",
    description: "",
  };
}

export default function Home() {
  return (
    <section className="container p-t-100 p-b-100">
      <h1>Home page</h1>
      <p>This page is a placeholder — build your homepage sections here.</p>
    </section>
  );
}
