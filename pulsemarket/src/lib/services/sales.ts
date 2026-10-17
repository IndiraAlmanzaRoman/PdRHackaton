import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { SalesQuery } from "@/lib/validators/sales";

function buildWhere(query: SalesQuery): Prisma.SaleWhereInput {
  const where: Prisma.SaleWhereInput = {};

  if (query.category) {
    where.product = { is: { category: query.category } };
  }

  if (query.from || query.to) {
    where.createdAt = {
      ...(query.from ? { gte: new Date(query.from) } : {}),
      ...(query.to ? { lte: new Date(query.to) } : {}),
    };
  }

  if (query.search) {
    where.OR = [
      { productName: { contains: query.search, mode: "insensitive" } },
      { productSku: { contains: query.search, mode: "insensitive" } },
      { customer: { is: { name: { contains: query.search, mode: "insensitive" } } } },
      { customer: { is: { email: { contains: query.search, mode: "insensitive" } } } },
    ];
  }

  return where;
}

function buildOrderBy(
  sortBy: SalesQuery["sortBy"],
  sortOrder: SalesQuery["sortOrder"],
): Prisma.SaleOrderByWithRelationInput[] {
  return [{ [sortBy]: sortOrder }, { id: sortOrder }];
}

export async function getSalesPage(query: SalesQuery) {
  const where = buildWhere(query);
  const skip = (query.page - 1) * query.pageSize;

  const [sales, total] = await Promise.all([
    prisma.sale.findMany({
      where,
      select: {
        id: true,
        productName: true,
        productSku: true,
        quantity: true,
        unitPrice: true,
        total: true,
        channel: true,
        createdAt: true,
        customer: {
          select: { id: true, name: true, email: true, country: true },
        },
        product: {
          select: { category: true },
        },
      },
      orderBy: buildOrderBy(query.sortBy, query.sortOrder),
      skip,
      take: query.pageSize,
    }),
    prisma.sale.count({ where }),
  ]);

  return {
    items: sales.map((sale) => ({
      ...sale,
      unitPrice: sale.unitPrice.toString(),
      total: sale.total.toString(),
    })),
    page: query.page,
    pageSize: query.pageSize,
    total,
    totalPages: Math.ceil(total / query.pageSize),
  };
}
