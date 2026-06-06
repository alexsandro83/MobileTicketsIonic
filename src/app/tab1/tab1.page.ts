import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importante para o *ngIf
import { IonicModule } from '@ionic/angular'; // Importante para ion-header, ion-button, etc
import { QueueService } from '../services/queue.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true, // Garanta que esteja como true
  imports: [IonicModule, CommonModule], // Adicione aqui
})
export class Tab1Page {
  ultimaSenhaGerada: string = '';

  constructor(private queueService: QueueService) {}

  async gerarSenha(tipo: 'SP' | 'SE' | 'SG') {
    const resultado = await this.queueService.generateTicket(tipo);
    if (resultado === 'FECHADO') {
      alert('O sistema só emite senhas entre 07:00 e 17:00.');
      this.ultimaSenhaGerada = '';
    } else {
      this.ultimaSenhaGerada = resultado as string;
    }
  }
}
