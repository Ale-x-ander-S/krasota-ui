import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../components/header/header.component';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  inStock: boolean;
}

interface Category {
  name: string;
  description: string;
  icon: string;
  productCount: number;
  products: Product[];
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  showMobileMenu: boolean = false;
  categories: Category[] = [];
  selectedCategory: string = '';
  searchTerm: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    const allProducts = this.getMockProducts();
    
    // Группируем товары по категориям
    const categoryMap = new Map<string, Product[]>();
    
    allProducts.forEach(product => {
      if (!categoryMap.has(product.category)) {
        categoryMap.set(product.category, []);
      }
      categoryMap.get(product.category)!.push(product);
    });

    // Создаем объекты категорий
    this.categories = Array.from(categoryMap.entries()).map(([categoryName, products]) => ({
      name: categoryName,
      description: this.getCategoryDescription(categoryName),
      icon: this.getCategoryIcon(categoryName),
      productCount: products.length,
      products: products
    }));
  }

  getTotalProducts(): number {
    return this.categories.reduce((total, cat) => total + cat.productCount, 0);
  }

  getTotalInStock(): number {
    return this.categories.reduce((total, cat) => total + cat.products.filter(p => p.inStock).length, 0);
  }

  getMockProducts(): Product[] {
    return [
      {
        id: 1,
        name: 'Смартфон iPhone 15 Pro',
        price: 129999,
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzAwN0FGRiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5pUGhvbmUgMTUgUHJvPC90ZXh0Pjwvc3ZnPg==',
        category: 'Электроника',
        description: 'Новейший iPhone с чипом A17 Pro и титановым корпусом',
        inStock: true
      },
      {
        id: 2,
        name: 'Ноутбук MacBook Air M2',
        price: 149999,
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzM0Qzc1OSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5NYWNCb29rIEFpcjwvdGV4dD48L3N2Zz4=',
        category: 'Электроника',
        description: 'Ультратонкий ноутбук с чипом M2 и 18-часовой автономностью',
        inStock: true
      },
      {
        id: 3,
        name: 'Наушники AirPods Pro',
        price: 24999,
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI0ZGOTUwMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5BaXJQb2RzIFBybzwvdGV4dD48L3N2Zz4=',
        category: 'Электроника',
        description: 'Беспроводные наушники с активным шумоподавлением',
        inStock: false
      },
      {
        id: 4,
        name: 'Кроссовки Nike Air Max',
        price: 15999,
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI0ZGQjY2QiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5OaWtlIEFpciBNYXg8L3RleHQ+PC9zdmc+',
        category: 'Обувь',
        description: 'Стильные кроссовки с технологией Air Max',
        inStock: true
      },
      {
        id: 5,
        name: 'Джинсы Levi\'s 501',
        price: 8999,
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzRFQ0RDNCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5MZXZpJ3MgNTAxPC90ZXh0Pjwvc3ZnPg==',
        category: 'Одежда',
        description: 'Классические джинсы прямого кроя',
        inStock: true
      },
      {
        id: 6,
        name: 'Сумка Michael Kors',
        price: 45999,
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzlCNTlCNiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5NaWNoYWVsIEtvcnM8L3RleHQ+PC9zdmc+',
        category: 'Аксессуары',
        description: 'Элегантная кожаная сумка для повседневного использования',
        inStock: true
      },
      {
        id: 7,
        name: 'Часы Apple Watch Series 9',
        price: 39999,
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI0ZGQjMzMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5BcHBsZSBXYXRjaDwvdGV4dD48L3N2Zz4=',
        category: 'Электроника',
        description: 'Умные часы с новыми функциями здоровья',
        inStock: true
      },
      {
        id: 8,
        name: 'Куртка The North Face',
        price: 29999,
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIjJFQ0M3MSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Ob3J0aCBGYWNlPC90ZXh0Pjwvc3ZnPg==',
        category: 'Одежда',
        description: 'Теплая зимняя куртка с водоотталкивающим покрытием',
        inStock: true
      },
      {
        id: 9,
        name: 'Кроссовки Adidas Ultraboost',
        price: 18999,
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzAwMDAwMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5BZGlkYXMgVWx0cmFib29zdDwvdGV4dD48L3N2Zz4=',
        category: 'Обувь',
        description: 'Беговые кроссовки с технологией Boost',
        inStock: true
      },
      {
        id: 10,
        name: 'Солнцезащитные очки Ray-Ban',
        price: 15999,
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzAwMDAwMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5SYXktQmFuPC90ZXh0Pjwvc3ZnPg==',
        category: 'Аксессуары',
        description: 'Классические солнцезащитные очки',
        inStock: true
      }
    ];
  }

  getCategoryDescription(categoryName: string): string {
    const descriptions: { [key: string]: string } = {
      'Электроника': 'Современные гаджеты и устройства для работы и развлечений',
      'Одежда': 'Стильная и качественная одежда для любого случая',
      'Обувь': 'Удобная и модная обувь для всех сезонов',
      'Аксессуары': 'Элегантные аксессуары для завершения образа'
    };
    return descriptions[categoryName] || 'Разнообразные товары высокого качества';
  }

  getCategoryIcon(categoryName: string): string {
    const icons: { [key: string]: string } = {
      'Электроника': '📱',
      'Одежда': '👕',
      'Обувь': '👟',
      'Аксессуары': '👜'
    };
    return icons[categoryName] || '📦';
  }

  getFilteredCategories(): Category[] {
    let filtered = this.categories;

    if (this.selectedCategory) {
      filtered = filtered.filter(cat => cat.name === this.selectedCategory);
    }

    if (this.searchTerm) {
      filtered = filtered.filter(cat => 
        cat.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        cat.description.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    return filtered;
  }

  getFilteredProducts(category: Category): Product[] {
    if (!this.searchTerm) return category.products;
    
    return category.products.filter(product =>
      product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  onCategoryChange() {
    // Логика фильтрации по категории
  }

  onSearchChange() {
    // Логика поиска
  }

  clearFilters() {
    this.selectedCategory = '';
    this.searchTerm = '';
  }

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu() {
    this.showMobileMenu = false;
  }

  formatPrice(price: number): string {
    return price.toLocaleString('ru-RU') + ' ₽';
  }

  goToProduct(productId: number) {
    this.router.navigate(['/product', productId]);
  }

  getCartItemCount(): number {
    // Имитация получения количества товаров в корзине
    return Math.floor(Math.random() * 5) + 1;
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }
}
