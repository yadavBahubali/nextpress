import { SeoVariables, resolveSeoVariables } from "./seoVariableEngine";

/**
 * SEO Runtime Resolver
 * Handles the waterfall priority logic for metadata:
 * 1. Manual Override (Strict override in SEO Tab)
 * 2. Page-Level SEO Fields (The main Title/Summary in Editor)
 * 3. Global Identity Templates (Fallbacks with variable resolution)
 */

export type SeoSource = 'manual' | 'page_field' | 'global' | 'auto';

export interface ResolvedSeoValue {
  value: string;
  source: SeoSource;
  label: string;
  isAuto: boolean;
}

export const resolveTitle = (
  manualOverride: string | null | undefined,
  pageSeoTitle: string | null | undefined,
  globalTemplate: string | null | undefined,
  variables: SeoVariables
): ResolvedSeoValue => {
  // 1. Manual Override (User explicitly typed in SEO Tab).
  // Resolved the same way the live public page resolves it (see
  // seoMetadata.ts's generatePageMetadata, which always runs manual
  // overrides through resolveSeoVariables) - otherwise a %tag% inserted via
  // the Variables toolbar shows as literal unresolved text here while the
  // real page renders it correctly, making the preview lie about the page.
  if (manualOverride && manualOverride.trim() !== '') {
    return {
      value: resolveSeoVariables(manualOverride, variables),
      source: 'manual',
      label: 'Custom SEO Override Active',
      isAuto: false
    };
  }

  // 2. Page-Level SEO Field (User typed in main "SEO Title / Public Page Title")
  if (pageSeoTitle && pageSeoTitle.trim() !== '') {
    return {
      value: pageSeoTitle,
      source: 'page_field',
      label: 'Inherited from Page SEO Title',
      isAuto: true
    };
  }

  // 3. Global Identity Template (Fallback)
  const template = globalTemplate || '%title% %sep% %site_name%';
  const resolved = resolveSeoVariables(template, variables);
  
  return {
    value: resolved,
    source: 'global',
    label: 'Using Global Default Template',
    isAuto: true
  };
};

export const resolveDescription = (
  manualOverride: string | null | undefined,
  pageSummary: string | null | undefined,
  globalFallback: string | null | undefined,
  variables: SeoVariables
): ResolvedSeoValue => {
  // 1. Manual Override (see the matching note in resolveTitle above)
  if (manualOverride && manualOverride.trim() !== '') {
    return {
      value: resolveSeoVariables(manualOverride, variables),
      source: 'manual',
      label: 'Custom SEO Override Active',
      isAuto: false
    };
  }

  // 2. Page-Level Summary/Excerpt
  if (pageSummary && pageSummary.trim() !== '') {
    return {
      value: pageSummary,
      source: 'page_field',
      label: 'Inherited from Page Summary',
      isAuto: true
    };
  }

  // 3. Global Fallback
  if (globalFallback && globalFallback.trim() !== '') {
    return {
      value: globalFallback,
      source: 'global',
      label: 'Using Global Fallback Description',
      isAuto: true
    };
  }

  // 4. Content Auto-Extraction (Absolute final fallback)
  const excerpt = variables.excerpt || '';
  return {
    value: excerpt,
    source: 'auto',
    label: 'Auto-extracted from content',
    isAuto: true
  };
};
