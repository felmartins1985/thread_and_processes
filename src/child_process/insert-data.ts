import { createReadStream } from "fs";
import {cpus} from "node:os"
import readline from "readline"
import {initialize} from "./cluster";
import {sequelize, validateOrCreateTable} from "../db/connection"
import ValidatedUser from "../db/validated-users.model";
import cliProgress from 'cli-progress'
const inputFilePath = "./data/validate-users.ndjson";
const CLUSTER_SIZE = 8;
const INIT_TIMEOUT = 8000;

async function main() {
    try{
        await validateOrCreateTable(sequelize,ValidatedUser);
        let totalLines=0;
        let processedLines=0;
        const progressBar = new cliProgress.SingleBar(
            {
                format:
                "Progress [{bar}] {percentage}% | {value}/{total} records | {duration_formatted}",
                clearOnComplete: true,
            },
            cliProgress.Presets.shades_classic
        );
        const cp = initialize({
            backgroundTaskFile: "./src/child_process/background-task.ts",
            clusterSize: CLUSTER_SIZE,
            onMessage: ()=>{
                processedLines++;
                progressBar.update(processedLines);
                if(processedLines >= totalLines){
                    progressBar.stop();
                    cp.killAll();
                    console.log(`Total de registros processados: ${processedLines}`)
                }
            }
        })
        console.log(`Esperando ${INIT_TIMEOUT/1000} segundos para iniciar os clusters`)
        await new Promise(resolve => setTimeout(resolve, INIT_TIMEOUT));
        console.log("lendo o arquivo NDJSON");
        const readStream = createReadStream(inputFilePath);
        const rl = readline.createInterface({input: readStream});
        rl.on("line", (line) => {
            totalLines++;
            const user = JSON.parse(line);
            cp.sendToChild({user});
        })
        rl.on("close", () => {
            progressBar.start(totalLines, processedLines);
            console.log(`Total de linhas lidas: ${totalLines}`)
        })
        rl.on("error", (error) => {
            console.error("Erro ao ler o arquivo NDJSON:", error)
            cp.killAll();
            process.exit(1);
        })
    }catch(error){
        console.error("Erro ao executar o script", error);
        process.exit(1);
    }
}
main();

// npx ts-node src/child_process/insert-data.ts