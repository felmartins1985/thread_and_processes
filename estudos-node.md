# 📘 Estudos Node.js: Streams, Event Loop, Generators, Threads e Processos

## 🔹 Streams

```ts
new Readable({
  objectMode: true,
  read() { ... }
})
```

### `objectMode: true`
- Por padrão, Streams no Node.js trabalham com **buffers binários** ou **strings**.  
- Ao habilitar `objectMode`, você pode trabalhar com **objetos JavaScript**:

```js
this.push({ name: "Felipe", company: "X" })
```

✅ Obrigatório ao lidar com **dados estruturados** (JSON, objetos etc.).

### `read()`
- Método **obrigatório** em uma stream personalizada.
- Gera dados **sob demanda**, economizando memória.  
- Útil para:
  - Grandes volumes de dados (ex.: milhões de registros).
  - Controle de fluxo e backpressure.

---

## 🔹 Event Loop no Node.js

- O **Node.js** roda sobre o **V8 Engine**.  
- O V8 traduz JS em C++ → executa via APIs do Node.  
- O **event loop** gerencia a fila de eventos.  

### Libuv
- Biblioteca C/C++ que:
  - Lida com **I/O** (arquivos, sockets etc.).  
  - Usa uma **thread pool** para rodar tarefas pesadas em paralelo.  

### Funcionamento
1. Eventos entram na fila (HTTP requests, leitura de arquivos).  
2. O loop processa as filas de **microtasks** e **macrotasks**.  
3. Callbacks prontos retornam para a aplicação.  
4. O ciclo se repete enquanto o app estiver ativo.  

👉 O Node é **single-threaded** no event loop, mas **multi-threaded** na thread pool (via Libuv).  

---

## 🔹 Generators (`* function`)

```ts
function* generateUsers() {
  yield { id: 1 }
  yield { id: 2 }
}
```

### Características
- `*` define uma **generator function**.  
- `yield` produz valores um a um (lazy evaluation).  
- Execução **sob demanda**, sem carregar tudo na memória.  

### Vantagens
- **Eficiência de memória**: processa em lotes (ex.: 100 registros por vez).  
- **Streaming**: processa enquanto lê.  
- **Escalabilidade**: funciona mesmo com milhões de registros.  

---

## 🔹 Threads e Processos

### 📍 Processos
- Unidade independente em execução.  
- Tem **PID**, memória e recursos próprios.  

### 📍 Threads
- Unidade menor dentro de um processo.  
- Compartilham memória e recursos do processo.  
- Comunicação mais simples que entre processos.  
- Cada thread tem sua **própria pilha** e **registradores**.  

---

## 🔹 Worker Threads

### Conceito
- Introduzidas no Node.js v10.  
- Criam threads para tarefas **CPU-intensivas** (criptografia, cálculos, parsing etc.).  
- Cada worker tem seu **próprio event loop** e **memória**.

### Quando usar?
- Operações que travariam o event loop principal.  
- Necessidade de **paralelizar execuções pesadas**.  
- Divisão de tarefas entre múltiplos workers.  

### Exemplo

**encrypt-worker.ts**
- Recebe dados do processo principal.  
- Criptografa `user.password` com SHA-256.  
- Retorna objeto processado com `postMessage`.

**index.ts**
- Lê arquivo `legacy_users.ndjson`.  
- Cria um worker para cada linha.  
- Escreve em `encrypted_users.ndjson`.  

```ts
worker.on("message", callback) // recebe dados
worker.on("error", callback)   // captura erros
```

👉 Comunicação via **parentPort** (canal bidirecional).  

---

## 🔹 Child Processes

### `spawn.ts`
- Executa scripts externos (ex.: Python).  
- Comunicação por **streams**:
  - `stdin` → entrada (Node → Python).  
  - `stdout` → saída (Python → Node).  

Exemplo:
- Node lê `users.ndjson`.  
- Envia linha a linha para Python (`stdin`).  
- Python processa e devolve (`stdout`).  
- Node escreve em `validate-users.ndjson`.  

---

## 🔹 Cluster e Round Robin

### `cluster.ts`
Gerencia **múltiplos processos filhos** para paralelizar tarefas.  

**initializeCluster**
- Cria workers via `fork`.  
- Armazena em `Map`.  
- Handlers:
  - `exit` → remove worker.  
  - `error` → encerra app.  
  - `message` → callback do worker.  
- Implementa **round-robin** para distribuir tarefas.  

**initialize**
- Encapsula `initializeCluster`.  
- Fornece:
  - `sendToChild`: envia tarefas a workers.  
  - `killAll`: encerra todos os processos.  

### Round Robin
- Algoritmo que distribui tarefas de forma cíclica e justa.  
- Garante que cada worker seja usado em sequência.  

---

## 🔹 Inserção de Dados

**insert-data.ts**
- Lê `users.ndjson`.  
- Paraleliza processamento com cluster de workers.  

**main**
1. Garante que a tabela do DB existe.  
2. Inicializa cluster.  
3. Lê o arquivo linha por linha.  
4. Envia cada usuário para um worker.  
5. Exibe total processado.  
6. Encerra workers em caso de erro.  
