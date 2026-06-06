import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class QueueService {
  private queues = {
    SP: [] as string[],
    SE: [] as string[],
    SG: [] as string[],
  };
  public lastCalled: string[] = [];
  private lastTypeCalled: 'SP' | 'OTHERS' = 'OTHERS';

  // --- NOVOS CAMPOS PARA O RELATÓRIO ---
  public stats = {
    emitidas: { SP: 0, SE: 0, SG: 0, total: 0 },
    atendidas: { SP: 0, SE: 0, SG: 0, total: 0 },
  };

  private apiUrl = environment.apiUrl || '';

  constructor(private http: HttpClient) {}

  public isExpedienteAberto(): boolean {
    const hora = new Date().getHours();
    return hora >= 7 && hora < 17;
  }

  // Mantém compatibilidade: sempre retorna uma Promise<string | 'FECHADO'>
  private generateLocalTicket(type: 'SP' | 'SE' | 'SG'): string {
    const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const seq = (this.queues[type].length + 1).toString().padStart(2, '0');
    const ticket = `${date}-${type}${seq}`;

    this.queues[type].push(ticket);
    this.stats.emitidas[type]++;
    this.stats.emitidas.total++;
    return ticket;
  }

  async generateTicket(type: 'SP' | 'SE' | 'SG'): Promise<string> {
    if (!this.isExpedienteAberto()) return 'FECHADO';

    if (!this.apiUrl) {
      return this.generateLocalTicket(type);
    }

    try {
      const res: any = await firstValueFrom(
        this.http.post(`${this.apiUrl}/tickets`, { type }),
      );
      if (res && res.ticket && res.ticket !== 'FECHADO') return res.ticket;
      if (res && res.ticket === 'FECHADO') return 'FECHADO';
      return this.generateLocalTicket(type);
    } catch (error) {
      console.warn('API inacessível, usando fallback local:', error);
      return this.generateLocalTicket(type);
    }
  }

  async getNext(): Promise<string | undefined> {
    if (!this.apiUrl) {
      let ticket: string | undefined;
      let typeFound: 'SP' | 'SE' | 'SG' | null = null;

      if (this.lastTypeCalled === 'OTHERS' && this.queues.SP.length > 0) {
        ticket = this.queues.SP.shift();
        typeFound = 'SP';
        this.lastTypeCalled = 'SP';
      } else {
        if (this.queues.SE.length > 0) {
          ticket = this.queues.SE.shift();
          typeFound = 'SE';
        } else if (this.queues.SG.length > 0) {
          ticket = this.queues.SG.shift();
          typeFound = 'SG';
        }
        this.lastTypeCalled = 'OTHERS';
      }

      if (ticket && typeFound) {
        this.lastCalled.unshift(ticket);
        if (this.lastCalled.length > 5) this.lastCalled.pop();
        this.stats.atendidas[typeFound]++;
        this.stats.atendidas.total++;
      }
      return ticket;
    }

    try {
      const res: any = await firstValueFrom(
        this.http.post(`${this.apiUrl}/tickets/next`, {}),
      );
      if (res && res.ticket) return res.ticket;
      return this.getNextLocal();
    } catch (error) {
      console.warn(
        'API inacessível, usando fallback local para próxima senha:',
        error,
      );
      return this.getNextLocal();
    }
  }

  private getNextLocal(): string | undefined {
    let ticket: string | undefined;
    let typeFound: 'SP' | 'SE' | 'SG' | null = null;

    if (this.lastTypeCalled === 'OTHERS' && this.queues.SP.length > 0) {
      ticket = this.queues.SP.shift();
      typeFound = 'SP';
      this.lastTypeCalled = 'SP';
    } else {
      if (this.queues.SE.length > 0) {
        ticket = this.queues.SE.shift();
        typeFound = 'SE';
      } else if (this.queues.SG.length > 0) {
        ticket = this.queues.SG.shift();
        typeFound = 'SG';
      }
      this.lastTypeCalled = 'OTHERS';
    }

    if (ticket && typeFound) {
      this.lastCalled.unshift(ticket);
      if (this.lastCalled.length > 5) this.lastCalled.pop();
      this.stats.atendidas[typeFound]++;
      this.stats.atendidas.total++;
    }
    return ticket;
  }

  async getLastCalled(): Promise<string[]> {
    if (!this.apiUrl) return this.lastCalled;
    try {
      const res: any = await firstValueFrom(
        this.http
          .get(`${this.apiUrl}/tickets/last`)
          .pipe(catchError(() => of({ last: this.lastCalled }))),
      );
      return res.last || this.lastCalled;
    } catch {
      return this.lastCalled;
    }
  }

  async getStats(): Promise<any> {
    if (!this.apiUrl) return this.stats;
    try {
      const res: any = await firstValueFrom(
        this.http
          .get(`${this.apiUrl}/stats`)
          .pipe(catchError(() => of(this.stats))),
      );
      return res || this.stats;
    } catch {
      return this.stats;
    }
  }
}
