import {parentPort} from 'worker_threads'
import crypto from 'crypto'

parentPort?.on('message',(user) => {
    let encryptedPassword = user.password;
    encryptedPassword = crypto.createHash('sha256').update(encryptedPassword).digest('hex');
    parentPort?.postMessage({
        ...user,
        password: encryptedPassword
    })
});

// npx ts-node-dev src/workers/index.ts