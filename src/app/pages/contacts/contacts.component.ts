import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';

interface FaqItem {
  question: string;
  answer: string;
  isExpanded: boolean;
}

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  agreement: boolean;
}

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent],
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent {
  showMobileMenu: boolean = false;
  
  formData: ContactForm = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    agreement: false
  };

  isSubmitting = false;

  faqs: FaqItem[] = [
    {
      question: 'Как оформить заказ?',
      answer: 'Для оформления заказа добавьте товары в корзину, перейдите к оформлению и заполните необходимые данные. Мы свяжемся с вами для подтверждения заказа.',
      isExpanded: false
    },
    {
      question: 'Какие способы оплаты доступны?',
      answer: 'Мы принимаем оплату банковскими картами, электронными платежами и наличными при получении. Все платежи защищены современными технологиями безопасности.',
      isExpanded: false
    },
    {
      question: 'Сколько времени занимает доставка?',
      answer: 'Сроки доставки зависят от вашего местоположения и выбранного способа доставки. В среднем доставка занимает 1-3 рабочих дня по Москве и 3-7 дней по России.',
      isExpanded: false
    },
    {
      question: 'Можно ли вернуть товар?',
      answer: 'Да, вы можете вернуть товар в течение 14 дней с момента получения, если он не был в использовании и сохранил товарный вид. Подробности в разделе "Возврат и обмен".',
      isExpanded: false
    },
    {
      question: 'Есть ли гарантия на товары?',
      answer: 'Все товары имеют гарантию производителя. Срок гарантии зависит от категории товара и составляет от 1 года до 3 лет. Подробная информация указана в описании каждого товара.',
      isExpanded: false
    }
  ];

  isFormValid(): boolean {
    return !!(
      this.formData.name &&
      this.formData.email &&
      this.formData.subject &&
      this.formData.message &&
      this.formData.agreement
    );
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      return;
    }

    this.isSubmitting = true;
    
    // Имитация отправки формы
    setTimeout(() => {
      console.log('Форма отправлена:', this.formData);
      this.isSubmitting = false;
      
      // Сброс формы
      this.formData = {
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        agreement: false
      };
      
      // Здесь можно показать уведомление об успешной отправке
      alert('Сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.');
    }, 2000);
  }

  toggleFaq(index: number): void {
    this.faqs[index].isExpanded = !this.faqs[index].isExpanded;
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu(): void {
    this.showMobileMenu = false;
  }
}
