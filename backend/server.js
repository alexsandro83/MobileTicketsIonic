const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

const queues = { SP: [], SE: [], SG: [] };
let lastCalled = [];
const stats = {
  emitidas: { SP: 0, SE: 0, SG: 0, total: 0 },
  atendidas: { SP: 0, SE: 0, SG: 0, total: 0 },
};

function isExpedienteAberto() {
  const hora = new Date().getHours();
  return hora >= 7 && hora < 17;
}

function generateTicketLocal(type) {
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const seq = (queues[type].length + 1).toString().padStart(2, "0");
  const ticket = `${date}-${type}${seq}`;
  queues[type].push(ticket);
  stats.emitidas[type]++;
  stats.emitidas.total++;
  return ticket;
}

app.get("/health", (req, res) => res.json({ ok: true }));

app.get("/tickets", (req, res) => {
  res.json({ queues, lastCalled, stats });
});

app.post("/tickets", (req, res) => {
  const { type } = req.body;
  if (!isExpedienteAberto()) return res.status(200).json({ ticket: "FECHADO" });
  if (!type || !queues[type])
    return res.status(400).json({ error: "Tipo inválido" });
  const ticket = generateTicketLocal(type);
  res.json({ ticket });
});

app.post("/tickets/next", (req, res) => {
  // lógica simples de prioridade igual ao cliente
  let ticket;
  if (queues.SP.length > 0) ticket = queues.SP.shift();
  else if (queues.SE.length > 0) ticket = queues.SE.shift();
  else if (queues.SG.length > 0) ticket = queues.SG.shift();

  if (ticket) {
    lastCalled.unshift(ticket);
    if (lastCalled.length > 5) lastCalled.pop();

    // determinar tipo pela string
    const type = ticket.includes("-SP")
      ? "SP"
      : ticket.includes("-SE")
        ? "SE"
        : "SG";
    stats.atendidas[type]++;
    stats.atendidas.total++;
  }

  res.json({ ticket: ticket || null });
});

app.get("/tickets/last", (req, res) => {
  res.json({ last: lastCalled });
});

app.get("/stats", (req, res) => {
  res.json(stats);
});

app.listen(PORT, () =>
  console.log(`Backend de teste rodando em http://localhost:${PORT}`),
);
