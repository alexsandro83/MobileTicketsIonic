import { Component } from '@angular/core';
import { QueueService } from '../services/queue.service';

@Component({
  selector: 'app-tab2',
  standalone: false,
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page {
  // Mantenha como 'public' para o HTML conseguir acessar
  constructor(public queueService: QueueService) {}
}
