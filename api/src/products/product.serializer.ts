import { getLocalizedFields, type SupportedLocale } from '../common/utils/locale';

export function serializeProduct(product: any, locale?: SupportedLocale) {
  const fields = locale ? getLocalizedFields(product.translations, locale) : {};

  return {
    id: product.id,
    name: fields.name || product.name,
    slug: fields.slug || product.slug,
    description: fields.description ?? product.description,
    stock: product.stock,
    priceCents: product.priceCents,
    status: product.status,
    seoTitle: fields.seoTitle || product.seoTitle,
    seoDescription: fields.seoDescription ?? product.seoDescription,
    seoKeywords: fields.seoKeywords || product.seoKeywords,
    canonicalUrl: fields.canonicalUrl || product.canonicalUrl,
    translations: product.translations,
    categories:
      product.categories?.map((item: any) => {
        const categoryFields = locale
          ? getLocalizedFields(item.category.translations, locale)
          : {};
        return {
          id: item.category.id,
          name: categoryFields.name || item.category.name,
          slug: categoryFields.slug || item.category.slug,
        };
      }) ?? [],
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
