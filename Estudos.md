# Estudos Node.js: Streams, Event Loop, Generators, Threads e Processos

* Stream:
new Readable({ ... })
Ele cria uma stream legível personalizada, ou seja, um objeto que pode fornecer dados para quem quiser "ler" (como o for await...of no código principal)

objectMode: true
Streams no Node.js por padrão funcionam com buffers de dados binários ou strings.
Mas como aqui queremos trabalhar com objetos JavaScript (os usuários gerados), precisamos ativar o modo objeto.
O que isso faz?
Permite que o this.push() receba objetos JS como { name: 'Felipe', company: 'X' }, e não apenas strings ou buffers.
É obrigatório quando se trabalha com dados estruturados, como JSON, objetos, etc.

read()
Esse é o método obrigatório que você precisa implementar ao criar uma Readable personalizada.

Quando e por que usar isso?
Esse tipo de stream é útil quando:
Você quer gerar dados sob demanda, não tudo de uma vez (economiza memória).
Vai trabalhar com um volume muito grande de dados (ex: milhões de registros).
Quer controlar o fluxo de inserção com segurança.

* Loop de eventos no Node.js:
Nos bastidores, o Node.js roda no V8 Engine, o mesmo motor que permite a execução do JavaScript em navegadores como o Chrome. O V8 traduz o código JavaScript para C++, que é então transpilado e compilado. Quando uma função é executada, o V8 processa o código por meio de uma API do Node e o coloca em uma fila. Essa fila é consumida pelo event loop, um componente do V8 responsável por gerenciar a execução de eventos.
Além do V8, o Node utiliza a Libuv, uma biblioteca escrita em C e C++ que lida com chamadas ao sistema operacional, como leitura e escrita de arquivos. Quando o event loop encontra uma tarefa que pode rodar em segundo plano, ele a delega para a thread pool, rompendo o fluxo single-thread. Enquanto o event loop continua processando novos eventos, a thread pool executa essas operações em paralelo.
Processando tarefas assíncronas no event loop
Vamos entender como o loop de eventos lida com algumas operações. Temos entradas de evento, como solicitações HTTP e leitura. Ele enfileira isso em uma fila específica, que pode ser de microtasks ou macrotasks. Depois, ocorre a execução assíncrona, quando o loop escuta os callbacks já executados e os traz de volta para nossa aplicação. O loop continua processando o próximo evento, funcionando como um loop infinito enquanto nossa aplicação está rodando.
Assim, é dito que o Node.js é single-threaded pois algumas de suas partes essenciais - entre elas o loop de eventos - trabalha de forma single thread. Porém, partes do processamento de um programa podem ser trabalhadas de forma multi-thread pela libuv, utilizando a thread pool, além de métodos em C++ que podem ser delegados ao sistema operacional para o processamento adicional de tarefas mais complexas.

* * em um método:
O * na função indica que esta é uma função geradora (generator function) em JavaScript/TypeScript:A função não retorna um valor diretamente, mas sim um gerador que pode produzir múltiplos valores ao longo do tempo.
Permite usar yield: Dentro da função, você pode usar a palavra-chave yield para "produzir" valores um de cada vez, pausando a execução da função entre cada yield.
Execução sob demanda: Os valores são gerados conforme necessário (lazy evaluation), não todos de uma vez na memória.

Vantagens desta abordagem:

Eficiência de memória: Em vez de carregar todos os usuários do banco na memória de uma vez, você processa 100 por vez
Streaming: Os dados podem ser processados conforme são lidos do banco
Escalabilidade: Funciona mesmo com milhões de registros no banco

* tópicos avançados
Vamos entender como funcionam as threads e processos, tanto no sistema operacional quanto em aplicações Node.js.
O que são processos?
Processos são instâncias ou unidades de um programa em execução, contendo todo o código e seu estado.
Processos possuem um espaço de memória próprio e recursos próprios, como alocação de CPU, alocação de memória e manipuladores de arquivos.
Cada processo tem um identificador único chamado PID (Process Identifier), que o identifica no sistema.

O que são threads?
Já as threads são uma unidade de execução menor do que um processo.

Todas as threads dentro de um mesmo processo compartilham um espaço de memória e recursos próprios.

Além disso, executam de forma independente, mas podem se comunicar diretamente. Enquanto a comunicação entre processos é mais complexa, as threads têm maior facilidade em se comunicar por estarem dentro do mesmo processo.

As threads possuem contador de programa, pilha de execução e registradores próprios.

Em um processo single thread, ele tem seu próprio segmento de código, segmento de dados, heap, pilha e registradores. Isso representa uma unidade maior.

Quando falamos de multiprocessamento e multithread, o processo mantém os mesmos segmentos de código e dados e heap, mas cada thread tem sua própria pilha e registradores. Assim, as threads conseguem se comunicar entre si de forma mais fácil - do que um processo inteiro se comunicar com outro processo.

Worker threads
As worker threads servem para lidar com tarefas intensivas de CPU.

O Node.js introduziu essa funcionalidade desde a versão 10 para facilitar a criação de threads e lidar com tarefas intensivas de CPU, como cálculos complexos ou criptografia de dados.

Elas funcionam com um pool de threads gerenciado pela biblioteca Libuv. Isso permite criar threads separadas dentro do mesmo processo para executar código JavaScript paralelo ao loop de eventos. Dessa forma, cada thread terá seu próprio loop de eventos e seu próprio espaço de memória.

Quais são as vantagens de usar worker threads? Elas permitem execuções paralelas dentro de um processo, melhoram o desempenho em tarefas de CPU intensiva e têm um menor custo de comunicação do que o child process, pois compartilham memória.

As worker threads operam em modo de concorrência, enquanto o child process é mais voltado para o paralelismo. Qual é a diferença entre concorrência e paralelismo?

Na concorrência, várias tarefas são executadas alternadamente, mas não simultaneamente, criando a ilusão de paralelismo. Por exemplo, suponha que temos três tarefas. Quando estamos no modelo de concorrência, a tarefa 1 é iniciada, executa-se um pouco dela, passa para a tarefa 2, começa a executá-la também, passa para a tarefa 3, e assim alternamos entre essas tarefas até concluí-las.

Já no paralelismo verdadeiro, múltiplas tarefas são processadas ao mesmo tempo por diferentes núcleos ou processos.

* worker threads

--- Conceito
O módulo worker_threads do Node.js permite criar threads (ou "subprocessos") para executar tarefas em paralelo, fora do event loop principal. Isso é útil para processamentos pesados (como criptografia, compressão, parsing, etc.), pois o Node.js por padrão é single-threaded — ou seja, só consegue processar uma coisa por vez no loop principal.

--- Quando usar
Você deve considerar worker_threads quando:

- Há operações CPU-intensivas que travariam seu servidor se executadas no thread principal.

- Você precisa paralelizar execuções pesadas para ganhar desempenho.

- Deseja dividir tarefas em diferentes "funcionários" (workers), como se fosse uma "linha de produção".

**Enctrypt-worker.ts**

- Escuta mensagens com dados (user) vindos do arquivo principal.

- Criptografa a senha (user.password) com SHA-256.

- Devolve o novo objeto com a senha criptografada via postMessage.

**index.ts**

Esse arquivo:

- Lê um arquivo NDJSON (legacy_users.ndjson) linha por linha.

- Usa um worker para processar cada linha (criptografar a senha).

- Escreve o resultado criptografado em outro arquivo (encrypted_users.ndjson).

- Componentes principais:
a) readline.createInterface lê o arquivo linha por linha.

b) new Worker(...) instancia um worker thread para processar em paralelo.

c)encryptWithWorker(item):

c.1)Envia o item ao worker.

c.2)Escuta a resposta com a versão criptografada do item.

c.3) Resolve a Promise com a linha pronta para ser escrita.
--- O parentPort é o canal de comunicação bidirecional que permite que o Worker Thread receba tarefas do processo principal e envie os resultados processados de volta, possibilitando o processamento paralelo sem bloquear a thread principal.

- worker.on()

Quando você cria um Worker com new Worker(...), você está instanciando uma thread separada que se comunica com o script principal por meio de eventos. O .on(...) funciona de forma semelhante ao EventEmitter do Node.js, ou seja:

a)worker.on('message', callback) → Escuta quando a thread envia uma mensagem com postMessage(...)

b) worker.on('error', callback) → Escuta erros que acontecerem na execução do worker

* child Processes

**spawn.ts**
- spawn: O spawn no código TS é usado para executar o script Python como um processo filho e fazer comunicação com ele via streams (entrada e saída padrão).
-- Esse processo é independente, mas conectado ao processo Node.js através de pipes:

a.1) stdin → entrada do Python (onde o Node pode enviar dados)
a.2) stdout → saída do Python (onde o Node lê os resultados)

--> O Node pega cada linha do arquivo users.ndjson (um JSON por linha) e envia para o Python.
Cada write() no stdin é como se digitasse algo no console do Python.
Quando o Node termina de ler o arquivo, ele avisa ao Python que não vai mandar mais dados.
--> Tudo o que o Python imprimir com print() vai para o stdout, e o Node grava no validate-users.ndjson.
--> Quando o Python finaliza, o Node fecha o arquivo de saída e mostra se deu certo (code === 0) ou erro.

* O spwan está sendo usado para:

Rodar o Python de forma paralela ao Node.

Trocar dados em tempo real usando streams, sem precisar salvar arquivos intermediários.

Permitir que o Node atue como controlador do fluxo (lendo input, enviando para Python e salvando output).


* child processes de forma eficiente

**background-tastk.ts**
O método no arquivo background-task.ts é responsável por receber dados de usuários (via processo filho), inserir esses dados na tabela ValidatedUser do banco de dados e enviar uma resposta de volta ao processo principal.

**cluster.ts**
O arquivo cluster.ts normalmente é responsável por gerenciar múltiplos processos filhos (workers) para executar tarefas em paralelo, aproveitando melhor o poder de processamento do computador.
*initializeCluster*
Objetivo: Cria e gerencia múltiplos processos filhos (workers) para executar tarefas em paralelo.
Parâmetros:
    backgroundTaskFile: caminho do arquivo que o worker irá executar (ex: background-task.ts).
    clusterSize: quantidade de processos filhos a serem criados.
    onMessage: função callback chamada quando um worker envia uma mensagem de volta.

Como funciona:
    Cria um Map chamado processes para armazenar os workers.
    Para cada worker (até clusterSize):
        Cria um processo filho com fork.
        Adiciona o processo ao Map.
        Define handlers para eventos:
            exit: remove o processo do Map se ele terminar.
            error: exibe erro e encerra o processo principal.
            message: chama o callback onMessage ao receber mensagem do worker.
        Atualiza o array usado pelo round-robin para garantir que os workers sejam usados ciclicamente.
    Cria uma função getProcess usando round-robin para sempre retornar o próximo worker disponível.
    Retorna um objeto com:
        getProcess: função para pegar o próximo worker.
        killAll: função para matar todos os workers.

OBSERVAÇÕES:
    a- O fork do módulo child_process no Node.js cria um novo processo Node que executa um arquivo JS específico.
        a.1- fork já cria um canal de comunicação IPC (pai ↔ filho) automaticamente.
        a.2- isso permite usar child.send(...) e process.on("message", ...) para trocar dados em formato serializado (JSON).
    b- getProcess é a função retornada pelo roundRobin([...processes.values()])
        b.1- Ao chamar getProcess(), você recebe um objeto ChildProcess (do Node).
        b.2- Esse ChildProcess:
            b.2.1- Tem o campo .killed → booleano que indica se o processo já foi encerrado.
            b.2.2 - Tem o método .send(message) → para mandar mensagens para o processo filho via IPC.
*initialize*
Objetivo: Fornece uma interface simplificada para enviar tarefas aos workers e encerrar todos eles.
Parâmetros:
    Os mesmos de initializeCluster.

Como funciona:
    Chama initializeCluster e obtém getProcess e killAll.
    Define a função sendToChild, que:
        Usa getProcess() para pegar o próximo worker (ciclo round-robin).
        Envia a tarefa (por exemplo, um usuário) para o worker, se ele estiver ativo.
    Retorna um objeto com:
        sendToChild: para enviar tarefas aos workers.
        killAll: para encerrar todos os workers.

*roundRobin*
O algoritmo Round Robin é uma técnica amplamente utilizada em computação para distribuir tarefas ou recursos de forma equilibrada entre vários participantes.
Ele é um algoritmo de escalonamento ou distribuição que funciona de forma cíclica, percorre uma lista de elementos (como processos, tarefas ou servidores) em ordem sequencial, garantindo que cada elemento receba uma "fatia" de tempo ou recursos antes de passar para o próximo.

**insert-data.ts**
O arquivo insert-data.ts lê um arquivo NDJSON (um JSON por linha) contendo usuários, e processa cada linha usando um cluster de processos filhos para paralelizar o trabalho.

*main*:

Garante que a tabela do banco de dados existe.
Inicializa o cluster de processos filhos, passando o arquivo de tarefa e um callback para cada mensagem recebida (indicando que uma linha foi processada).
Aguarda alguns segundos para garantir que os clusters estejam prontos.
Lê o arquivo NDJSON linha por linha:
    Para cada linha, incrementa o contador e envia o usuário para um processo filho processar.
Ao terminar de ler, exibe o total de linhas lidas.
Em caso de erro na leitura, encerra todos os processos filhos e finaliza o script.
