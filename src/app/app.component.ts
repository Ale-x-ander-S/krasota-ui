import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ScrollService } from './services/scroll.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'krasota-ui';

  constructor(private scrollService: ScrollService) {}

  ngOnInit(): void {
    // Сервис автоматически инициализируется и начинает отслеживать изменения маршрутов
  }
}
