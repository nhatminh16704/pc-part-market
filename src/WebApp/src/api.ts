import { apiClient } from './apiClient';
import type { Brand, Category, PaginatedItems, Product } from './types';

export const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const fetchProducts = async (
  pageIndex: number = 0,
  pageSize: number = 12,
  name?: string,
  brandId?: string,
  categoryId?: string
): Promise<PaginatedItems<Product>> => {
  const params: Record<string, string | number> = {
    pageIndex,
    pageSize,
  };

  if (name?.trim()) params.name = name.trim();
  if (brandId) params.brandId = brandId;
  if (categoryId) params.categoryId = categoryId;

  try {
    const res = await apiClient.get('/catalog/products', { params });
    const json = res.data;
    return json?.data ?? json;
  } catch (err) {
    console.warn('Axios error fetching products, using mock fallback:', err);
    return getFallbackProducts();
  }
};

export const fetchBrands = async (): Promise<Brand[]> => {
  try {
    const res = await apiClient.get('/catalog/brands');
    const json = res.data;
    return json?.data ?? json;
  } catch (err) {
    console.warn('Axios error fetching brands, using mock fallback:', err);
    return [
      { id: '1', name: 'ASUS', seoName: 'asus', status: 'ACTIVE' },
      { id: '2', name: 'MSI', seoName: 'msi', status: 'ACTIVE' },
      { id: '3', name: 'GIGABYTE', seoName: 'gigabyte', status: 'ACTIVE' },
      { id: '4', name: 'Colorful', seoName: 'colorful', status: 'ACTIVE' },
      { id: '5', name: 'ZOTAC', seoName: 'zotac', status: 'ACTIVE' },
      { id: '6', name: 'ASRock', seoName: 'asrock', status: 'ACTIVE' },
    ];
  }
};

export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const res = await apiClient.get('/catalog/categories');
    const json = res.data;
    return json?.data ?? json;
  } catch (err) {
    console.warn('Axios error fetching categories, using mock fallback:', err);
    return [
      { id: 'cat-vga', name: 'Card Màn Hình (VGA)', seoName: 'vga', status: 'ACTIVE' },
      { id: 'cat-cpu', name: 'Bộ Vi Xử Lý (CPU)', seoName: 'cpu', status: 'ACTIVE' },
      { id: 'cat-main', name: 'Bo Mạch Chủ (Mainboard)', seoName: 'mainboard', status: 'ACTIVE' },
      { id: 'cat-ram', name: 'Bộ Nhớ Trong (RAM)', seoName: 'ram', status: 'ACTIVE' },
      { id: 'cat-ssd', name: 'Ổ Cứng SSD/HDD', seoName: 'storage', status: 'ACTIVE' },
      { id: 'cat-psu', name: 'Nguồn Máy Tính (PSU)', seoName: 'psu', status: 'ACTIVE' },
      { id: 'cat-cooler', name: 'Tản Nhiệt PC', seoName: 'cooling', status: 'ACTIVE' },
      { id: 'cat-case', name: 'Vỏ Case', seoName: 'case', status: 'ACTIVE' },
    ];
  }
};

const getFallbackProducts = (): PaginatedItems<Product> => {
  const dummy: Product[] = [
    {
      id: 'demo-1',
      name: 'VGA ASUS ROG Strix GeForce RTX 4090 OC Edition 24GB GDDR6X',
      seoName: 'asus-rog-strix-rtx-4090-oc-24gb',
      categoryId: 'cat-vga',
      status: 'ACTIVE',
      brand: { id: '1', name: 'ASUS', seoName: 'asus', status: 'ACTIVE' },
      category: { id: 'cat-vga', name: 'Card Màn Hình (VGA)', seoName: 'vga', status: 'ACTIVE' },
      specifications: { 'Bộ nhớ': '24GB GDDR6X', 'Bus': '384-bit', 'Xung nhịp': '2640 MHz', 'Cổng': 'HDMI 2.1a x 2, DP 1.4a x 3' },
      description: 'Quái vật đồ họa cao cấp nhất từ ASUS ROG với tản nhiệt buồng hơi MaxContact và thiết kế khung kim loại đúc nguyên khối.',
      variants: [
        {
          id: 'var-1',
          productId: 'demo-1',
          price: 52990000,
          quantity: 12,
          sku: 'ROG-STRIX-RTX4090-O24G-GAMING',
          warrantyMonths: 36,
          status: 'ACTIVE',
        }
      ],
      images: [
        { id: 'img-1', imageUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80', isMain: true }
      ]
    },
    {
      id: 'demo-2',
      name: 'CPU Intel Core i9-14900KS (Up to 6.2GHz | 24 Nhân 32 Luồng | 36MB Cache)',
      seoName: 'intel-core-i9-14900ks',
      categoryId: 'cat-cpu',
      status: 'ACTIVE',
      brand: { id: '7', name: 'Intel', seoName: 'intel', status: 'ACTIVE' },
      category: { id: 'cat-cpu', name: 'Bộ Vi Xử Lý (CPU)', seoName: 'cpu', status: 'ACTIVE' },
      specifications: { 'Số nhân': '24 (8P + 16E)', 'Số luồng': '32', 'Tần số Turbo': '6.2 GHz', 'TDP': '150W - 253W' },
      description: 'Phiên bản Special Edition ép xung đỉnh cao của Intel, xung nhịp phá kỷ lục lên tới 6.2GHz dành cho game thủ hardcore.',
      variants: [
        {
          id: 'var-2',
          productId: 'demo-2',
          price: 17490000,
          quantity: 25,
          sku: 'BX8071514900KS',
          warrantyMonths: 36,
          status: 'ACTIVE',
        }
      ],
      images: [
        { id: 'img-2', imageUrl: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=800&q=80', isMain: true }
      ]
    },
    {
      id: 'demo-3',
      name: 'Mainboard MSI MEG Z790 GODLIKE MAX DDR5 Flagship E-ATX',
      seoName: 'msi-meg-z790-godlike-max',
      categoryId: 'cat-main',
      status: 'ACTIVE',
      brand: { id: '2', name: 'MSI', seoName: 'msi', status: 'ACTIVE' },
      category: { id: 'cat-main', name: 'Bo Mạch Chủ', seoName: 'mainboard', status: 'ACTIVE' },
      specifications: { 'Chipset': 'Intel Z790', 'Socket': 'LGA 1700', 'Form Factor': 'E-ATX', 'RAM': '4 x DDR5 max 192GB' },
      description: 'Bo mạch chủ huyền thoại với màn hình cảm ứng M-Vision Dashboard 4.4 inch, 26+2 phase nguồn và 7 khe M.2 PCIe 5.0.',
      variants: [
        {
          id: 'var-3',
          productId: 'demo-3',
          price: 31990000,
          quantity: 8,
          sku: 'MEG-Z790-GODLIKE-MAX',
          warrantyMonths: 36,
          status: 'ACTIVE',
        }
      ],
      images: [
        { id: 'img-3', imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80', isMain: true }
      ]
    },
    {
      id: 'demo-4',
      name: 'RAM Corsair Dominator Titanium RGB 64GB (2x32GB) DDR5 6600MHz White',
      seoName: 'corsair-dominator-titanium-rgb-64gb-ddr5',
      categoryId: 'cat-ram',
      status: 'ACTIVE',
      brand: { id: '8', name: 'Corsair', seoName: 'corsair', status: 'ACTIVE' },
      category: { id: 'cat-ram', name: 'Bộ Nhớ Trong (RAM)', seoName: 'ram', status: 'ACTIVE' },
      specifications: { 'Dung lượng': '64GB (2x32GB)', 'Loại': 'DDR5', 'Tốc độ': '6600 MHz', 'Độ trễ': 'CL32' },
      description: 'Đỉnh cao phong cách với nắp tản nhiệt có thể tháo rời, LED RGB sắc nét và chip nhớ được tuyển chọn nghiêm ngặt.',
      variants: [
        {
          id: 'var-4',
          productId: 'demo-4',
          price: 8990000,
          quantity: 40,
          sku: 'CMP64GX5M2B6600C32W',
          warrantyMonths: 36,
          status: 'ACTIVE',
        }
      ],
      images: [
        { id: 'img-4', imageUrl: 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=800&q=80', isMain: true }
      ]
    }
  ];

  return {
    pageIndex: 0,
    pageSize: 12,
    count: dummy.length,
    data: dummy,
  };
};
