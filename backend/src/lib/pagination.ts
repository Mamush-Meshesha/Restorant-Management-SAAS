export interface PaginationDto {
  page?: number;
  limit?: number;
  name?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  roleId?: string;
  organizationId?: string;
  isActive?: boolean;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
  name?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export const buildPaginationOptions = (paginationDto: PaginationDto): PaginationOptions => {
  const page = paginationDto.page ? Number(paginationDto.page) : 1;
  const limit = paginationDto.limit ? Number(paginationDto.limit) : 10;
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
    name: paginationDto.name,
    sortBy: paginationDto.sortBy || 'created_at',
    sortOrder: paginationDto.sortOrder || 'desc',
    filters: {
      ...(paginationDto.roleId && { role_id: paginationDto.roleId }),
      ...(paginationDto.organizationId && { organization_id: paginationDto.organizationId }),
      ...(paginationDto.isActive !== undefined && { is_active: paginationDto.isActive }),
    }
  };
};

export const buildSearchFilter = (name: string, searchFields: string[]): any => {
  if (!name) return {};

  const searchConditions = searchFields.map(field => ({
    [field]: {
      contains: name,
      mode: 'insensitive' as const
    }
  }));

  return {
    OR: searchConditions
  };
};

export const buildDateFilter = (dateFrom?: string, dateTo?: string): any => {
  const filter: any = {};

  if (dateFrom) {
    filter.gte = new Date(dateFrom);
  }

  if (dateTo) {
    filter.lte = new Date(dateTo);
  }

  return Object.keys(filter).length > 0 ? filter : {};
};

export const createPaginationResult = <T>(
  data: T[],
  total: number,
  options: PaginationOptions
): PaginationResult<T> => {
  const totalPages = Math.ceil(total / options.limit);
  const hasNext = options.page < totalPages;
  const hasPrev = options.page > 1;

  return {
    data,
    pagination: {
      page: options.page,
      limit: options.limit,
      total,
      totalPages,
      hasNext,
      hasPrev
    }
  };
}; 