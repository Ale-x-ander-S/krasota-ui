import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent {
  @Input() currentImageUrl: string = '';
  @Output() imageUploaded = new EventEmitter<string>();
  
  uploading = false;
  uploadProgress = 0;
  error = '';

  constructor(private http: HttpClient) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      this.error = 'Пожалуйста, выберите изображение';
      return;
    }

    // Проверка размера файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.error = 'Размер файла не должен превышать 5MB';
      return;
    }

    this.uploadImage(file);
  }

  private uploadImage(file: File) {
    this.uploading = true;
    this.error = '';
    this.uploadProgress = 0;

    const formData = new FormData();
    formData.append('image', file);

    // Получаем токен авторизации
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Загружаем изображение продукта в S3 через API
    this.http.post<any>('http://45.12.229.112:8080/api/v1/upload/product-image', formData, { 
      headers,
      reportProgress: true,
      observe: 'events'
    }).subscribe({
      next: (event: any) => {
        if (event.type === 4) { // HttpEventType.Response
          this.uploading = false;
          this.uploadProgress = 100;
          // API возвращает объект с original_url, thumb_url, medium_url
          const result = event.body;
          const imageUrl = result.original_url || result.medium_url || result.thumb_url;
          this.imageUploaded.emit(imageUrl);
        } else if (event.type === 1) { // HttpEventType.UploadProgress
          this.uploadProgress = Math.round(100 * event.loaded / event.total);
        }
      },
      error: (error) => {
        this.uploading = false;
        this.uploadProgress = 0;
        this.error = error.error?.error || error.error?.message || 'Ошибка загрузки изображения';
        console.error('Upload error:', error);
      }
    });
  }

  removeImage() {
    this.imageUploaded.emit('');
  }
}

