import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer';
import { ProductService, Product } from '../../services/product.service';
import { CategoryService, Category } from '../../services/category.service';
import { CartAnimationService } from '../../services/cart-animation.service';
import { CartItem } from '../../models';
import { AddToCart } from '../../store/cart/cart.actions';

// Используем Product из ProductService

interface Review {
  id: number;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  category: Category | null = null;
  quantity: number = 1;
  selectedImage: string = '';
  showMobileMenu: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private categoryService: CategoryService,
    private cartAnimationService: CartAnimationService,
    private store: Store
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const productId = +params['id'];
      this.loadProduct(productId);
    });
  }

  loadProduct(id: number) {
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.selectedImage = product.image_url || 'assets/images/placeholder.svg';
        
        // Загружаем категорию
        this.loadCategory(product.category_id);
      },
      error: (error) => {
        this.router.navigate(['/products']);
      }
    });
  }

  loadCategory(categoryId: number) {
    this.categoryService.getCategoryById(categoryId).subscribe({
      next: (category) => {
        this.category = category;
      },
      error: (error) => {
        this.category = null;
      }
    });
  }



  increaseQuantity() {
    this.quantity++;
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart() {
    if (this.product && this.product.stock > 0) {
      // Запускаем анимацию
      this.playAddToCartAnimation();
      
      // Создаем CartItem для добавления в корзину
      const cartItem: CartItem = {
        id: this.product.id,
        name: this.product.name,
        price: this.product.price,
        quantity: this.quantity,
        image_url: this.product.image_url || '',
        stock: this.product.stock,
        stock_type: this.product.stock_type || 'шт',
        description: this.product.description || '',
        sku: this.product.sku || '',
        category_id: this.product.category_id || 0,
        category_name: this.category?.name || '',
        color: this.product.color,
        size: this.product.size
      };

      // Добавляем в корзину через store
      this.store.dispatch(new AddToCart(cartItem));
      
    }
  }

  private playAddToCartAnimation(): void {
    // Получаем элемент кнопки "Добавить в корзину"
    const addButton = document.querySelector('.add-to-cart-btn') as HTMLElement;
    if (!addButton) return;
    
    // Получаем элемент корзины в хедере
    const cartElement = document.querySelector('.cart-icon') as HTMLElement;
    if (!cartElement) return;
    
    // Запускаем анимацию
    this.cartAnimationService.animateAddToCart(addButton, cartElement);
    
    // Анимация пульсации корзины
    setTimeout(() => {
      this.cartAnimationService.animateCartPulse(cartElement);
    }, 400);
    
    // Анимация счетчика
    setTimeout(() => {
      const countElement = cartElement.querySelector('.cart-count');
      if (countElement) {
        this.cartAnimationService.animateCountChange(countElement as HTMLElement);
      }
    }, 600);
  }

  goBack() {
    this.router.navigate(['/products']);
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

  getStockText(stock: number): string {
    return stock > 0 ? `В наличии: ${stock} шт.` : 'Нет в наличии';
  }

  getStockTypeText(product: Product): string {
    if (product.stock_type === 'уп' && product.package_quantity && product.package_quantity_type) {
      return `${product.package_quantity} ${product.package_quantity_type}`;
    }
    
    // Словарь для других типов запаса
    const stockTypeMap: { [key: string]: string } = {
      'шт': 'штука',
      'кг': 'килограмм',
      'л': 'литр',
      'м': 'метр',
      'уп': 'упаковка',
      'piece': 'штука'
    };
    
    return stockTypeMap[product.stock_type] || product.stock_type;
  }


}
