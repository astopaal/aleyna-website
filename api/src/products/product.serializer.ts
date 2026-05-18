export function serializeProduct(product: any) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    stock: product.stock,
    priceCents: product.priceCents,
    status: product.status,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    seoKeywords: product.seoKeywords,
    canonicalUrl: product.canonicalUrl,
    categories:
      product.categories?.map((item: any) => ({
        id: item.category.id,
        name: item.category.name,
        slug: item.category.slug,
      })) ?? [],
    images:
      product.images?.map((item: any) => ({
        id: item.media.id,
        url: item.media.url,
        altText: item.media.altText,
        width: item.media.width,
        height: item.media.height,
        sortOrder: item.sortOrder,
        isPrimary: item.isPrimary,
      })) ?? [],
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}
