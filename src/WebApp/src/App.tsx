import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CategoryGrid } from './components/CategoryGrid';
import { BrandBar } from './components/BrandBar';
import { ProductSection } from './components/ProductSection';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import type { Brand, Category, Product, ProductVariant, CartItem } from './types';
import { fetchProducts, fetchBrands, fetchCategories } from './api';

export const App: React.FC = () => {
  // Catalog Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filter States (API GET /api/catalog/products: name, brandId, categoryId, pageIndex, pageSize)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const pageSize = 12;

  // Cart State (stored in localStorage)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('pc_part_market_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Modal State
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Save Cart to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('pc_part_market_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [cartItems]);

  // Initial Load of Brands and Categories
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [loadedBrands, loadedCategories] = await Promise.all([
          fetchBrands(),
          fetchCategories(),
        ]);
        setBrands(loadedBrands);
        setCategories(loadedCategories);
      } catch (err) {
        console.error('Failed loading metadata:', err);
      }
    };
    loadMetadata();
  }, []);

  // Fetch Products whenever filters or page change
  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const res = await fetchProducts(
          currentPage,
          pageSize,
          searchQuery,
          selectedBrand || undefined,
          selectedCategory || undefined
        );
        if (isMounted) {
          setProducts(res.data || []);
          setTotalCount(res.count || 0);
        }
      } catch (err) {
        console.error('Failed fetching products:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Debounce search slightly
    const timer = setTimeout(() => {
      loadProducts();
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [currentPage, searchQuery, selectedCategory, selectedBrand]);

  // Handlers
  const handleSelectCategory = (id: string | null) => {
    setSelectedCategory(id);
    setCurrentPage(0);
    // Smooth scroll down to products section
    const elem = document.getElementById('products-section');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
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

  const handleAddToCart = (product: Product, variant?: ProductVariant) => {
    const targetVariant = variant || product.variants?.[0];
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.variant?.id === targetVariant?.id
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += 1;
        return updated;
      } else {
        return [...prev, { product, variant: targetVariant, quantity: 1 }];
      }
    });

    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, variantId: string | undefined, delta: number) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId && item.variant?.id === variantId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const handleRemoveCartItem = (productId: string, variantId: string | undefined) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.product.id === productId && item.variant?.id === variantId))
    );
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
      <Navbar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {/* Hero Banner Section */}
        <Hero 
          onExploreClick={() => {
            const elem = document.getElementById('products-section');
            if (elem) elem.scrollIntoView({ behavior: 'smooth' });
          }} 
        />

        {/* Categories Showcase */}
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

        {/* Live Catalog Products Grid */}
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
          onAddToCart={handleAddToCart}
          onQuickView={(p) => setQuickViewProduct(p)}
          onSelectCategory={handleSelectCategory}
          onSelectBrand={handleSelectBrand}
          onSearchChange={handleSearchChange}
          onClearAllFilters={handleClearAllFilters}
        />
      </main>

      {/* Quick View Product Modal */}
      <ProductModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => setCartItems([])}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
