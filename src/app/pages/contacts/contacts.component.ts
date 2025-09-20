import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer';

interface FaqItem {
  question: string;
  answer: string;
  isExpanded: boolean;
}


@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent {
  showMobileMenu: boolean = false;
  

  faqs: FaqItem[] = [
    {
      question: 'Как оформить заказ?',
      answer: 'Для оформления заказа добавьте товары в корзину, перейдите к оформлению и заполните необходимые данные. Мы свяжемся с вами для подтверждения заказа.',
      isExpanded: false
    },
    {
      question: 'Какие способы оплаты доступны?',
      answer: 'Мы принимаем оплату наличными при получении товара. Это самый удобный и безопасный способ оплаты.',
      isExpanded: false
    },
    {
      question: 'Сколько стоит доставка?',
      answer: 'Доставка по городу Тюмень бесплатная при заказе от 1000 рублей. При заказе на меньшую сумму стоимость доставки составляет 100 рублей.',
      isExpanded: false
    },
    {
      question: 'Как быстро доставляют заказы?',
      answer: 'Заказы, оформленные в будний день до 13:00, доставляем в тот же день с 13:00 до 19:00. Заказы, оформленные после 13:00, доставляем на следующий рабочий день.',
      isExpanded: false
    },
    {
      question: 'Можно ли вернуть товар?',
      answer: 'Да, вы можете вернуть товар в течение 14 дней с момента получения, если он не был в использовании и сохранил товарный вид.',
      isExpanded: false
    },
    {
      question: 'Есть ли гарантия на товары?',
      answer: 'Все товары имеют гарантию производителя. Срок гарантии зависит от категории товара и составляет от 1 года до 3 лет.',
      isExpanded: false
    }
  ];


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
