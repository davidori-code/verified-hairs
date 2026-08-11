export interface ProductBadgeInput {
    createdAt: Date;
    priceInSmallestUnit: number;
    compareAtPriceInSmallestUnit: number | null;
    unitsSold: number;
    favoriteCount: number;
  }
  
  export interface ProductBadge {
    label: string;
    tone: "dark" | "honey";
  }
  
  const NEW_ARRIVAL_WINDOW_DAYS = 7;
  const HOT_SALES_THRESHOLD = 5;
  const POPULAR_FAVORITES_THRESHOLD = 3;
  
  /**
   * Only ONE badge is ever shown per product — stacking multiple badges
   * reads as cluttered and starts to feel dishonest ("everything is on
   * sale AND popular AND new?"). Priority order below reflects what's most
   * useful to a buyer deciding what to click: a genuine discount matters
   * most, then real sales momentum, then recency, then general popularity.
   */
  export function computeProductBadge(product: ProductBadgeInput): ProductBadge | null {
    if (
      product.compareAtPriceInSmallestUnit &&
      product.compareAtPriceInSmallestUnit > product.priceInSmallestUnit
    ) {
      const percentOff = Math.round(
        ((product.compareAtPriceInSmallestUnit - product.priceInSmallestUnit) /
          product.compareAtPriceInSmallestUnit) *
          100
      );
      return { label: `${percentOff}% OFF`, tone: "honey" };
    }
  
    if (product.unitsSold >= HOT_SALES_THRESHOLD) {
      return { label: "Hot Sales", tone: "honey" };
    }
  
    const ageInDays = (Date.now() - product.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (ageInDays <= NEW_ARRIVAL_WINDOW_DAYS) {
      return { label: "New Arrival", tone: "dark" };
    }
  
    if (product.favoriteCount >= POPULAR_FAVORITES_THRESHOLD) {
      return { label: "Popular", tone: "dark" };
    }
  
    return null;
  }
  