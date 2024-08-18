import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Criar algumas empresas
  const companies = await prisma.company.createMany({
    data: [
      { cnpj: '12345678000100', socialReason: 'Empresa 1 Ltda', fantasyName: 'Empresa 1', tag: 'empresa2' },
      { cnpj: '12345678000200', socialReason: 'Empresa 2 Ltda', fantasyName: 'Empresa 2', tag: 'empresa3'  },
      { cnpj: '12345678000300', socialReason: 'Empresa 3 Ltda', fantasyName: 'Empresa 3', tag: 'Tech' },
    ],
  });

  // Recuperar as empresas criadas
  const company1 = await prisma.company.findUnique({ where: { cnpj: '12345678000100' } });
  const company2 = await prisma.company.findUnique({ where: { cnpj: '12345678000200' } });
  const company3 = await prisma.company.findUnique({ where: { cnpj: '12345678000300' } });

  if (!company1 || !company2 || !company3) {
    throw new Error('Failed to retrieve one or more companies');
  }

  // Criar alguns grupos para cada empresa
  const groups = await prisma.group.createMany({
    data: [
      {
        companyId: company1.id,
        description: 'Grupo A da Empresa 1',
        groupSearchDescription: 'Grupo A',
        imageUrl: 'https://picsum.photos/200/300',
      },
      {
        companyId: company2.id,
        description: 'Grupo B da Empresa 2',
        groupSearchDescription: 'Grupo B',
        imageUrl: 'https://picsum.photos/200/300',
      },
      {
        companyId: company3.id,
        description: 'Grupo C da Empresa 3',
        groupSearchDescription: 'Grupo C',
        imageUrl: 'https://picsum.photos/200/300',
      },
    ],
  });

  // Recuperar os grupos criados
  const group1 = await prisma.group.findFirst({ where: { companyId: company1.id } });
  const group2 = await prisma.group.findFirst({ where: { companyId: company2.id } });
  const group3 = await prisma.group.findFirst({ where: { companyId: company3.id } });

  if (!group1 || !group2 || !group3) {
    throw new Error('Failed to retrieve one or more groups');
  }

  // Criar alguns produtos para cada grupo
  const products = await prisma.product.createMany({
    data: [
      {
        description: 'Produto 1 do Grupo A',
        costValue: 10.0,
        saleValue: 20.0,
        popular: true,
        groupId: group1.id,
        companyId: company1.id,
        imageUrl: 'https://picsum.photos/200/300',
      },
      {
        description: 'Produto 2 do Grupo B',
        costValue: 15.0,
        saleValue: 30.0,
        popular: false,
        groupId: group2.id,
        companyId: company2.id,
        imageUrl: 'https://picsum.photos/200/300',
      },
      {
        description: 'Produto 3 do Grupo C',
        costValue: 20.0,
        saleValue: 40.0,
        popular: true,
        groupId: group3.id,
        companyId: company3.id,
        imageUrl: 'https://picsum.photos/200/300',
      },
    ],
  });

  // Recuperar os produtos criados
  const product1 = await prisma.product.findFirst({ where: { groupId: group1.id } });
  const product2 = await prisma.product.findFirst({ where: { groupId: group2.id } });
  const product3 = await prisma.product.findFirst({ where: { groupId: group3.id } });

  if (!product1 || !product2 || !product3) {
    throw new Error('Failed to retrieve one or more products');
  }

  // Criar alguns ingredientes para cada produto
  await prisma.productIngredient.createMany({
    data: [
      { productId: product1.id, companyId: company1.id, description: 'Ingrediente 1 do Produto 1' },
      { productId: product1.id, companyId: company1.id, description: 'Ingrediente 2 do Produto 1' },
      { productId: product2.id, companyId: company2.id, description: 'Ingrediente 1 do Produto 2' },
      { productId: product2.id, companyId: company2.id, description: 'Ingrediente 2 do Produto 2' },
      { productId: product3.id, companyId: company3.id, description: 'Ingrediente 1 do Produto 3' },
      { productId: product3.id, companyId: company3.id, description: 'Ingrediente 2 do Produto 3' },
    ],
  });

  console.log('Seed data created successfully.');
}

main()
  .catch((e) => {
    console.error('Error occurred:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
