import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, switchMap } from 'rxjs';
import { 
  Order, 
  CreateOrderRequest, 
  CreateGuestOrderRequest, 
  UpdateOrderRequest, 
  OrderFilters, 
  OrdersResponse,
  OrderItem
} from '../models/order.model';
import { ProductService } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly apiUrl = 'http://45.12.229.112:8080/api/v1';

  constructor(
    private http: HttpClient,
    private productService: ProductService
  ) {}

  // Получить все заказы пользователя
  getUserOrders(filters?: OrderFilters): Observable<OrdersResponse> {
    const token = localStorage.getItem('auth_token');
    const headers = { 'Authorization': `Bearer ${token}` };
    
    let params = new HttpParams();
    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.date_from) params = params.set('date_from', filters.date_from);
      if (filters.date_to) params = params.set('date_to', filters.date_to);
      if (filters.search) params = params.set('search', filters.search);
    }

    return this.http.get<OrdersResponse>(`${this.apiUrl}/orders`, { headers, params })
      .pipe(
        map(response => ({
          ...response,
          orders: response.orders.map(order => this.enrichOrderWithProductInfo(order))
        }))
      );
  }

  // Получить все заказы (для админа)
  getAllOrders(filters?: OrderFilters): Observable<OrdersResponse> {
    const token = localStorage.getItem('auth_token');
    const headers = { 'Authorization': `Bearer ${token}` };
    
    let params = new HttpParams();
    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.date_from) params = params.set('date_from', filters.date_from);
      if (filters.date_to) params = params.set('date_to', filters.date_to);
      if (filters.search) params = params.set('search', filters.search);
    }

    return this.http.get<OrdersResponse>(`${this.apiUrl}/admin/orders`, { headers, params });
  }

  // Создать заказ (для авторизованного пользователя)
  createOrder(orderData: CreateOrderRequest): Observable<Order> {
    const token = localStorage.getItem('auth_token');
    const headers = { 'Authorization': `Bearer ${token}` };
    
    return this.http.post<Order>(`${this.apiUrl}/orders`, orderData, { headers });
  }

  // Создать заказ для гостя
  createGuestOrder(orderData: CreateGuestOrderRequest): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders/guest`, orderData);
  }

  // Получить заказ по ID
  getOrderById(orderId: number): Observable<Order> {
    const token = localStorage.getItem('auth_token');
    const headers = { 'Authorization': `Bearer ${token}` };
    
    return this.http.get<Order>(`${this.apiUrl}/orders/${orderId}`, { headers })
      .pipe(
        map(order => this.enrichOrderWithProductInfo(order))
      );
  }

  // Обновить заказ (для админа)
  updateOrder(orderId: number, updateData: UpdateOrderRequest): Observable<Order> {
    const token = localStorage.getItem('auth_token');
    const headers = { 'Authorization': `Bearer ${token}` };
    
    return this.http.put<Order>(`${this.apiUrl}/orders/${orderId}`, updateData, { headers });
  }

  // Отменить заказ
  cancelOrder(orderId: number): Observable<any> {
    const token = localStorage.getItem('auth_token');
    const headers = { 'Authorization': `Bearer ${token}` };
    
    return this.http.post<any>(`${this.apiUrl}/orders/${orderId}/cancel`, {}, { headers });
  }

  // Получить статистику заказов (для админа)
  getOrderStats(): Observable<any> {
    const token = localStorage.getItem('auth_token');
    const headers = { 'Authorization': `Bearer ${token}` };
    
    return this.http.get<any>(`${this.apiUrl}/stats`, { headers });
  }

  // Обогатить заказ информацией о продуктах
  private enrichOrderWithProductInfo(order: Order): Order {
    const enrichedItems = order.items.map(item => {
      // Попробуем получить информацию о продукте из кэша или API
      const product = this.productService.getCachedProduct(item.product_id);
      if (product) {
        return {
          ...item,
          product_name: product.name,
          product_image: product.image_url
        };
      }
      
      // Если продукт не найден в кэше, попробуем загрузить его
      // Для простоты пока используем заглушку, но попробуем загрузить изображение
      let imageUrl = item.product_image || item.image_url || item.image;
      
      // Если изображение не найдено, попробуем загрузить его через API продукта
      if (!imageUrl) {
        // Попробуем загрузить продукт по ID
        this.productService.getProductById(item.product_id).subscribe({
          next: (product) => {
            if (product && product.image_url) {
              // Обновляем изображение в заказе
              item.product_image = product.image_url;
              item.product_name = product.name;
            }
          },
          error: (error) => {
          }
        });
        
        imageUrl = 'assets/images/placeholder.svg';
      }
      
      return {
        ...item,
        product_name: item.product_name || `Товар #${item.product_id}`,
        product_image: imageUrl
      };
    });

    return {
      ...order,
      items: enrichedItems
    };
  }
}
