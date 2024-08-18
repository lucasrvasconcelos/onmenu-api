import Fastify, { FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import { AddressInfo } from 'net';

const fastify = Fastify({ logger: false });
const prisma = new PrismaClient();

fastify.register(cors, {
  origin: "*",
});

fastify.get('/app/:company', async (request, reply) => {
  const { company } = request.params as { company: string };


  const companyData = await prisma.company.findUnique({
    where: { cnpj: company },
  });
  if (!companyData) {
    reply.status(200).send({
      error: {
        message: 'Company not found',
      },
      data: companyData
  });
  } else {
    reply.send({
        error: false,
        data: companyData
    });
  }
});

fastify.get('/app/:company/groups', async (request, reply) => {

  const { company } = request.params as { company: string };
  const companyData = await prisma.company.findUnique({
    where: { cnpj: company }
  });

  if (!companyData) {
    reply.status(200).send({
      error: {
        message: 'Company not found',
      },
      data: companyData
  });
}

  const groupsData = await prisma.group.findMany({
    where: { companyId: companyData?.id },
  });

  reply.send({
      error: false,
      data: groupsData
  });

});

fastify.get('/app/:company/popular', async (request, reply) => {
  const { company } = request.params as { company: string };
  const { groupId } = request.query as { groupId: string };

  const companyData = await prisma.company.findUnique({
    where: { cnpj: company },
    include: {
      products: {
        where: { 
          popular: true,
          ...(groupId && { groupId: Number(groupId) }),
         },
      },
    },
  });

  if (!companyData) {
    reply.status(404).send({
        error: true,
        data: companyData
     });
  } else {
    reply.send(
      {
        error: false,
        data: companyData.products
     }
  );
  }
});

interface Item {
  id: number
  description: string
  saleValue: number
  companyId: number
}

interface GetCurrentPricesRequest {
  company: string
  itens: Item[]
}

fastify.post('/app/get-current-prices', async (request, reply) => {

  const { company, itens } = request.body as GetCurrentPricesRequest;

  const companyFindData = await prisma.company.findUnique({
    where: { cnpj: company }});


  if(!companyFindData){
      return reply.status(200).send({
        error: {
          status: true,
          message: 'Não foi possível encontrar a empresa companyFindData'
        },
        data: company
      });
    }

  const products = await prisma.product.findMany({
    where: {
      companyId: companyFindData.id,
      id: {
        in: itens.map(item => item.id)
      }
    },
    select: {
      id: true,
      companyId: true,
      description: true,
      saleValue: true,
      imageUrl: true
    }
  });

  if (!products) {
    return reply.status(404).send({
        error: true,
        data: products
      });
  } 

  reply.send({ 
    error: false,
    data: {
      company: companyFindData, 
      prices: products 
    }});
});

fastify.get('/app/:company/product', async (request, reply) => {
  const { company } = request.params as { company: string };
  const { proid } = request.query as { proid: number };

  const companyData = await prisma.company.findUnique({
    where: { cnpj: company }});

  if (!companyData) {
    return reply.status(404).send({
        error: true,
        data: companyData
     });
  } 

  const product = await prisma.product.findUnique({
    where: { id: Number(proid) },
    include: {
      ProductIngredient: {
        where: { 
          productId: Number(proid),
         },
      },
    },
  });

  reply.send({
      error: false,
      data: product
  });



});

fastify.get('/app/:company/neighborhood', async (request, reply) => {
  
  const { company } = request.params as { company: string}


  const companyData = await prisma.company.findUnique({
    where: { cnpj: company }});

  if (!companyData) {
    return reply.status(404).send({
        error: true,
        data: null
      });
  } 


  const neighborhood = await prisma.neighborhood.findMany({
    where: {
      companyId: companyData.id,
    
    },
    select: {
      id: true,
      description: true,
      tax: true,
      companyId: true,
    }
  });

    reply.send({
      error: false,
      data: neighborhood
  });

})

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    const address = fastify.server.address();
    if (address && typeof address !== 'string') {
      const port = (address as AddressInfo).port;
      fastify.log.info(`Server listening on ${port}`);
    } else {
      fastify.log.info(`Server listening`);
    }
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
