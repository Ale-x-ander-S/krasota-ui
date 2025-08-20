import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CartAnimationService {
  private renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  /**
   * Анимация добавления товара в корзину
   * @param productElement - DOM элемент карточки товара
   * @param cartElement - DOM элемент корзины в хедере
   */
  animateAddToCart(productElement: HTMLElement, cartElement: HTMLElement): void {
    if (!productElement || !cartElement) return;

    // Создаем клон карточки для анимации
    const clone = productElement.cloneNode(true) as HTMLElement;
    
    // Позиционируем клон поверх оригинальной карточки
    const rect = productElement.getBoundingClientRect();
    const cartRect = cartElement.getBoundingClientRect();
    
    this.renderer.setStyle(clone, 'position', 'fixed');
    this.renderer.setStyle(clone, 'top', `${rect.top}px`);
    this.renderer.setStyle(clone, 'left', `${rect.left}px`);
    this.renderer.setStyle(clone, 'width', `${rect.width}px`);
    this.renderer.setStyle(clone, 'height', `${rect.height}px`);
    this.renderer.setStyle(clone, 'z-index', '9999');
    this.renderer.setStyle(clone, 'pointer-events', 'none');
    this.renderer.setStyle(clone, 'transition', 'none');
    this.renderer.setStyle(clone, 'transform', 'scale(1)');
    this.renderer.setStyle(clone, 'opacity', '1');
    this.renderer.setStyle(clone, 'border-radius', '8px');
    this.renderer.setStyle(clone, 'box-shadow', '0 4px 20px rgba(0, 0, 0, 0.15)');
    
    // Добавляем клон в body
    this.renderer.appendChild(document.body, clone);
    
    // Запускаем анимацию
    requestAnimationFrame(() => {
      // Анимация полета в корзину
      this.renderer.setStyle(clone, 'transition', 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)');
      this.renderer.setStyle(clone, 'top', `${cartRect.top + cartRect.height / 2}px`);
      this.renderer.setStyle(clone, 'left', `${cartRect.left + cartRect.width / 2}px`);
      this.renderer.setStyle(clone, 'width', '20px');
      this.renderer.setStyle(clone, 'height', '20px');
      this.renderer.setStyle(clone, 'transform', 'scale(0.3) rotate(360deg)');
      this.renderer.setStyle(clone, 'opacity', '0');
      this.renderer.setStyle(clone, 'border-radius', '50%');
    });
    
    // Удаляем клон после анимации
    setTimeout(() => {
      if (clone.parentNode) {
        this.renderer.removeChild(document.body, clone);
      }
    }, 800);
  }

  /**
   * Анимация пульсации корзины
   * @param cartElement - DOM элемент корзины
   */
  animateCartPulse(cartElement: HTMLElement): void {
    if (!cartElement) return;
    
    // Добавляем класс для анимации
    this.renderer.addClass(cartElement, 'cart-pulse');
    
    // Убираем класс через время анимации
    setTimeout(() => {
      this.renderer.removeClass(cartElement, 'cart-pulse');
    }, 600);
  }

  /**
   * Анимация счетчика товаров
   * @param countElement - DOM элемент счетчика
   */
  animateCountChange(countElement: HTMLElement): void {
    if (!countElement) return;
    
    // Добавляем класс для анимации
    this.renderer.addClass(countElement, 'count-bounce');
    
    // Убираем класс через время анимации
    setTimeout(() => {
      this.renderer.removeClass(countElement, 'count-bounce');
    }, 400);
  }
}
