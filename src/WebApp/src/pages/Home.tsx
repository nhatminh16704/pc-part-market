import React, { useState } from 'react';
import { Hero } from '@/features/catalog/components/Hero';
import { CategoryGrid } from '@/features/catalog/components/CategoryGrid';
import { BrandBar } from '@/features/catalog/components/BrandBar';
import { ProductSection } from '@/features/catalog/components/ProductSection';
import { ProductModal } from '@/features/catalog/components/ProductModal';
import { useProducts, useBrands, useCategories } from '@/features/catalog/hooks/useCatalog';
import type { Product } from '@/features/catalog/types';

export const Home: React.FC = () => {
  // Filter States (matching API GET /api/catalog/products)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const pageSize = 12;

  // Modal State
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // TanStack Query Hooks
  const { data: brands = [] } = useBrands();
  const { data: categories = [] } = useCategories();
  const {
    data: productsData,
    isLoading,
  } = useProducts({
    pageIndex: currentPage,
    pageSize,
    name: searchQuery,
    brandId: selectedBrand || undefined,
    categoryId: selectedCategory || undefined,
  });

  const products = productsData?.data || [];
  const totalCount = productsData?.count || 0;

  // Handlers
  const handleSelectCategory = (id: string | null) => {
    setSelectedCategory(id);
    setCurrentPage(0);
    const elem = document.getElementById('products-section');
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectBrand = (id: string | null) => {
    setSelectedBrand(id);
    setCurrentPage(0);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(0);
  };

  const handleClearAllFilters = () => {
    setSelectedCategory(null);
    setSelectedBrand(null);
    setSearchQuery('');
    setCurrentPage(0);
  };

  return (
    <div className="w-full min-w-0 max-w-full">
      {/* Hero Showcase */}
      <Hero
        onExploreClick={() => {
          const elem = document.getElementById('products-section');
          if (elem) elem.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Categories Grid */}
      <CategoryGrid
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
      />

      {/* Brands Ticker */}
      {brands.length > 0 && (
        <BrandBar
          brands={brands}
          selectedBrand={selectedBrand}
          onSelectBrand={handleSelectBrand}
        />
      )}

      {/* Catalog Products Grid */}
      <ProductSection
        products={products}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={pageSize}
        isLoading={isLoading}
        categories={categories}
        brands={brands}
        selectedCategory={selectedCategory}
        selectedBrand={selectedBrand}
        searchQuery={searchQuery}
        onPageChange={setCurrentPage}
        onQuickView={(p) => setQuickViewProduct(p)}
        onSelectCategory={handleSelectCategory}
        onSelectBrand={handleSelectBrand}
        onSearchChange={handleSearchChange}
        onClearAllFilters={handleClearAllFilters}
      />

      {/* Quick View Modal */}
      <ProductModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
