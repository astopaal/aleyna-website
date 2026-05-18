# Production NestJS Backend Architecture

Catalog-style corporate website backend with public read APIs, protected admin APIs, PostgreSQL, Prisma, centralized media uploads, and S3/MinIO-compatible storage.

This architecture intentionally excludes payments, carts, checkout, and order management.

## 1. Folder Architecture

```txt
src/
  main.ts
  app.module.ts

  common/
    constants/
    decorators/
      current-user.decorator.ts
      public.decorator.ts
      roles.decorator.ts
    dto/
      pagination-query.dto.ts
      sort-query.dto.ts
    enums/
      role.enum.ts
      visibility-status.enum.ts
    exceptions/
      app-exception.filter.ts
    guards/
      jwt-auth.guard.ts
      roles.guard.ts
      refresh-token.guard.ts
    interceptors/
      response.interceptor.ts
      cache-control.interceptor.ts
    pipes/
      parse-optional-int.pipe.ts
    types/
      jwt-payload.type.ts
      paginated-response.type.ts
    utils/
      slugify.ts
      pagination.ts

  config/
    config.module.ts
    env.validation.ts
    app.config.ts
    database.config.ts
    jwt.config.ts
    storage.config.ts
    swagger.config.ts

  prisma/
    prisma.module.ts
    prisma.service.ts
    prisma.middleware.ts

  auth/
    auth.module.ts
    auth.controller.ts
    auth.service.ts
    dto/
      login.dto.ts
      refresh-token.dto.ts
    strategies/
      jwt.strategy.ts
      refresh-token.strategy.ts

  users/
    users.module.ts
    users.service.ts
    dto/
      create-admin-user.dto.ts
      update-admin-user.dto.ts

  media/
    media.module.ts
    media.controller.ts
    media.service.ts
    storage/
      storage.interface.ts
      s3-storage.service.ts
      minio-storage.service.ts
    processors/
      image-processor.service.ts
    dto/
      upload-media.dto.ts
      media-response.dto.ts

  products/
    products.module.ts
    admin-products.controller.ts
    public-products.controller.ts
    products.service.ts
    dto/
      create-product.dto.ts
      update-product.dto.ts
      product-filter.dto.ts
      product-response.dto.ts
      update-product-media.dto.ts

  categories/
    categories.module.ts
    admin-categories.controller.ts
    public-categories.controller.ts
    categories.service.ts
    dto/
      create-category.dto.ts
      update-category.dto.ts
      category-filter.dto.ts

  sliders/
    sliders.module.ts
    admin-sliders.controller.ts
    public-sliders.controller.ts
    sliders.service.ts
    dto/
      create-slider.dto.ts
      update-slider.dto.ts

  documents/
    documents.module.ts
    admin-documents.controller.ts
    public-documents.controller.ts
    documents.service.ts
    dto/
      create-document.dto.ts
      update-document.dto.ts

  health/
    health.module.ts
    health.controller.ts
```

Recommended route split:

```txt
/api/public/products
/api/public/categories
/api/public/sliders
/api/public/documents

/api/admin/auth
/api/admin/products
/api/admin/categories
/api/admin/sliders
/api/admin/documents
/api/admin/media
```

## 2. Module Structure

```txt
AppModule
  ConfigModule
  PrismaModule
  AuthModule
  UsersModule
  MediaModule
  ProductsModule
  CategoriesModule
  SlidersModule
  DocumentsModule
  HealthModule
```

Each domain module owns:

- Admin controller for protected write operations.
- Public controller for read-only website operations when needed.
- Service for business logic.
- DTOs for request and response validation.
- Prisma queries kept inside service/repository-style methods.

## 3. Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  SUPER_ADMIN
  ADMIN
  EDITOR
}

enum PublishStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum MediaType {
  IMAGE
  DOCUMENT
  VIDEO
  OTHER
}

model User {
  id                    String   @id @default(uuid()) @db.Uuid
  email                 String   @unique
  passwordHash          String
  role                  UserRole @default(EDITOR)
  isActive              Boolean  @default(true)
  refreshTokenHash      String?
  refreshTokenExpiresAt DateTime?
  lastLoginAt           DateTime?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  deletedAt             DateTime?

  @@index([role])
  @@index([deletedAt])
}

model Product {
  id              String        @id @default(uuid()) @db.Uuid
  name            String
  slug            String        @unique
  description     String?
  stock           Int           @default(0)
  price           Decimal       @db.Decimal(12, 2)
  status          PublishStatus @default(DRAFT)
  seoTitle        String?
  seoDescription  String?
  seoKeywords     String?
  canonicalUrl    String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  deletedAt       DateTime?

  categories      ProductCategory[]
  images          ProductMedia[]

  @@index([slug])
  @@index([status, deletedAt])
  @@index([createdAt])
}

model Category {
  id             String        @id @default(uuid()) @db.Uuid
  name           String
  slug           String        @unique
  description    String?
  status         PublishStatus @default(PUBLISHED)
  sortOrder      Int           @default(0)
  parentId       String?       @db.Uuid
  seoTitle       String?
  seoDescription String?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
  deletedAt      DateTime?

  parent         Category?     @relation("CategoryTree", fields: [parentId], references: [id], onDelete: SetNull)
  children       Category[]    @relation("CategoryTree")
  products       ProductCategory[]

  @@index([slug])
  @@index([status, deletedAt])
  @@index([parentId])
  @@index([sortOrder])
}

model ProductCategory {
  productId  String   @db.Uuid
  categoryId String   @db.Uuid
  createdAt  DateTime @default(now())

  product    Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@id([productId, categoryId])
  @@index([categoryId])
}

model Media {
  id           String    @id @default(uuid()) @db.Uuid
  type         MediaType
  bucket       String
  key          String    @unique
  url          String
  originalName String
  mimeType     String
  extension    String?
  size         Int
  width        Int?
  height       Int?
  altText      String?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  deletedAt    DateTime?

  productImages ProductMedia[]
  sliders       Slider[]
  documents     Document[]

  @@index([type])
  @@index([deletedAt])
}

model ProductMedia {
  id        String   @id @default(uuid()) @db.Uuid
  productId String   @db.Uuid
  mediaId   String   @db.Uuid
  sortOrder Int      @default(0)
  isPrimary Boolean  @default(false)
  createdAt DateTime @default(now())

  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  media     Media    @relation(fields: [mediaId], references: [id], onDelete: Restrict)

  @@unique([productId, mediaId])
  @@index([productId, sortOrder])
  @@index([isPrimary])
}

model Slider {
  id          String        @id @default(uuid()) @db.Uuid
  title       String
  subtitle    String?
  linkUrl     String?
  buttonText  String?
  mediaId     String?       @db.Uuid
  status      PublishStatus @default(DRAFT)
  sortOrder   Int           @default(0)
  startsAt    DateTime?
  endsAt      DateTime?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  deletedAt   DateTime?

  media       Media?        @relation(fields: [mediaId], references: [id], onDelete: SetNull)

  @@index([status, deletedAt])
  @@index([sortOrder])
  @@index([startsAt, endsAt])
}

model Document {
  id             String        @id @default(uuid()) @db.Uuid
  title          String
  slug           String        @unique
  description    String?
  mediaId        String        @db.Uuid
  status         PublishStatus @default(DRAFT)
  sortOrder      Int           @default(0)
  seoTitle       String?
  seoDescription String?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
  deletedAt      DateTime?

  media          Media         @relation(fields: [mediaId], references: [id], onDelete: Restrict)

  @@index([slug])
  @@index([status, deletedAt])
  @@index([sortOrder])
}
```

## 4. Entity Relationships

```txt
Product many-to-many Category via ProductCategory
Product one-to-many ProductMedia
ProductMedia many-to-one Media
Category self-relation parent/children
Slider many-to-one Media
Document many-to-one Media
User stores admin identity, role, password hash, and refresh token hash
```

Soft delete is represented with `deletedAt`. Public queries must always filter by:

```ts
{ deletedAt: null, status: 'PUBLISHED' }
```

Admin queries should default to `deletedAt: null`, with an explicit option to include deleted rows only when needed.

## 5. DTO Examples

### Pagination And Product Filter DTO

```ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ProductFilterDto {
  @ApiPropertyOptional({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ example: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @ApiPropertyOptional({ example: 'pump' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'industrial-equipment' })
  @IsOptional()
  @IsString()
  categorySlug?: string;
}
```

### Create Product DTO

```ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Industrial Pump X120' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'industrial-pump-x120' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 25 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock: number;

  @ApiProperty({ example: 1499.99 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  categoryIds: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  imageIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoDescription?: string;
}
```

### Login DTO

```ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;
}
```

## 6. Controller Examples

### Public Products Controller

```ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { ProductFilterDto } from './dto/product-filter.dto';

@ApiTags('Public Products')
@Controller('api/public/products')
export class PublicProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOkResponse({ description: 'Paginated published products' })
  findPublished(@Query() query: ProductFilterDto) {
    return this.productsService.findPublished(query);
  }

  @Get(':slug')
  @ApiOkResponse({ description: 'Published product detail by slug' })
  findPublishedBySlug(@Param('slug') slug: string) {
    return this.productsService.findPublishedBySlug(slug);
  }
}
```

### Admin Products Controller

```ts
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@ApiTags('Admin Products')
@ApiBearerAuth()
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EDITOR)
@Controller('api/admin/products')
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAllForAdmin(@Query() query: ProductFilterDto) {
    return this.productsService.findAllForAdmin(query);
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  softDelete(@Param('id') id: string) {
    return this.productsService.softDelete(id);
  }
}
```

## 7. Service Example

```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PublishStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/utils/slugify';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublished(query: ProductFilterDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      status: PublishStatus.PUBLISHED,
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
      ...(query.categorySlug && {
        categories: {
          some: {
            category: {
              slug: query.categorySlug,
              deletedAt: null,
              status: PublishStatus.PUBLISHED,
            },
          },
        },
      }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          categories: { include: { category: true } },
          images: {
            orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
            include: { media: true },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findPublishedBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        slug,
        deletedAt: null,
        status: PublishStatus.PUBLISHED,
      },
      include: {
        categories: { include: { category: true } },
        images: {
          orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
          include: { media: true },
        },
      },
    });

    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(dto: CreateProductDto) {
    const slug = dto.slug ?? slugify(dto.name);

    return this.prisma.product.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        stock: dto.stock,
        price: new Prisma.Decimal(dto.price),
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        categories: {
          create: dto.categoryIds.map((categoryId) => ({ categoryId })),
        },
        images: dto.imageIds?.length
          ? {
              create: dto.imageIds.map((mediaId, index) => ({
                mediaId,
                sortOrder: index,
                isPrimary: index === 0,
              })),
            }
          : undefined,
      },
    });
  }

  async softDelete(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
```

## 8. Auth Flow

### Login

```txt
POST /api/admin/auth/login
body: { email, password }

1. Find active, non-deleted user by email.
2. Verify password using argon2 or bcrypt.
3. Generate short-lived access token.
4. Generate long-lived refresh token with unique token id.
5. Hash refresh token and store hash + expiry on User.
6. Return access token, refresh token, user profile.
```

Recommended TTL:

```txt
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d
```

### Refresh

```txt
POST /api/admin/auth/refresh
body: { refreshToken }

1. Verify refresh token signature.
2. Load user from token subject.
3. Compare incoming refresh token with stored refresh token hash.
4. Rotate refresh token on every refresh.
5. Return new access token and new refresh token.
```

### Logout

```txt
POST /api/admin/auth/logout

1. Require valid access token.
2. Clear refreshTokenHash and refreshTokenExpiresAt.
```

## 9. Upload Flow

```txt
POST /api/admin/media/upload
Content-Type: multipart/form-data
field: file
optional fields: altText, folder

1. Admin JWT guard validates user.
2. Multer parses multipart file into memory or temp storage.
3. Validate MIME type and file size.
4. Detect media type.
5. For images:
   - normalize image with Sharp
   - convert supported formats to WebP
   - extract width and height
6. Generate object key:
   products/{uuid}.webp
   sliders/{uuid}.webp
   documents/{uuid}.pdf
7. Upload through StorageService abstraction.
8. Create Media row with metadata.
9. Return Media response DTO.
```

### Upload Controller Example

```ts
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { MediaService } from './media.service';

@ApiTags('Admin Media')
@ApiBearerAuth()
@Controller('api/admin/media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        altText: { type: 'string' },
        folder: { type: 'string', example: 'products' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: Express.Multer.File) {
    return this.mediaService.upload(file, { folder: 'products' });
  }
}
```

### Storage Abstraction

```ts
export interface StoragePutInput {
  key: string;
  body: Buffer;
  contentType: string;
}

export interface StoragePutResult {
  bucket: string;
  key: string;
  url: string;
}

export interface StorageService {
  putObject(input: StoragePutInput): Promise<StoragePutResult>;
  deleteObject(key: string): Promise<void>;
  getPublicUrl(key: string): string;
}
```

Use AWS S3 SDK for both S3 and MinIO by configuring:

```txt
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_BUCKET=corporate-catalog
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_FORCE_PATH_STYLE=true
```

## 10. Caching Strategy

### Public API

Use HTTP caching for public read endpoints:

```txt
Cache-Control: public, max-age=60, stale-while-revalidate=300
ETag: enabled for product/category/slider/document responses
```

Suggested cache durations:

```txt
/api/public/products          60 seconds
/api/public/products/:slug    300 seconds
/api/public/categories        300 seconds
/api/public/sliders           60 seconds
/api/public/documents         300 seconds
```

### Server-Side Cache

Start with HTTP cache headers. Add Redis only when traffic or expensive queries justify it.

Good Redis candidates:

- Product detail by slug.
- Category tree.
- Homepage sliders.
- Public document list.

Invalidate Redis keys after admin create/update/delete/publish operations.

### Database Query Performance

Use indexes on:

- `slug`
- `status + deletedAt`
- `categoryId`
- `sortOrder`
- `createdAt`

For heavier product search, start with PostgreSQL `ILIKE` and indexes. Move to PostgreSQL full-text search when search quality becomes important.

## 11. Swagger Documentation

Configure Swagger in `main.ts`:

```ts
const config = new DocumentBuilder()
  .setTitle('Corporate Catalog API')
  .setDescription('Public website and admin catalog API')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

Tag controllers clearly:

```txt
Public Products
Public Categories
Public Sliders
Public Documents
Admin Auth
Admin Products
Admin Categories
Admin Sliders
Admin Documents
Admin Media
```

## 12. Environment Configuration

```txt
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/catalog

JWT_ACCESS_SECRET=change-me
JWT_REFRESH_SECRET=change-me-too
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d

CORS_ORIGINS=http://localhost:3000,http://localhost:3001

S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_BUCKET=corporate-catalog
S3_ACCESS_KEY=minio
S3_SECRET_KEY=minio123
S3_FORCE_PATH_STYLE=true
S3_PUBLIC_BASE_URL=http://localhost:9000/corporate-catalog

MAX_UPLOAD_SIZE_MB=10
WEBP_QUALITY=82
```

Validate env variables with Joi or Zod at application startup. Fail fast if required production secrets are missing.

## 13. Docker Support

### Dockerfile

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### docker-compose.yml

```yaml
services:
  api:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      - postgres
      - minio

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: catalog
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minio
      MINIO_ROOT_PASSWORD: minio123
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  minio_data:
```

## 14. Production Deployment Recommendations

Use this baseline for production:

- Run Prisma migrations during deployment with a controlled release step, not from every API container startup.
- Put Nginx or a cloud load balancer in front of NestJS.
- Serve object storage through a CDN or public object gateway.
- Keep admin API behind strong CORS rules and HTTPS only.
- Use Helmet, request size limits, rate limiting, and structured logs.
- Store secrets in a secret manager or platform env store.
- Configure database backups and object storage lifecycle policy.
- Add health endpoints for API, database, and storage readiness.
- Use centralized logging and error tracking.
- Run at least two API replicas when traffic matters.
- Use immutable image builds and environment-specific config.

Recommended Nginx shape:

```nginx
server {
  listen 80;
  server_name api.example.com;

  client_max_body_size 20m;

  location / {
    proxy_pass http://api:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

## 15. Implementation Order

1. Create NestJS app, ConfigModule, PrismaModule, health check.
2. Add Prisma schema and first migration.
3. Implement Users and Auth with JWT refresh rotation.
4. Add RBAC guards and admin route protection.
5. Implement MediaModule with S3/MinIO abstraction and WebP processing.
6. Implement Categories.
7. Implement Products with category relations and media gallery.
8. Implement Sliders and Documents.
9. Add public controllers and cache headers.
10. Add Swagger, Dockerfile, Docker Compose, logging, and production hardening.
