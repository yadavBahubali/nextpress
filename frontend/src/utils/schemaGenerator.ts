/**
 * Schema Generator Utility
 * Automatically generates JSON-LD payloads based on site settings and page content.
 */

import { SeoVariables } from "./seoVariableEngine";

export type SchemaType = 'Organization' | 'Article' | 'BlogPosting' | 'FAQPage' | 'WebSite' | 'LocalBusiness';

interface SchemaInput {
  type: SchemaType;
  variables: SeoVariables;
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
}

export const generateJsonLd = (input: SchemaInput): any => {
  const { type, variables, title, description, url, image, datePublished, dateModified } = input;
  
  const siteUrl = variables.site_domain || 'https://nextpress.com';
  const fullUrl = url.startsWith('http') ? url : `${siteUrl}${url.startsWith('/') ? '' : '/'}${url}`;

  const baseSchema: any = {
    "@context": "https://schema.org",
  };

  switch (type) {
    case 'Organization':
      return {
        ...baseSchema,
        "@type": "Organization",
        "name": variables.company_name || variables.site_name || "NextPress",
        "url": siteUrl,
        "logo": variables.site_logo || "",
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": variables.company_phone || "",
          "contactType": "customer service",
          "email": variables.company_email || ""
        },
        "sameAs": [
          variables.social_facebook,
          variables.social_linkedin,
          variables.social_x,
          variables.social_instagram
        ].filter(Boolean)
      };

    case 'BlogPosting':
    case 'Article':
      return {
        ...baseSchema,
        "@type": type,
        "headline": title,
        "description": description,
        "image": image || variables.featured_image || "",
        "datePublished": datePublished || new Date().toISOString(),
        "dateModified": dateModified || new Date().toISOString(),
        "author": {
          "@type": "Person",
          "name": variables.author || variables.company_name || "Admin"
        },
        "publisher": {
          "@type": "Organization",
          "name": variables.site_name || "NextPress",
          "logo": {
            "@type": "ImageObject",
            "url": variables.site_logo || ""
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": fullUrl
        }
      };

    case 'WebSite':
      return {
        ...baseSchema,
        "@type": "WebSite",
        "name": variables.site_name || "NextPress",
        "url": siteUrl,
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      };

    default:
      return {
        ...baseSchema,
        "@type": type,
        "name": title,
        "description": description,
        "url": fullUrl
      };
  }
};
