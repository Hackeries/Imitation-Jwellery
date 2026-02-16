// lib/debug-products.ts
/**
 * Debug utility for product fetching issues
 * Use this in the browser console to diagnose API/data issues
 */

export const debugProductFetching = {
  /**
   * Check what categories are available in the cache
   */
  async checkCategoryCache() {
    const { getCategoryBySlug, clearCategoryCache } = await import(
      "@/services/category-service"
    );

    console.log("[DEBUG] Checking category cache...");
    const testSlugs = [
      "pendant",
      "Pendant",
      "earring",
      "bracelet",
      "earring-set",
      "earring",
    ];

    for (const slug of testSlugs) {
      const category = await getCategoryBySlug(slug);
      console.log(
        `  - ${slug}: ${
          category ? `${category.title} (${category.id})` : "NOT FOUND"
        }`
      );
    }
  },

  /**
   * Manually test the API endpoint
   */
  async testAPIEndpoint(params: Record<string, string | number> = {}) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8018";
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      searchParams.append(key, String(value));
    }

    const url = `${baseUrl}/api/v1/products?${searchParams.toString()}`;
    console.log("[DEBUG] Testing API at:", url);

    try {
      const response = await fetch(url);
      const data = await response.json();

      console.log("[DEBUG] API Response Status:", response.status);
      console.log("[DEBUG] API Response Data:", data);
      console.log("[DEBUG] Response Type Check:", {
        hasData: !!data.data,
        dataIsArray: Array.isArray(data.data),
        hasDataItems: !!data.data?.items,
        itemsCount: data.data?.items?.length || data.data?.length || 0,
      });

      return data;
    } catch (error) {
      console.error("[DEBUG] API Error:", error);
      throw error;
    }
  },

  /**
   * Test fetching products for a specific category
   */
  async testCategoryProducts(categorySlug: string) {
    const { getCategoryIdBySlug } = await import("@/services/category-service");

    console.log(`[DEBUG] Testing category: ${categorySlug}`);

    const categoryId = await getCategoryIdBySlug(categorySlug);
    console.log(`  - Resolved ID: ${categoryId}`);

    if (!categoryId) {
      console.warn(`  - FAILED to resolve category slug`);
      return null;
    }

    return this.testAPIEndpoint({
      categoryId,
      page: 1,
      limit: 10,
    });
  },
};

// Export for global access in console
if (typeof window !== "undefined") {
  (window as any).__debugProducts = debugProductFetching;
}
