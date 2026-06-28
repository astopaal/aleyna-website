import { PrismaClient, PublishStatus, MediaType } from '@prisma/client';
import {
  S3Client,
  PutObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
} from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// 1. .env Dosyasını Okuma ve Ayarları Yükleme
const envPath = path.join(process.cwd(), '.env');
const env: { [key: string]: string } = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [key, ...valueParts] = trimmed.split('=');
    if (key) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

// S3 Ayarları
const s3Endpoint = process.env['S3_ENDPOINT'] || env['S3_ENDPOINT'] || 'http://localhost:9000';
const s3Region = process.env['S3_REGION'] || env['S3_REGION'] || 'us-east-1';
const s3Bucket = process.env['S3_BUCKET'] || env['S3_BUCKET'] || 'corporate-catalog';
const s3AccessKey = process.env['S3_ACCESS_KEY'] || env['S3_ACCESS_KEY'] || 'minio';
const s3SecretKey = process.env['S3_SECRET_KEY'] || env['S3_SECRET_KEY'] || 'minio123';
const s3ForcePathStyle = (process.env['S3_FORCE_PATH_STYLE'] || env['S3_FORCE_PATH_STYLE']) !== 'false';
const s3PublicBaseUrl = (process.env['S3_PUBLIC_BASE_URL'] || env['S3_PUBLIC_BASE_URL'] || 'http://localhost:9000/corporate-catalog').replace(/\/$/, '');

// S3 İstemcisi Kurulumu
const s3Client = new S3Client({
  endpoint: s3Endpoint,
  region: s3Region,
  forcePathStyle: s3ForcePathStyle,
  credentials: {
    accessKeyId: s3AccessKey,
    secretAccessKey: s3SecretKey,
  },
});

// Türkçe karakterleri İngilizce karşılıklarına dönüştüren ve temiz slug üreten fonksiyon
function generateSlug(text: string): string {
  const mapping: { [key: string]: string } = {
    'ç': 'c', 'Ç': 'c',
    'ğ': 'g', 'Ğ': 'g',
    'ı': 'i', 'I': 'i',
    'i': 'i', 'İ': 'i',
    'ö': 'o', 'Ö': 'o',
    'ş': 's', 'Ş': 's',
    'ü': 'u', 'Ü': 'u',
  };

  let str = text;
  for (const char in mapping) {
    str = str.replace(new RegExp(char, 'g'), mapping[char]);
  }

  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const productsData = [
  { category: "TUĞLA", name: "FAZYON", color: "KARIŞIK", size: "", image: "DSCF2732" },
  { category: "DÜZENSİZ TAŞLAR", name: "OPAL", color: "KARIŞIK", size: "KALINLIK : 10 mm / 35 mm", image: "DSCF2733" },
  { category: "DÜZENSİZ TAŞLAR", name: "OPAL", color: "BEYAZ", size: "KALINLIK : 10 mm / 35 mm", image: "DSCF2734" },
  { category: "DÜZENSİZ TAŞLAR", name: "OPAL", color: "KAHVE", size: "KALINLIK : 10 mm / 35 mm", image: "DSCF2735" },
  { category: "DÜZENSİZ TAŞLAR", name: "OPAL", color: "KÜL", size: "KALINLIK : 10 mm / 35 mm", image: "DSCF2736" },
  { category: "DÜZENSİZ TAŞLAR", name: "OPAL", color: "ANTİK", size: "KALINLIK : 10 mm / 35 mm", image: "DSCF2737" },
  { category: "DÜZENSİZ TAŞLAR", name: "OPAL", color: "SARI", size: "KALINLIK : 10 mm / 35 mm", image: "DSCF2738" },
  { category: "YASSI TAŞLAR", name: "LOPİS", color: "ANTRASİT", size: "KALINLIK : 20 mm / 47 mm", image: "DSCF2739" },
  { category: "YASSI TAŞLAR", name: "LOPİS", color: "BEYAZ", size: "KALINLIK : 20 mm / 47 mm", image: "DSCF2740" },
  { category: "YASSI TAŞLAR", name: "LOPİS", color: "KÜL", size: "KALINLIK : 20 mm / 47 mm", image: "DSCF2741" },
  { category: "YASSI TAŞLAR", name: "LOPİS", color: "KAHVE", size: "KALINLIK : 20 mm / 47 mm", image: "DSCF2742" },
  { category: "YASSI TAŞLAR", name: "KARNEOL", color: "KÜL", size: "KALINLIK : 10 mm / 25 mm", image: "DSCF2743" },
  { category: "YASSI TAŞLAR", name: "KARNEOL", color: "KUM", size: "KALINLIK : 10 mm / 25 mm", image: "DSCF2744" },
  { category: "YASSI TAŞLAR", name: "KARNEOL", color: "ANTRASİT", size: "KALINLIK : 10 mm / 25 mm", image: "DSCF2745" },
  { category: "DÜZENSİZ TAŞLAR", name: "ALAÇATI", color: "DUMAN", size: "KALINLIK : 8 mm / 27 mm", image: "DSCF2746" },
  { category: "DÜZENSİZ TAŞLAR", name: "ALAÇATI", color: "KAHVE", size: "KALINLIK : 8 mm / 27 mm", image: "DSCF2747" },
  { category: "DÜZENSİZ TAŞLAR", name: "ALAÇATI", color: "BEYAZ", size: "KALINLIK : 8 mm / 27 mm", image: "DSCF2748" },
  { category: "TUĞLA", name: "TOPAS", color: "BORDO", size: "EN: 60 mm  BOY : 215 mm KALINLIK : 15 mm", image: "DSCF2749" },
  { category: "TUĞLA", name: "TOPAS", color: "AMBER", size: "EN: 60 mm  BOY : 215 mm KALINLIK : 15 mm", image: "DSCF2750" },
  { category: "TUĞLA", name: "TOPAS", color: "KIRMIZI", size: "EN: 60 mm  BOY : 215 mm KALINLIK : 15 mm", image: "DSCF2751" },
  { category: "TUĞLA", name: "ONİX", color: "GRİ - KÜF", size: "EN : 57 mm BOY : 185 mm KALINLIK : 12 mm", image: "DSCF2752" },
  { category: "TUĞLA", name: "ONİX", color: "SARI", size: "EN : 57 mm BOY : 185 mm KALINLIK : 12 mm", image: "DSCF2753" },
  { category: "TUĞLA", name: "ONİX", color: "KIRMIZI", size: "EN : 57 mm BOY : 185 mm KALINLIK : 12 mm", image: "DSCF2754" },
  { category: "TUĞLA", name: "ONİX", color: "BEYAZ", size: "EN : 57 mm BOY : 185 mm KALINLIK : 12 mm", image: "DSCF2755" },
  { category: "TUĞLA", name: "ZİRKON", color: "SİYAH", size: "EN : 60 mm BOY: 200 mm KALINLIK : 15 mm", image: "DSCF2756" },
  { category: "TUĞLA", name: "ZİRKON", color: "GRİ", size: "EN : 60 mm BOY: 200 mm KALINLIK : 15 mm", image: "DSCF2757" },
  { category: "TUĞLA", name: "ZİRKON", color: "KAHVE", size: "EN : 60 mm BOY: 200 mm KALINLIK : 15 mm", image: "DSCF2758" },
  { category: "TUĞLA", name: "ZİRKON", color: "MİLK", size: "EN : 60 mm BOY: 200 mm KALINLIK : 15 mm", image: "DSCF2759" },
  { category: "TUĞLA", name: "ZİRKON", color: "ANTASİT", size: "EN : 60 mm BOY: 200 mm KALINLIK : 15 mm", image: "DSCF2760" },
  { category: "TUĞLA", name: "SİTRİN", color: "KAHVE", size: "EN : 38 mm BOY : 335 mm KALINLIK : 20mm", image: "DSCF2762" },
  { category: "TUĞLA", name: "SİTRİN", color: "ANTASİT", size: "EN : 38 mm BOY : 335 mm KALINLIK : 20mm", image: "DSCF2763" },
  { category: "TUĞLA", name: "SELENİT", color: "BEYAZ", size: "EN : 43 mm BOY: 285 mm KALINLIK : 28 mm", image: "DSCF2764" },
  { category: "TUĞLA", name: "SELENİT", color: "AMBER", size: "EN : 43 mm BOY: 285 mm KALINLIK : 28 mm", image: "DSCF2765" },
  { category: "TUĞLA", name: "SELENİT", color: "KIRMIZI", size: "EN : 43 mm BOY: 285 mm KALINLIK : 28 mm", image: "DSCF2768" },
  { category: "MODÜLER TAŞLAR", name: "PROTİN", color: "BEYAZ", size: "EN : 108 mm BOY : 395 mm KALINLIK : 22 mm", image: "DSCF2769" },
  { category: "MODÜLER TAŞLAR", name: "PROTİN", color: "KAHVE", size: "EN : 108 mm BOY : 395 mm KALINLIK : 22 mm", image: "DSCF2770" },
  { category: "MODÜLER TAŞLAR", name: "PROTİN", color: "YEŞİL", size: "EN : 108 mm BOY : 395 mm KALINLIK : 22 mm", image: "DSCF2771" },
  { category: "MODÜLER TAŞLAR", name: "PROTİN", color: "KÜL", size: "EN : 108 mm BOY : 395 mm KALINLIK : 22 mm", image: "DSCF2772" },
  { category: "MODÜLER TAŞLAR", name: "PROTİN", color: "ANTRASİT", size: "EN : 108 mm BOY : 395 mm KALINLIK : 22 mm", image: "DSCF2773" },
  { category: "MODÜLER TAŞLAR", name: "KRİZOKOL", color: "BEYAZ", size: "EN : 11 mm BOY : 520 mm   KALINLIK : 30 mm", image: "DSCF2774" },
  { category: "MODÜLER TAŞLAR", name: "KRİZOKOL", color: "KÜL", size: "EN : 11 mm BOY : 520 mm  KALINLIK : 30 mm", image: "DSCF2775" },
  { category: "MODÜLER TAŞLAR", name: "KRİZOKOL", color: "ANTİK SARI", size: "EN : 11 mm BOY : 520 mm  KALINLIK : 30 mm", image: "DSCF2776" },
  { category: "MODÜLER TAŞLAR", name: "KRİZOKOL", color: "ANTRASİT", size: "EN : 11 mm BOY : 520 mm  KALINLIK : 30 mm", image: "DSCF2777" },
  { category: "MODÜLER TAŞLAR", name: "KRİZOKOL", color: "KAHVE", size: "EN : 11 mm BOY : 520 mm KALINLIK : 30 mm", image: "DSCF2778" },
  { category: "MODÜLER TAŞLAR", name: "LOLİT", color: "KÜL", size: "EN : 80 mm BOY : 435 mm KALINLIK : 30 mm", image: "DSCF2779" },
  { category: "MODÜLER TAŞLAR", name: "LOLİT", color: "ANTRASİT", size: "EN : 80 mm BOY : 435 mm KALINLIK : 30 mm", image: "DSCF2780" },
  { category: "MODÜLER TAŞLAR", name: "LOLİT", color: "KAHVE", size: "EN : 80 mm BOY : 435 mm KALINLIK : 30 mm", image: "DSCF2781" },
  { category: "MODÜLER TAŞLAR", name: "LOLİT", color: "YEŞİL", size: "EN : 80 mm BOY : 435 mm KALINLIK : 30 mm", image: "DSCF2782" },
  { category: "MODÜLER TAŞLAR", name: "LOLİT", color: "SARI", size: "EN : 80 mm BOY : 435 mm KALINLIK : 30 mm", image: "DSCF2783" },
  { category: "MODÜLER TAŞLAR", name: "CALSEDON", color: "ANTRASİT", size: "KALINLIK : 17 mm", image: "DSCF2784" },
  { category: "MODÜLER TAŞLAR", name: "CALSEDON", color: "KAHVE", size: "KALINLIK : 17 mm", image: "DSCF2785" },
  { category: "MODÜLER TAŞLAR", name: "CALSEDON", color: "GRİ", size: "KALINLIK : 17 mm", image: "DSCF2786" },
  { category: "MODÜLER TAŞLAR", name: "CALSEDON", color: "SARI", size: "KALINLIK : 17 mm", image: "DSCF2787" },
  { category: "MODÜLER TAŞLAR", name: "CALSEDON", color: "ORMAN", size: "KALINLIK : 17 mm", image: "DSCF2788" },
  { category: "MODÜLER TAŞLAR", name: "LAVİMAR", color: "KÜL", size: "KALINLIK : 20 mm / 45 mm", image: "DSCF2789" },
  { category: "MODÜLER TAŞLAR", name: "LAVİMAR", color: "ANTRASİT", size: "KALINLIK : 20 mm / 45 mm", image: "DSCF2790" },
  { category: "MODÜLER TAŞLAR", name: "LAVİMAR", color: "SARI", size: "KALINLIK : 20 mm / 45 mm", image: "DSCF2791" },
  { category: "MODÜLER TAŞLAR", name: "LAVİMAR", color: "KAHVE", size: "KALINLIK : 20 mm / 45 mm", image: "DSCF2792" },
  { category: "MODÜLER TAŞLAR", name: "LAVİMAR", color: "YEŞİL", size: "KALINLIK : 20 mm / 45 mm", image: "DSCF2793" },
  { category: "MODÜLER TAŞLAR", name: "LAVİMAR", color: "BEYAZ", size: "KALINLIK : 20 mm / 45 mm", image: "DSCF2794" }
];

type CategorySeed = {
  name: string;
  slug: string;
  sortOrder: number;
  parentSlug?: string;
  legacySlugs?: string[];
};

const categorySeeds: CategorySeed[] = [
  { name: "DOĞAL TAŞLAR", slug: "dogal-taslar", sortOrder: 0 },
  { name: "MERMERLER", slug: "mermerler", sortOrder: 0, parentSlug: "dogal-taslar" },
  { name: "KÜLTÜR TAŞLARI", slug: "kultur-taslari", sortOrder: 1 },
  { name: "KÜLTÜR TAŞLARI", slug: "kultur-taslari-alt", sortOrder: 0, parentSlug: "kultur-taslari" },
  { name: "KÜLTÜR TUĞLA", slug: "kultur-tugla", sortOrder: 1, parentSlug: "kultur-taslari", legacySlugs: ["tugla"] },
  { name: "DÜZENSİZ TAŞLAR", slug: "duzensiz-taslar", sortOrder: 0, parentSlug: "kultur-taslari-alt" },
  { name: "YASSI TAŞLAR", slug: "yassi-taslar", sortOrder: 1, parentSlug: "kultur-taslari-alt" },
  { name: "MODÜLER TAŞLAR", slug: "moduler-taslar", sortOrder: 2, parentSlug: "kultur-taslari-alt" },
];

const productCategorySlugMap: Record<string, string> = {
  "TUĞLA": "kultur-tugla",
  "DÜZENSİZ TAŞLAR": "duzensiz-taslar",
  "YASSI TAŞLAR": "yassi-taslar",
  "MODÜLER TAŞLAR": "moduler-taslar",
};

async function seedCategories() {
  const categoryMap = new Map<string, string>();

  for (const seed of categorySeeds) {
    const parentId = seed.parentSlug ? categoryMap.get(seed.parentSlug) : null;
    const lookupSlugs = [seed.slug, ...(seed.legacySlugs ?? [])];
    const existingCategory = await prisma.category.findFirst({
      where: { deletedAt: null, slug: { in: lookupSlugs } },
    });

    const data = {
      name: seed.name,
      slug: seed.slug,
      status: PublishStatus.PUBLISHED,
      sortOrder: seed.sortOrder,
      parentId,
    };

    const category = existingCategory
      ? await prisma.category.update({ where: { id: existingCategory.id }, data })
      : await prisma.category.create({ data });

    categoryMap.set(seed.slug, category.id);
    console.log(`Kategori hazır: ${seed.name} (${seed.slug})`);
  }

  return categoryMap;
}

async function main() {
  console.log('--- EXCEL ÜRÜN İTHALATI VE MINIO AKTARIMI BAŞLADI ---');

  // 1. MinIO Bucket Kontrolü / Oluşturma
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: s3Bucket }));
    console.log(`MinIO Bucket mevcut: ${s3Bucket}`);
  } catch (err) {
    console.log(`MinIO Bucket bulunamadı, oluşturuluyor: ${s3Bucket}...`);
    try {
      await s3Client.send(new CreateBucketCommand({ Bucket: s3Bucket }));
      console.log(`MinIO Bucket başarıyla oluşturuldu: ${s3Bucket}`);
    } catch (createErr) {
      console.error('Hata: MinIO Bucket oluşturulamadı!', createErr);
      process.exit(1);
    }

    try {
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: '*',
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${s3Bucket}/*`],
          },
        ],
      };

      await s3Client.send(
        new PutBucketPolicyCommand({
          Bucket: s3Bucket,
          Policy: JSON.stringify(policy),
        }),
      );
      console.log(`Bucket erişim izni 'Public' (Herkese Açık) olarak ayarlandı.`);
    } catch (policyErr) {
      console.warn('Uyarı: Bucket public policy ayarlanamadı, import devam ediyor.', policyErr);
    }
  }

  // 2. Kategori ağacını oluştur / güncelle
  const categoryMap = await seedCategories(); // categorySlug -> categoryId

  // 3. Ürünleri, Resimleri Diskten Oku, MinIO'ya Yükle ve DB'ye Kaydet
  let importedCount = 0;
  let skippedCount = 0;

  for (const item of productsData) {
    const parentName = item.name;
    const parentSlug = generateSlug(parentName);
    const variantName = item.color;
    const variantSlug = generateSlug(`${parentName} ${variantName}`);
    const categorySlug = productCategorySlugMap[item.category];
    const categoryId = categorySlug ? categoryMap.get(categorySlug) : undefined;

    if (!categoryId) {
      console.error(`Hata: ${item.category} kategorisi bulunamadı!`);
      continue;
    }

    // Ürün (Parent) zaten var mı kontrol et
    let parentProduct = await prisma.product.findFirst({
      where: { slug: parentSlug, deletedAt: null }
    });

    if (!parentProduct) {
      parentProduct = await prisma.product.create({
        data: {
          name: parentName,
          slug: parentSlug,
          description: '',
          status: PublishStatus.PUBLISHED,
          categories: {
            create: {
              categoryId: categoryId
            }
          }
        }
      });
    } else {
      await prisma.productCategory.upsert({
        where: {
          productId_categoryId: {
            productId: parentProduct.id,
            categoryId,
          },
        },
        update: {},
        create: {
          productId: parentProduct.id,
          categoryId,
        },
      });
    }

    // Variant zaten var mı kontrol et
    const existingVariant = await prisma.productVariant.findFirst({
      where: { slug: variantSlug, deletedAt: null }
    });

    if (existingVariant) {
      console.log(`Varyant zaten kayıtlı (Atlanıyor): ${parentName} - ${variantName} (${variantSlug})`);
      skippedCount++;
      continue;
    }

    const description = `Renk: ${item.color}${item.size ? `, Ölçü: ${item.size}` : ''}`;
    const imageName = item.image; // e.g. DSCF2732
    const originalFilename = `${imageName}.webp`;
    const mediaKey = `images/${originalFilename}`;
    const mediaUrl = `${s3PublicBaseUrl}/${mediaKey}`; // Dinamik MinIO url'i

    // Fotoğrafın diskteki fiziksel konumunu belirle (be/api/img/ klasörü)
    const localFilePath = path.join(process.cwd(), 'img', originalFilename);
    let fileSize = 0;
    let fileBuffer: Buffer | null = null;

    if (fs.existsSync(localFilePath)) {
      const stats = fs.statSync(localFilePath);
      fileSize = stats.size;
      fileBuffer = fs.readFileSync(localFilePath);
    } else {
      console.warn(`Uyarı: ${originalFilename} dosyası diskte bulunamadı (${localFilePath})!`);
    }

    // Medya kaydını kontrol et veya oluştur
    let media = await prisma.media.findUnique({
      where: { key: mediaKey }
    });

    // Eğer diskte dosya varsa ve MinIO'da henüz kayıtlı değilse MinIO'ya yükle
    if (fileBuffer && (!media || media.size === 0)) {
      try {
        console.log(`MinIO'ya yükleniyor: ${originalFilename} (${(fileSize / 1024).toFixed(1)} KB)...`);
        await s3Client.send(new PutObjectCommand({
          Bucket: s3Bucket,
          Key: mediaKey,
          Body: fileBuffer,
          ContentType: 'image/webp'
        }));
      } catch (s3Err) {
        console.error(`Hata: ${originalFilename} MinIO'ya yüklenirken hata oluştu!`, s3Err);
      }
    }

    if (!media) {
      media = await prisma.media.create({
        data: {
          type: MediaType.IMAGE,
          bucket: s3Bucket,
          key: mediaKey,
          url: mediaUrl,
          originalName: originalFilename,
          mimeType: 'image/webp',
          extension: 'webp',
          size: fileSize,
          altText: combinedName
        }
      });
    }

    // Varyantı oluştur ve Medya ile ilişkilendir
    await prisma.productVariant.create({
      data: {
        productId: parentProduct.id,
        name: variantName,
        slug: variantSlug,
        description: description,
        stock: 100, // Varsayılan stok değeri
        priceCents: 0, // Katalog yapısı olduğu için fiyat 0
        status: PublishStatus.PUBLISHED,
        images: {
          create: {
            mediaId: media.id,
            sortOrder: 0,
            isPrimary: true
          }
        }
      }
    });

    console.log(`Varyant başarıyla aktarıldı: ${parentName} - ${variantName} -> MinIO: ${mediaUrl}`);
    importedCount++;
  }

  console.log('\n--- İTHALAT ÖZETİ ---');
  console.log(`Toplam Aktarılan Yeni Ürün & Resim: ${importedCount}`);
  console.log(`Zaten Var Olan/Atlanan Ürün: ${skippedCount}`);
  console.log('--- İŞLEM TAMAMLANDI ---');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
