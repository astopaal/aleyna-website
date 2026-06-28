import { PrismaClient, PublishStatus } from '@prisma/client';

const prisma = new PrismaClient();

function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

async function main() {
  console.log('📦 Veri göçü (Data Migration) başlıyor...');

  // 1. Tüm ürünleri al
  const oldProducts = await prisma.product.findMany({
    where: { deletedAt: null },
    include: {
      categories: true,
      images: {
        include: { media: true }
      },
      sliderTargets: true,
      heroTargets: true,
    }
  });

  console.log(`🔍 Toplam ${oldProducts.length} adet ürün bulundu. Dönüşüm başlıyor...`);

  let convertedCount = 0;
  let skippedCount = 0;

  for (const oldProduct of oldProducts) {
    // Eğer isimde '-' veya ' - ' yoksa atla (veya daha önceden ana ürün olarak eklendiyse)
    if (!oldProduct.name.includes('-')) {
      console.log(`⏭️  Atlanıyor (Varyant işareti '-' bulunamadı): ${oldProduct.name}`);
      skippedCount++;
      continue;
    }

    const parts = oldProduct.name.split('-');
    const parentName = parts[0].trim();
    const variantName = parts.slice(1).join('-').trim() || 'Standart';
    const parentSlug = generateSlug(parentName);

    // Ebeveyn ürünü (Örn: "Lavimar") bul veya oluştur
    let parentProduct = await prisma.product.findFirst({
      where: { slug: parentSlug, deletedAt: null }
    });

    if (!parentProduct) {
      parentProduct = await prisma.product.create({
        data: {
          name: parentName,
          slug: parentSlug,
          description: oldProduct.description,
          seoTitle: oldProduct.seoTitle, // Eski SEO ayarlarını ana ürüne taşıyoruz
          seoDescription: oldProduct.seoDescription,
          seoKeywords: oldProduct.seoKeywords,
          status: oldProduct.status,
          stock: oldProduct.stock,
          priceCents: oldProduct.priceCents,
        }
      });
      console.log(`✨ Yeni Ebeveyn Ürün oluşturuldu: ${parentName}`);
    } else {
      // Eğer ebeveyn önceden oluştuysa ve bu ürünün SEO bilgisi varsa ve ebeveynde yoksa, güncelleyelim.
      if (!parentProduct.seoTitle && oldProduct.seoTitle) {
        await prisma.product.update({
          where: { id: parentProduct.id },
          data: {
            seoTitle: oldProduct.seoTitle,
            seoDescription: oldProduct.seoDescription,
            seoKeywords: oldProduct.seoKeywords,
          }
        });
      }
    }

    // Kategorileri Ebeveyn ürüne bağla
    for (const cat of oldProduct.categories) {
      await prisma.productCategory.upsert({
        where: {
          productId_categoryId: {
            productId: parentProduct.id,
            categoryId: cat.categoryId
          }
        },
        create: {
          productId: parentProduct.id,
          categoryId: cat.categoryId
        },
        update: {}
      });
    }

    // Slider ve Hero gibi eski referansları yeni Ebeveyn ürüne aktar
    for (const slider of oldProduct.sliderTargets) {
      await prisma.slider.update({
        where: { id: slider.id },
        data: { targetProductId: parentProduct.id }
      });
    }
    for (const hero of oldProduct.heroTargets) {
      await prisma.heroSection.update({
        where: { id: hero.id },
        data: { targetProductId: parentProduct.id }
      });
    }

    // Varyantı oluştur
    const variantSlug = generateSlug(`${parentName}-${variantName}`);
    
    // Varyant zaten var mı diye kontrol et (Aynı script tekrar çalışırsa çakışmamak için)
    let variant = await prisma.productVariant.findUnique({
      where: { slug: variantSlug }
    });

    if (!variant) {
      variant = await prisma.productVariant.create({
        data: {
          productId: parentProduct.id,
          name: variantName,
          slug: variantSlug,
          description: oldProduct.description,
          stock: oldProduct.stock,
          priceCents: oldProduct.priceCents,
          status: oldProduct.status,
          createdAt: oldProduct.createdAt,
          translations: oldProduct.translations ?? undefined,
        }
      });

      // Eski ürünün resimlerini yeni Varyanta bağla
      for (const img of oldProduct.images) {
        await prisma.productVariantMedia.create({
          data: {
            productVariantId: variant.id,
            mediaId: img.mediaId,
            sortOrder: img.sortOrder,
            isPrimary: img.isPrimary,
          }
        });
      }
      
      console.log(`✅ Varyant oluşturuldu: ${parentName} -> ${variantName}`);
      convertedCount++;

      // Eski ürünü sil. Cascade onDelete ayarlı olduğu için eski ProductCategory ve ProductMedia kayıtları otomatik temizlenir.
      await prisma.product.delete({
        where: { id: oldProduct.id }
      });
      console.log(`🗑️  Eski ürün kaydı silindi: ${oldProduct.name}`);
    } else {
      console.log(`⚠️  Varyant zaten mevcut, atlanıyor: ${variantSlug}`);
    }
  }

  console.log('\n=============================================');
  console.log(`🎉 MİGRASYON TAMAMLANDI!`);
  console.log(`Toplam Dönüştürülen: ${convertedCount}`);
  console.log(`Toplam Atlanan: ${skippedCount}`);
  console.log('=============================================');
}

main()
  .catch((e) => {
    console.error('❌ HATA OLUŞTU:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
