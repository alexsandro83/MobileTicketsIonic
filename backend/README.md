# MobileTicketsIonic - Backend de Teste

Servidor de teste simples para desenvolvimento da aplicação MobileTicketsIonic.

Requisitos:

- Node.js 16+

Instalação e execução:

```bash
cd backend
npm install
npm start
```

O servidor lista na porta `3000` por padrão. Endpoints principais:

- `GET /health` — status
- `GET /tickets` — retorna queues, lastCalled e stats
- `POST /tickets` — body `{ type: 'SP'|'SE'|'SG' }` para gerar nova senha
- `POST /tickets/next` — pega a próxima senha a ser atendida
- `GET /tickets/last` — últimas senhas chamadas
- `GET /stats` — estatísticas de emissão e atendimento

Observação: Implementação em memória, útil apenas para testes locais.
