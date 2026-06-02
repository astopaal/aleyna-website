-- ==========================================
-- EXCEL ÜRÜN İTHALATI SQL BETİĞİ (POSTGRESQL)
-- ==========================================
-- Bu betik, Excel tablonuzdaki 60 ürünü PostgreSQL veritabanınıza aktarır.
-- Yeniden çalıştırılabilir (idempotent) yapıdadır: Aynı ürünü tekrar eklemez,
-- ilişkileri otomatik kurar ve Türkçe karakterlere uygun temiz slug'lar üretir.

-- ------------------------------------------
-- 1. KATEGORİLERİN OLUŞTURULMASI (Yoksa Ekle)
-- ------------------------------------------

-- TUĞLA Kategorisi
INSERT INTO "Category" (id, name, slug, status, "sortOrder", "createdAt", "updatedAt")
SELECT '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c01', 'TUĞLA', 'tugla', 'PUBLISHED', 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Category" WHERE slug = 'tugla' AND "deletedAt" IS NULL);

-- DÜZENSİZ TAŞLAR Kategorisi
INSERT INTO "Category" (id, name, slug, status, "sortOrder", "createdAt", "updatedAt")
SELECT '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c02', 'DÜZENSİZ TAŞLAR', 'duzensiz-taslar', 'PUBLISHED', 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Category" WHERE slug = 'duzensiz-taslar' AND "deletedAt" IS NULL);

-- YASSI TAŞLAR Kategorisi
INSERT INTO "Category" (id, name, slug, status, "sortOrder", "createdAt", "updatedAt")
SELECT '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c03', 'YASSI TAŞLAR', 'yassi-taslar', 'PUBLISHED', 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Category" WHERE slug = 'yassi-taslar' AND "deletedAt" IS NULL);

-- MODÜLER TAŞLAR Kategorisi
INSERT INTO "Category" (id, name, slug, status, "sortOrder", "createdAt", "updatedAt")
SELECT '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c04', 'MODÜLER TAŞLAR', 'moduler-taslar', 'PUBLISHED', 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Category" WHERE slug = 'moduler-taslar' AND "deletedAt" IS NULL);


-- ------------------------------------------
-- 2. ÜRÜN VE RESİM VERİLERİNİN AKTARILMASI
-- ------------------------------------------

-- 1. FAZYON - KARIŞIK (TUĞLA)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c01';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'fazyon-karisik' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2732.webp', '/img/DSCF2732.webp', 'DSCF2732.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'FAZYON - KARIŞIK', 'fazyon-karisik', 'Renk: KARIŞIK', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 2. OPAL - KARIŞIK (DÜZENSİZ TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c02';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'opal-karisik' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2733.webp', '/img/DSCF2733.webp', 'DSCF2733.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'OPAL - KARIŞIK', 'opal-karisik', 'Renk: KARIŞIK, Ölçü: KALINLIK : 10 mm / 35 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 3. OPAL - BEYAZ (DÜZENSİZ TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c02';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'opal-beyaz' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2734.webp', '/img/DSCF2734.webp', 'DSCF2734.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'OPAL - BEYAZ', 'opal-beyaz', 'Renk: BEYAZ, Ölçü: KALINLIK : 10 mm / 35 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 4. OPAL - KAHVE (DÜZENSİZ TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c02';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'opal-kahve' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2735.webp', '/img/DSCF2735.webp', 'DSCF2735.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'OPAL - KAHVE', 'opal-kahve', 'Renk: KAHVE, Ölçü: KALINLIK : 10 mm / 35 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 5. OPAL - KÜL (DÜZENSİZ TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c02';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'opal-kul' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2736.webp', '/img/DSCF2736.webp', 'DSCF2736.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'OPAL - KÜL', 'opal-kul', 'Renk: KÜL, Ölçü: KALINLIK : 10 mm / 35 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 6. OPAL - ANTİK (DÜZENSİZ TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c02';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'opal-antik' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2737.webp', '/img/DSCF2737.webp', 'DSCF2737.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'OPAL - ANTİK', 'opal-antik', 'Renk: ANTİK, Ölçü: KALINLIK : 10 mm / 35 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 7. OPAL - SARI (DÜZENSİZ TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c02';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'opal-sari' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2738.webp', '/img/DSCF2738.webp', 'DSCF2738.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'OPAL - SARI', 'opal-sari', 'Renk: SARI, Ölçü: KALINLIK : 10 mm / 35 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 8. LOPİS - ANTRASİT (YASSI TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c03';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'lopis-antrasit' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2739.webp', '/img/DSCF2739.webp', 'DSCF2739.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'LOPİS - ANTRASİT', 'lopis-antrasit', 'Renk: ANTRASİT, Ölçü: KALINLIK : 20 mm / 47 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 9. LOPİS - BEYAZ (YASSI TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c03';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'lopis-beyaz' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2740.webp', '/img/DSCF2740.webp', 'DSCF2740.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'LOPİS - BEYAZ', 'lopis-beyaz', 'Renk: BEYAZ, Ölçü: KALINLIK : 20 mm / 47 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 10. LOPİS - KÜL (YASSI TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c03';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'lopis-kul' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2741.webp', '/img/DSCF2741.webp', 'DSCF2741.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'LOPİS - KÜL', 'lopis-kul', 'Renk: KÜL, Ölçü: KALINLIK : 20 mm / 47 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 11. LOPİS - KAHVE (YASSI TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c03';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'lopis-kahve' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2742.webp', '/img/DSCF2742.webp', 'DSCF2742.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'LOPİS - KAHVE', 'lopis-kahve', 'Renk: KAHVE, Ölçü: KALINLIK : 20 mm / 47 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 12. KARNEOL - KÜL (YASSI TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c03';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'karneol-kul' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2743.webp', '/img/DSCF2743.webp', 'DSCF2743.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'KARNEOL - KÜL', 'karneol-kul', 'Renk: KÜL, Ölçü: KALINLIK : 10 mm / 25 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 13. KARNEOL - KUM (YASSI TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c03';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'karneol-kum' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2744.webp', '/img/DSCF2744.webp', 'DSCF2744.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'KARNEOL - KUM', 'karneol-kum', 'Renk: KUM, Ölçü: KALINLIK : 10 mm / 25 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 14. KARNEOL - ANTRASİT (YASSI TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c03';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'karneol-antrasit' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2745.webp', '/img/DSCF2745.webp', 'DSCF2745.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'KARNEOL - ANTRASİT', 'karneol-antrasit', 'Renk: ANTRASİT, Ölçü: KALINLIK : 10 mm / 25 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 15. ALAÇATI - DUMAN (DÜZENSİZ TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c02';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'alacati-duman' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2746.webp', '/img/DSCF2746.webp', 'DSCF2746.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'ALAÇATI - DUMAN', 'alacati-duman', 'Renk: DUMAN, Ölçü: KALINLIK : 8 mm / 27 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 16. ALAÇATI - KAHVE (DÜZENSİZ TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c02';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'alacati-kahve' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2747.webp', '/img/DSCF2747.webp', 'DSCF2747.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'ALAÇATI - KAHVE', 'alacati-kahve', 'Renk: KAHVE, Ölçü: KALINLIK : 8 mm / 27 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 17. ALAÇATI - BEYAZ (DÜZENSİZ TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c02';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'alacati-beyaz' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2748.webp', '/img/DSCF2748.webp', 'DSCF2748.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'ALAÇATI - BEYAZ', 'alacati-beyaz', 'Renk: BEYAZ, Ölçü: KALINLIK : 8 mm / 27 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 18. TOPAS - BORDO (TUĞLA)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c01';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'topas-bordo' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2749.webp', '/img/DSCF2749.webp', 'DSCF2749.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'TOPAS - BORDO', 'topas-bordo', 'Renk: BORDO, Ölçü: EN: 60 mm  BOY : 215 mm KALINLIK : 15 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 19. TOPAS - AMBER (TUĞLA)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c01';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'topas-amber' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2750.webp', '/img/DSCF2750.webp', 'DSCF2750.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'TOPAS - AMBER', 'topas-amber', 'Renk: AMBER, Ölçü: EN: 60 mm  BOY : 215 mm KALINLIK : 15 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 20. TOPAS - KIRMIZI (TUĞLA)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c01';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'topas-kirmizi' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2751.webp', '/img/DSCF2751.webp', 'DSCF2751.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'TOPAS - KIRMIZI', 'topas-kirmizi', 'Renk: KIRMIZI, Ölçü: EN: 60 mm  BOY : 215 mm KALINLIK : 15 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 21. ONİX - GRİ - KÜF (TUĞLA)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c01';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'onix-gri-kuf' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2752.webp', '/img/DSCF2752.webp', 'DSCF2752.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'ONİX - GRİ - KÜF', 'onix-gri-kuf', 'Renk: GRİ - KÜF, Ölçü: EN : 57 mm BOY : 185 mm KALINLIK : 12 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 22. ONİX - SARI (TUĞLA)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c01';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'onix-sari' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2753.webp', '/img/DSCF2753.webp', 'DSCF2753.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'ONİX - SARI', 'onix-sari', 'Renk: SARI, Ölçü: EN : 57 mm BOY : 185 mm KALINLIK : 12 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 23. ONİX - KIRMIZI (TUĞLA)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c01';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'onix-kirmizi' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2754.webp', '/img/DSCF2754.webp', 'DSCF2754.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'ONİX - KIRMIZI', 'onix-kirmizi', 'Renk: KIRMIZI, Ölçü: EN : 57 mm BOY : 185 mm KALINLIK : 12 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 24. ONİX - BEYAZ (TUĞLA)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c01';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'onix-beyaz' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2755.webp', '/img/DSCF2755.webp', 'DSCF2755.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'ONİX - BEYAZ', 'onix-beyaz', 'Renk: BEYAZ, Ölçü: EN : 57 mm BOY : 185 mm KALINLIK : 12 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 25. ZİRKON - SİYAH (TUĞLA)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c01';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'zirkon-siyah' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2756.webp', '/img/DSCF2756.webp', 'DSCF2756.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'ZİRKON - SİYAH', 'zirkon-siyah', 'Renk: SİYAH, Ölçü: EN : 60 mm BOY: 200 mm KALINLIK : 15 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 26. ZİRKON - GRİ (TUĞLA)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c01';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'zirkon-gri' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2757.webp', '/img/DSCF2757.webp', 'DSCF2757.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'ZİRKON - GRİ', 'zirkon-gri', 'Renk: GRİ, Ölçü: EN : 60 mm BOY: 200 mm KALINLIK : 15 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 27. ZİRKON - KAHVE (TUĞLA)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c01';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'zirkon-kahve' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2758.webp', '/img/DSCF2758.webp', 'DSCF2758.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'ZİRKON - KAHVE', 'zirkon-kahve', 'Renk: KAHVE, Ölçü: EN : 60 mm BOY: 200 mm KALINLIK : 15 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 28. ZİRKON - MİLK (TUĞLA)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c01';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'zirkon-milk' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2759.webp', '/img/DSCF2759.webp', 'DSCF2759.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'ZİRKON - MİLK', 'zirkon-milk', 'Renk: MİLK, Ölçü: EN : 60 mm BOY: 200 mm KALINLIK : 15 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 29. ZİRKON - ANTASİT (TUĞLA)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c01';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'zirkon-antasit' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2760.webp', '/img/DSCF2760.webp', 'DSCF2760.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'ZİRKON - ANTASİT', 'zirkon-antasit', 'Renk: ANTASİT, Ölçü: EN : 60 mm BOY: 200 mm KALINLIK : 15 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 30. SİTRİN - KAHVE (TUĞLA)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c01';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'sitrin-kahve' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2762.webp', '/img/DSCF2762.webp', 'DSCF2762.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'SİTRİN - KAHVE', 'sitrin-kahve', 'Renk: KAHVE, Ölçü: EN : 38 mm BOY : 335 mm KALINLIK : 20mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 31. SİTRİN - ANTASİT (TUĞLA)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c01';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'sitrin-antasit' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2763.webp', '/img/DSCF2763.webp', 'DSCF2763.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'SİTRİN - ANTASİT', 'sitrin-antasit', 'Renk: ANTASİT, Ölçü: EN : 38 mm BOY : 335 mm KALINLIK : 20mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 32. SELENİT - BEYAZ (TUĞLA)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c01';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'selenit-beyaz' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2764.webp', '/img/DSCF2764.webp', 'DSCF2764.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'SELENİT - BEYAZ', 'selenit-beyaz', 'Renk: BEYAZ, Ölçü: EN : 43 mm BOY: 285 mm KALINLIK : 28 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 33. SELENİT - AMBER (TUĞLA)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c01';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'selenit-amber' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2765.webp', '/img/DSCF2765.webp', 'DSCF2765.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'SELENİT - AMBER', 'selenit-amber', 'Renk: AMBER, Ölçü: EN : 43 mm BOY: 285 mm KALINLIK : 28 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 34. SELENİT - KIRMIZI (TUĞLA)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c01';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'selenit-kirmizi' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2768.webp', '/img/DSCF2768.webp', 'DSCF2768.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'SELENİT - KIRMIZI', 'selenit-kirmizi', 'Renk: KIRMIZI, Ölçü: EN : 43 mm BOY: 285 mm KALINLIK : 28 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 35. PROTİN - BEYAZ (MODÜLER TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c04';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'protin-beyaz' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2769.webp', '/img/DSCF2769.webp', 'DSCF2769.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'PROTİN - BEYAZ', 'protin-beyaz', 'Renk: BEYAZ, Ölçü: EN : 108 mm BOY : 395 mm KALINLIK : 22 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 36. PROTİN - KAHVE (MODÜLER TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c04';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'protin-kahve' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2770.webp', '/img/DSCF2770.webp', 'DSCF2770.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'PROTİN - KAHVE', 'protin-kahve', 'Renk: KAHVE, Ölçü: EN : 108 mm BOY : 395 mm KALINLIK : 22 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 37. PROTİN - YEŞİL (MODÜLER TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c04';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'protin-yesil' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2771.webp', '/img/DSCF2771.webp', 'DSCF2771.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'PROTİN - YEŞİL', 'protin-yesil', 'Renk: YEŞİL, Ölçü: EN : 108 mm BOY : 395 mm KALINLIK : 22 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 38. PROTİN - KÜL (MODÜLER TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c04';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'protin-kul' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2772.webp', '/img/DSCF2772.webp', 'DSCF2772.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'PROTİN - KÜL', 'protin-kul', 'Renk: KÜL, Ölçü: EN : 108 mm BOY : 395 mm KALINLIK : 22 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 39. PROTİN - ANTRASİT (MODÜLER TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c04';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'protin-antrasit' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2773.webp', '/img/DSCF2773.webp', 'DSCF2773.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'PROTİN - ANTRASİT', 'protin-antrasit', 'Renk: ANTRASİT, Ölçü: EN : 108 mm BOY : 395 mm KALINLIK : 22 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 40. KRİZOKOL - BEYAZ (MODÜLER TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c04';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'krizokol-beyaz' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2774.webp', '/img/DSCF2774.webp', 'DSCF2774.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'KRİZOKOL - BEYAZ', 'krizokol-beyaz', 'Renk: BEYAZ, Ölçü: EN : 11 mm BOY : 520 mm   KALINLIK : 30 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 41. KRİZOKOL - KÜL (MODÜLER TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c04';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'krizokol-kul' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2775.webp', '/img/DSCF2775.webp', 'DSCF2775.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'KRİZOKOL - KÜL', 'krizokol-kul', 'Renk: KÜL, Ölçü: EN : 11 mm BOY : 520 mm  KALINLIK : 30 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 42. KRİZOKOL - ANTİK SARI (MODÜLER TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c04';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'krizokol-antik-sari' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2776.webp', '/img/DSCF2776.webp', 'DSCF2776.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'KRİZOKOL - ANTİK SARI', 'krizokol-antik-sari', 'Renk: ANTİK SARI, Ölçü: EN : 11 mm BOY : 520 mm  KALINLIK : 30 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 43. KRİZOKOL - ANTRASİT (MODÜLER TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c04';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'krizokol-antrasit' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2777.webp', '/img/DSCF2777.webp', 'DSCF2777.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'KRİZOKOL - ANTRASİT', 'krizokol-antrasit', 'Renk: ANTRASİT, Ölçü: EN : 11 mm BOY : 520 mm  KALINLIK : 30 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 44. KRİZOKOL - KAHVE (MODÜLER TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c04';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'krizokol-kahve' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2778.webp', '/img/DSCF2778.webp', 'DSCF2778.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'KRİZOKOL - KAHVE', 'krizokol-kahve', 'Renk: KAHVE, Ölçü: EN : 11 mm BOY : 520 mm KALINLIK : 30 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 45. LOLİT - KÜL (MODÜLER TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c04';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'lolit-kul' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2779.webp', '/img/DSCF2779.webp', 'DSCF2779.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'LOLİT - KÜL', 'lolit-kul', 'Renk: KÜL, Ölçü: EN : 80 mm BOY : 435 mm KALINLIK : 30 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 46. LOLİT - ANTRASİT (MODÜLER TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c04';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'lolit-antrasit' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2780.webp', '/img/DSCF2780.webp', 'DSCF2780.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'LOLİT - ANTRASİT', 'lolit-antrasit', 'Renk: ANTRASİT, Ölçü: EN : 80 mm BOY : 435 mm KALINLIK : 30 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 47. LOLİT - KAHVE (MODÜLER TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c04';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'lolit-kahve' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2781.webp', '/img/DSCF2781.webp', 'DSCF2781.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'LOLİT - KAHVE', 'lolit-kahve', 'Renk: KAHVE, Ölçü: EN : 80 mm BOY : 435 mm KALINLIK : 30 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 48. LOLİT - YEŞİL (MODÜLER TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c04';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'lolit-yesil' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2782.webp', '/img/DSCF2782.webp', 'DSCF2782.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'LOLİT - YEŞİL', 'lolit-yesil', 'Renk: YEŞİL, Ölçü: EN : 80 mm BOY : 435 mm KALINLIK : 30 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 49. LOLİT - SARI (MODÜLER TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c04';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'lolit-sari' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2783.webp', '/img/DSCF2783.webp', 'DSCF2783.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'LOLİT - SARI', 'lolit-sari', 'Renk: SARI, Ölçü: EN : 80 mm BOY : 435 mm KALINLIK : 30 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 50. CALSEDON - ANTRASİT (MODÜLER TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c04';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'calsedon-antrasit' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2784.webp', '/img/DSCF2784.webp', 'DSCF2784.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'CALSEDON - ANTRASİT', 'calsedon-antrasit', 'Renk: ANTRASİT, Ölçü: KALINLIK : 17 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 51. CALSEDON - KAHVE (MODÜLER TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c04';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'calsedon-kahve' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2785.webp', '/img/DSCF2785.webp', 'DSCF2785.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'CALSEDON - KAHVE', 'calsedon-kahve', 'Renk: KAHVE, Ölçü: KALINLIK : 17 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 52. CALSEDON - GRİ (MODÜLER TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c04';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'calsedon-gri' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2786.webp', '/img/DSCF2786.webp', 'DSCF2786.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'CALSEDON - GRİ', 'calsedon-gri', 'Renk: GRİ, Ölçü: KALINLIK : 17 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 53. CALSEDON - SARI (MODÜLER TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c04';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'calsedon-sari' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2787.webp', '/img/DSCF2787.webp', 'DSCF2787.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'CALSEDON - SARI', 'calsedon-sari', 'Renk: SARI, Ölçü: KALINLIK : 17 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 54. CALSEDON - ORMAN (MODÜLER TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c04';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'calsedon-orman' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2788.webp', '/img/DSCF2788.webp', 'DSCF2788.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'CALSEDON - ORMAN', 'calsedon-orman', 'Renk: ORMAN, Ölçü: KALINLIK : 17 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 55. LAVİMAR - KÜL (MODÜLER TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c04';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'lavimar-kul' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2789.webp', '/img/DSCF2789.webp', 'DSCF2789.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'LAVİMAR - KÜL', 'lavimar-kul', 'Renk: KÜL, Ölçü: KALINLIK : 20 mm / 45 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 56. LAVİMAR - ANTRASİT (MODÜLER TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c04';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'lavimar-antrasit' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2790.webp', '/img/DSCF2790.webp', 'DSCF2790.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'LAVİMAR - ANTRASİT', 'lavimar-antrasit', 'Renk: ANTRASİT, Ölçü: KALINLIK : 20 mm / 45 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 57. LAVİMAR - SARI (MODÜLER TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c04';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'lavimar-sari' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2791.webp', '/img/DSCF2791.webp', 'DSCF2791.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'LAVİMAR - SARI', 'lavimar-sari', 'Renk: SARI, Ölçü: KALINLIK : 20 mm / 45 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 58. LAVİMAR - KAHVE (MODÜLER TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c04';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'lavimar-kahve' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2792.webp', '/img/DSCF2792.webp', 'DSCF2792.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'LAVİMAR - KAHVE', 'lavimar-kahve', 'Renk: KAHVE, Ölçü: KALINLIK : 20 mm / 45 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 59. LAVİMAR - YEŞİL (MODÜLER TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c04';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'lavimar-yesil' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2793.webp', '/img/DSCF2793.webp', 'DSCF2793.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'LAVİMAR - YEŞİL', 'lavimar-yesil', 'Renk: YEŞİL, Ölçü: KALINLIK : 20 mm / 45 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

-- 60. LAVİMAR - BEYAZ (MODÜLER TAŞLAR)
DO $$
DECLARE
  prod_id UUID := gen_random_uuid();
  media_id UUID := gen_random_uuid();
  cat_id UUID := '3a436ff1-bb38-4e89-9e32-9c3f0b2f0c04';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE slug = 'lavimar-beyaz' AND "deletedAt" IS NULL) THEN
    INSERT INTO "Media" (id, type, bucket, key, url, "originalName", "mimeType", extension, size, "createdAt", "updatedAt")
    VALUES (media_id, 'IMAGE', 'corporate-catalog', 'images/DSCF2794.webp', '/img/DSCF2794.webp', 'DSCF2794.webp', 'image/webp', 'webp', 0, NOW(), NOW());
    
    INSERT INTO "Product" (id, name, slug, description, stock, "priceCents", status, "createdAt", "updatedAt")
    VALUES (prod_id, 'LAVİMAR - BEYAZ', 'lavimar-beyaz', 'Renk: BEYAZ, Ölçü: KALINLIK : 20 mm / 45 mm', 100, 0, 'PUBLISHED', NOW(), NOW());
    
    INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt") VALUES (prod_id, cat_id, NOW());
    INSERT INTO "ProductMedia" (id, "productId", "mediaId", "sortOrder", "isPrimary", "createdAt") VALUES (gen_random_uuid(), prod_id, media_id, 0, TRUE, NOW());
  END IF;
END $$;

SELECT 'Ürün ithalatı tamamlandı!' AS sonuc;
