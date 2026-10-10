import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '../api/catalogApi';
import type { ProductFilterParams } from '../types';

export const useProducts = (params: ProductFilterParams = {}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => catalogApi.getProducts(params),
  });
};

export const useBrands = () => {
  return useQuery({
    queryKey: ['brands'],
    queryFn: () => catalogApi.getBrands(),
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => catalogApi.getCategories(),
  });
};

export const useProduct = (id: string | undefined) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => (id ? catalogApi.getProductById(id) : null),
    enabled: Boolean(id),
  });
};

export const useProductBySeo = (seoName: string | undefined) => {
  return useQuery({
    queryKey: ['product-seo', seoName],
    queryFn: () => (seoName ? catalogApi.getProductBySeoName(seoName) : null),
    enabled: Boolean(seoName),
  });
};
