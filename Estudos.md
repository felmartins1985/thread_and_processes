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
- Quando o event loop encontra uma tarefa que pode rodar em segundo plano, delega à **thread pool**, rompendo o fluxo single-thread.  
- Enquanto isso, o loop continua processando novos eventos.

### Processamento de tarefas assíncronas
- Entradas: HTTP, leitura de arquivos etc.  
- O loop enfileira isso em uma fila específica, que pode ser de microtasks ou macrotasks.  
- Execução assíncrona: o loop escuta os callbacks já executados e os traz de volta para nossa aplicação.  
- O loop continua processando o próximo evento, funcionando como um loop infinito enquanto nossa aplicação está rodando.

⚡ Node.js é **single-threaded** no event loop, mas partes do processamento podem ser **multi-threaded** via libuv (thread pool) e métodos C++ delegados ao SO.

---

## 🔹 Generator Functions (`*`)

O `*` na função indica que é uma **função geradora** (generator function) em JavaScript/TypeScript.

Características:
- Não retorna valor diretamente, mas um **gerador** que produz múltiplos valores ao longo do tempo.  
- Usa `yield` para "produzir" valores, pausando entre execuções.  
- Geração sob demanda (**lazy evaluation**), não todos de uma vez na memória.  

### Vantagens
- Eficiência de memória (processa lotes, ex.: 100 registros por vez).  
- Streaming: processa dados conforme leitura.  
- Escalável para milhões de registros.

---

## 🔹 Tópicos Avançados: Threads e Processos

### Processos
- Unidade de um programa em execução, com código e estado.  
- Processos possuem um espaço de memória próprio e recursos próprios, como alocação de CPU, alocação de memória e manipuladores de arquivos.  
- Identificado por um **PID** (Process Identifier), que o identifica no sistema.  

### Threads
- Unidade de execução menor que um processo.  
- Compartilham memória e recursos do processo.  
- Executam independentemente,mas podem se comunicar diretamente. Enquanto a comunicação entre processos é mais complexa, as threads têm maior facilidade em se comunicar por estarem dentro do mesmo processo.  
- Cada thread tem seu próprio segmento de código, segmento de dados, heap, pilha e registradores.  

📌 No multiprocessamento/multithread:
- O processo mantém segmentos de código, dados e heap.  
- Cada thread tem sua pilha e registradores.  
- Comunicação entre threads é mais simples que entre processos.

---

## 🔹 Worker Threads

### Conceito
- O módulo worker_threads do Node.js permite criar threads (ou "subprocessos") para executar tarefas em paralelo, fora do event loop principal. Isso é útil para processamentos pesados (como criptografia, compressão, parsing, etc.), pois o Node.js por padrão é single-threaded — ou seja, só consegue processar uma coisa por vez no loop principal.
- Introduzidas no Node.js v10.  
- Lidam com tarefas **CPU-intensivas** (criptografia, cálculos complexos etc.).  
- Funcionam em **pool de threads** gerenciado pelo Libuv. Isso permite criar threads separadas dentro do mesmo processo para executar código JavaScript paralelo ao loop de eventos.  
- Cada worker tem seu **event loop** e memória própria.

### Vantagens
- Execuções paralelas dentro do processo.  
- Melhoram o desempenho em tarefas de CPU intensiva.  
- Menor custo de comunicação que `child_process` (compartilham memória).  

### Concorrência x Paralelismo
- **Concorrência**: várias tarefas alternadas, mas não simultaneamente, criando ilusão de paralelismo. Por exemplo, suponha que temos três tarefas. Quando estamos no modelo de concorrência, a tarefa 1 é iniciada, executa-se um pouco dela, passa para a tarefa 2, começa a executá-la também, passa para a tarefa 3, e assim alternamos entre essas tarefas até concluí-las.
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
    1. Envia o item ao worker
    2. Escuta a resposta com a versão criptografada do item
    3. Resolve a Promise com a linha pronta para ser escrita

Comunicação:
- `parentPort`: canal bidirecional.Resolve a Promise com a linha pronta para ser escrita. O parentPort é o canal de comunicação bidirecional que permite que o Worker Thread receba tarefas do processo principal e envie os resultados processados de volta, possibilitando o processamento paralelo sem bloquear a thread principal.
- `worker.on()`→ Quando você cria um Worker com new Worker(...), você está instanciando uma thread separada que se comunica com o script principal por meio de eventos. O .on(...) funciona de forma semelhante ao EventEmitter do Node.js, ou seja
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
5. O Node pega cada linha do arquivo users.ndjson (um JSON por linha) e envia para o Python. Cada write() no stdin é como se digitasse algo no console do Python.
6. Tudo o que o Python imprimir com print() vai para o stdout, e o Node grava no validate-users.ndjson.
7. Quando o Python finaliza, o Node fecha o arquivo de saída e mostra se deu certo (code === 0) ou erro.
9. O spwan está sendo usado para: Rodar o Python de forma paralela ao Node; Trocar dados em tempo real usando streams, sem precisar salvar arquivos intermediários; Permitir que o Node atue como controlador do fluxo (lendo input, enviando para Python e salvando output).

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
Gerencia **múltiplos processos filhos** (workers) para executar tarefas em paralelo, aproveitando melhor o poder de processamento do computador.

#### `initializeCluster`
Objetivo: criar e gerenciar workers para executar tarefas em paralelo.  

Parâmetros:  
- `backgroundTaskFile`: arquivo a executar.  
- `clusterSize`: número de processos filhos a serem cridos.  
- `onMessage`: callback para mensagens.  

Como funciona:  
- Cria `Map` chamado processes para armazenar os workers.  
- Para cada worker: cria com `fork`, adiciona ao `Map`, define eventos (`exit`, `error`, `message`).
- exit: remove o processo do Map se ele terminar.
- error: exibe erro e encerra o processo principal.
- message: chama o callback onMessage ao receber mensagem do worker.
- Atualiza array round-robin para uso cíclico.
- Cria uma função getProcess usando round-robin para sempre retornar o próximo worker disponível.
- Retorna objeto com:
  - `getProcess`: pega próximo worker.  
  - `killAll`: encerra todos.  

Observações:  
- O  `fork` do módulo child_process no Node.js cria um novo processo Node que executa um arquivo JS específico. O forj ja cria um canal de comunicação IPC (pai ↔ filho) automaticamente.
- Comunicação com `.send()` e `process.on("message")` para trocar dados em formato serializado (JSON).  
- `getProcess()` retorna `ChildProcess`: é a função retornada pelo roundRobin([...processes.values()])
  - `.killed` → booleano que indica se o processo já foi encerrado.  
  - `.send()` → para mandar mensagens para o processo filho via IPC.

#### `initialize`
- Usa `initializeCluster`.  
- Fornece uma interface simplificada para enviar tarefas aos workers e encerrar todos eles.
- Como funciona:
  - Chama initializeCluster e obtém getProcess e killAll.
  - Define a função sendToChild, que:
    - Usa getProcess() para pegar o próximo worker (ciclo round-robin).
    - Envia a tarefa (por exemplo, um usuário) para o worker, se ele estiver ativo.
  -Retorna um objeto com:
    -`sendToChild`: para enviar tarefas aos workers.
    -`killAll`: para encerrar todos os workers.

### Round Robin
- O algoritmo Round Robin é uma técnica amplamente utilizada em computação para distribuir tarefas ou recursos de forma equilibrada entre vários participantes.
- Ele é um algoritmo de escalonamento ou distribuição que funciona de forma cíclica, percorre uma lista de elementos (como processos, tarefas ou servidores) em ordem sequencial, garantindo que cada elemento receba uma "fatia" de tempo ou recursos antes de passar para o próximo.

---

## 🔹 Inserção de Dados

### `insert-data.ts`
- Lê `users.ndjson`.  
- Processa cada linha usando um cluster de processos filhos para paralelizar o trabalho.  

### Main
1. Garante tabela no DB.  
2. Inicializa cluster de processos filhos, passando o arquivo de tarefa e um callback para cada mensagem recebida (indicando que uma linha foi processada).  
3. Lê arquivo linha por linha: Para cada linha, incrementa o contador e envia o usuário para um processo filho processar.
4. Exibe total lido.  
5. Em erro, encerra todos os workers.  
