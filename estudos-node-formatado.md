# 📘 Estudos Node.js: Streams, Event Loop, Generators, Threads e Processos

## 🔹 Stream

```ts
new Readable({ ... })
```

Cria uma **stream legível personalizada**, ou seja, um objeto que pode fornecer dados para quem quiser "ler" (como o `for await...of` no código principal).

### `objectMode: true`
- Streams no Node.js por padrão funcionam com **buffers binários** ou **strings**.  
- Como aqui queremos trabalhar com **objetos JavaScript** (usuários gerados), precisamos ativar o modo objeto.  

O que isso faz?
- Permite que o `this.push()` receba objetos JS como `{ name: 'Felipe', company: 'X' }`, e não apenas strings ou buffers.  
- É obrigatório quando se trabalha com **dados estruturados** (JSON, objetos etc.).

### `read()`
Método obrigatório ao criar uma **Readable** personalizada.

Quando e por que usar?
- Gerar dados sob demanda, não tudo de uma vez (economia de memória).  
- Trabalhar com grandes volumes (ex.: milhões de registros).  
- Controlar o fluxo de inserção com segurança.

---

## 🔹 Loop de Eventos no Node.js

- Node.js roda sobre o **V8 Engine**, o mesmo do Chrome.  
- O V8 traduz JS em C++, que é então transpilado e compilado.  
- Quando uma função é executada, o V8 processa e a coloca em uma fila. Essa fila é consumida pelo **event loop**, responsável por gerenciar a execução.  

### Libuv
- Biblioteca em C/C++ que lida com **chamadas ao sistema operacional** (I/O, leitura/escrita de arquivos).  
- Quando o event loop encontra uma tarefa de fundo, delega à **thread pool**.  
- Enquanto isso, o loop continua processando novos eventos.

### Processamento de tarefas assíncronas
- Entradas: HTTP, leitura de arquivos etc.  
- Fila: microtasks ou macrotasks.  
- Execução: callbacks prontos são trazidos de volta para a aplicação.  
- O loop continua indefinidamente enquanto a aplicação roda.

⚡ Node.js é **single-threaded** no event loop, mas partes do processamento podem ser **multi-threaded** via libuv (thread pool) e métodos C++ delegados ao SO.

---

## 🔹 Generator Functions (`*`)

O `*` na função indica que é uma **função geradora** (generator function).

Características:
- Não retorna valor diretamente, mas um **gerador** que produz múltiplos valores ao longo do tempo.  
- Usa `yield` para "produzir" valores, pausando entre execuções.  
- Geração sob demanda (**lazy evaluation**).  

### Vantagens
- Eficiência de memória (processa lotes, ex.: 100 registros por vez).  
- Streaming: processa dados conforme leitura.  
- Escalável para milhões de registros.

---

## 🔹 Tópicos Avançados: Threads e Processos

### Processos
- Unidade de um programa em execução, com código e estado.  
- Possui espaço de memória próprio e recursos dedicados.  
- Identificado por um **PID** (Process Identifier).  

### Threads
- Unidade de execução menor que um processo.  
- Compartilham memória e recursos do processo.  
- Executam independentemente, mas com comunicação direta.  
- Cada thread tem contador de programa, pilha e registradores próprios.  

📌 No multiprocessamento/multithread:
- O processo mantém segmentos de código, dados e heap.  
- Cada thread tem sua pilha e registradores.  
- Comunicação entre threads é mais simples que entre processos.

---

## 🔹 Worker Threads

### Conceito
- Introduzidas no Node.js v10.  
- Lidam com tarefas **CPU-intensivas** (criptografia, cálculos complexos etc.).  
- Funcionam em **pool de threads** gerenciado pelo Libuv.  
- Cada worker tem seu **event loop** e memória própria.

### Vantagens
- Execuções paralelas dentro do processo.  
- Melhor desempenho em CPU-bound.  
- Menor custo de comunicação que `child_process` (compartilham memória).  

### Concorrência x Paralelismo
- **Concorrência**: várias tarefas alternadas, criando ilusão de paralelismo.  
- **Paralelismo**: múltiplas tarefas **simultâneas**, usando vários núcleos.

### Exemplo

**encrypt-worker.ts**
- Escuta mensagens (`user`).  
- Criptografa `user.password` (SHA-256).  
- Retorna via `postMessage`.  

**index.ts**
- Lê `legacy_users.ndjson`.  
- Usa workers para criptografar linhas.  
- Escreve em `encrypted_users.ndjson`.  

Principais componentes:
1. `readline.createInterface` → lê linha a linha.  
2. `new Worker(...)` → instancia thread.  
3. `encryptWithWorker(item)` → envia ao worker, espera resposta e resolve Promise.

Comunicação:
- `parentPort`: canal bidirecional.  
- `worker.on('message', cb)` → recebe mensagens.  
- `worker.on('error', cb)` → captura erros.

---

## 🔹 Child Processes

### `spawn.ts`
- Executa script Python como processo filho.  
- Comunicação via streams (`stdin`, `stdout`).  

Fluxo:
1. Node lê `users.ndjson`.  
2. Envia cada linha ao Python via `stdin`.  
3. Python processa e devolve via `stdout`.  
4. Node grava em `validate-users.ndjson`.  

Vantagens:
- Execução paralela ao Node.  
- Troca de dados em tempo real.  
- Node controla fluxo (entrada, saída).

---

## 🔹 Child Processes de Forma Eficiente

### `background-task.ts`
- Recebe dados (via processo filho).  
- Insere em tabela `ValidatedUser`.  
- Retorna resposta ao processo principal.

### `cluster.ts`
Gerencia **múltiplos processos filhos** para paralelismo.

#### `initializeCluster`
Objetivo: criar e gerenciar workers.  

Parâmetros:  
- `backgroundTaskFile`: arquivo a executar.  
- `clusterSize`: número de processos.  
- `onMessage`: callback para mensagens.  

Como funciona:  
- Cria `Map` de workers.  
- Para cada worker: cria com `fork`, adiciona ao `Map`, define eventos (`exit`, `error`, `message`).  
- Atualiza array round-robin para uso cíclico.  
- Retorna objeto com:
  - `getProcess`: pega próximo worker.  
  - `killAll`: encerra todos.  

Observações:  
- `fork` cria processo Node e canal IPC automático.  
- Comunicação com `.send()` e `process.on("message")`.  
- `getProcess()` retorna `ChildProcess`:
  - `.killed` → booleano.  
  - `.send()` → envia mensagem.

#### `initialize`
- Usa `initializeCluster`.  
- Fornece:
  - `sendToChild`: envia tarefas (round-robin).  
  - `killAll`: encerra todos.

### Round Robin
- Algoritmo de distribuição cíclica.  
- Garante uso equilibrado de workers.

---

## 🔹 Inserção de Dados

### `insert-data.ts`
- Lê `users.ndjson`.  
- Processa com cluster de workers.  

### Main
1. Garante tabela no DB.  
2. Inicializa cluster.  
3. Lê arquivo linha por linha.  
4. Envia usuários para workers.  
5. Exibe total lido.  
6. Em erro, encerra todos os workers.  
