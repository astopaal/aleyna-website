import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';

const ADMIN_ROOT_PATH = '/admin';

export async function createAdminPanelModule(): Promise<DynamicModule> {
  const [{ AdminModule }, AdminJSModule, AdminJSPrisma] = await Promise.all([
    import('@adminjs/nestjs'),
    import('adminjs'),
    import('@adminjs/prisma'),
  ]);

  const AdminJS = AdminJSModule.default;
  const { Database, Resource, getModelByName } = AdminJSPrisma;

  AdminJS.registerAdapter({ Database, Resource });

  return AdminModule.createAdminAsync({
    inject: [PrismaService, ConfigService],
    useFactory: (prisma: PrismaService, configService: ConfigService) => ({
      adminJsOptions: {
        rootPath: ADMIN_ROOT_PATH,
        branding: {
          companyName: 'Corporate Catalog Admin',
          withMadeWithLove: false,
        },
        resources: [
          editableResource('Product', prisma, getModelByName),
          editableResource('Category', prisma, getModelByName),
          editableResource('Slider', prisma, getModelByName),
          editableResource('Document', prisma, getModelByName),
          mediaResource(prisma, getModelByName),
          userResource(prisma, getModelByName),
          auditLogResource(prisma, getModelByName),
        ],
      },
      auth: {
        authenticate: async (email: string, password: string) => {
          const user = await prisma.user.findFirst({
            where: {
              email,
              isActive: true,
              deletedAt: null,
              role: { in: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
            },
          });

          if (!user) return null;

          const validPassword = await argon2.verify(
            user.passwordHash,
            password,
          );
          if (!validPassword) return null;

          return {
            id: user.id,
            email: user.email,
            role: user.role,
          };
        },
        cookieName: 'adminjs',
        cookiePassword: configService.getOrThrow<string>(
          'ADMINJS_COOKIE_PASSWORD',
        ),
      },
      sessionOptions: {
        resave: false,
        saveUninitialized: false,
        secret: configService.getOrThrow<string>('ADMINJS_SESSION_SECRET'),
      },
    }),
  });
}

function editableResource(
  modelName: string,
  prisma: PrismaService,
  getModelByName: (modelName: string) => unknown,
) {
  return {
    resource: {
      model: getModelByName(modelName),
      client: prisma,
    },
    options: {
      navigation: { name: 'Catalog' },
    },
  };
}

function mediaResource(
  prisma: PrismaService,
  getModelByName: (modelName: string) => unknown,
) {
  return {
    resource: {
      model: getModelByName('Media'),
      client: prisma,
    },
    options: {
      navigation: { name: 'Media' },
      properties: {
        key: { isDisabled: true },
        bucket: { isDisabled: true },
        url: { isDisabled: true },
      },
    },
  };
}

function userResource(
  prisma: PrismaService,
  getModelByName: (modelName: string) => unknown,
) {
  return {
    resource: {
      model: getModelByName('User'),
      client: prisma,
    },
    options: {
      navigation: { name: 'Security' },
      actions: {
        new: { isAccessible: false },
        edit: { isAccessible: false },
        delete: { isAccessible: false },
        bulkDelete: { isAccessible: false },
      },
      properties: {
        passwordHash: { isVisible: false },
      },
    },
  };
}

function auditLogResource(
  prisma: PrismaService,
  getModelByName: (modelName: string) => unknown,
) {
  return {
    resource: {
      model: getModelByName('AuditLog'),
      client: prisma,
    },
    options: {
      navigation: { name: 'Security' },
      actions: {
        new: { isAccessible: false },
        edit: { isAccessible: false },
        delete: { isAccessible: false },
        bulkDelete: { isAccessible: false },
      },
      sort: {
        sortBy: 'createdAt',
        direction: 'desc',
      },
    },
  };
}
