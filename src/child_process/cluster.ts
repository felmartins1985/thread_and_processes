import {fork} from "child_process";
import { on } from "events";
import { get } from "http";

function roundRobin(array: any, index=0){
    return function (){
        if(index>=array.length) index=0;
        return array[index++];
    }
}

function initializeCluster({backgroundTaskFile, clusterSize, onMessage}){
    const processes = new Map();
    const getNextProcess= roundRobin([])
    for (let i=0; i<clusterSize; i++){
        const child = fork(backgroundTaskFile);
        processes.set(child.pid, child);
        child.on("exit", () => {
            processes.delete(child.pid);
        });
        child.on("error", (error)=>{
            console.error(`Error no processo ${child.pid}`, error);
            process.exit(1)
        })
        child.on("message", (message)=>{
            onMessage(message);
        })
        // @ts-ignore
        getNextProcess.array=[...processes.values()];
    }

    const getProcess = roundRobin([...processes.values()]);
    return {
        getProcess,
        killAll: () =>{
            processes.forEach((child) => {
                child.kill();
            });
        }
    }
}

export function initialize({backgroundTaskFile, clusterSize, onMessage}){
    const {getProcess, killAll} = initializeCluster({backgroundTaskFile, clusterSize, onMessage});
    function sendToChild(person){
        const child = getProcess();
        if(child && !child.killed){
            child.send(person);
        }
    }
    return {
        sendToChild,
        killAll
    }
}