import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { Store, Select } from '@ngxs/store';
import { AddToCart, CartStateClass } from '../../store/cart';
import { Observable } from 'rxjs';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  inStock: boolean;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = [];
  selectedCategory: string = '';
  searchTerm: string = '';
  sortBy: string = 'name';
  viewMode: 'grid' | 'list' = 'grid'; // Добавляем режим отображения

  @Select(CartStateClass.getItemCount) itemCount$!: Observable<number>;

  constructor(
    private router: Router,
    private store: Store
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.categories = [...new Set(this.products.map(p => p.category))];
    this.filteredProducts = [...this.products];
  }

  loadProducts() {
    this.products = [
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
      }
    ];
  }

  filterProducts() {
    this.filteredProducts = this.products.filter(product => {
      const matchesCategory = !this.selectedCategory || product.category === this.selectedCategory;
      const matchesSearch = !this.searchTerm || 
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
    this.sortProducts();
  }

  sortProducts() {
    this.filteredProducts.sort((a, b) => {
      switch (this.sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }

  onCategoryChange() {
    this.filterProducts();
  }

  onSearchChange() {
    this.filterProducts();
  }

  onSortChange() {
    this.sortProducts();
  }

  toggleViewMode(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }


  goToProduct(productId: number) {
    this.router.navigate(['/product', productId]);
  }

  addToCart(event: Event, product: Product) {
    event.stopPropagation(); // Предотвращаем всплытие события
    
    if (!product.inStock) return;
    
    this.store.dispatch(new AddToCart(product));
  }

  getCartItemCount(): number {
    // Имитация получения количества товаров в корзине
    return Math.floor(Math.random() * 5) + 1;
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  formatPrice(price: number): string {
    return price.toLocaleString('ru-RU') + ' ₽';
  }
}
