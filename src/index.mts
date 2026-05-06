import Bun from 'bun'; // eslint-disable-line @typescript-eslint/naming-convention
import process from 'node:process';
import { app } from './app.mts';
import { env } from './config/env.mts';
import { connectDB, disconnectDB } from './config/prisma-client.mts';
import { serverConfig } from './config/server.mts';
import { container } from './container.mts';
import { banner } from './logger/banner.mts';

const { NODE_ENV } = env;
if (NODE_ENV === 'development' || NODE_ENV === 'test') {
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
}

const { fetch } = app;
const { port, portHttp, key, cert } = serverConfig;

await container.dbPopulateService.populate();
await connectDB();

Bun.serve({ port: portHttp, fetch });
Bun.serve({
    port,
    fetch,
    tls: {
        key,
        cert,
    },
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
await banner();

// https://bun.com/docs/guides/process/os-signals
// KEINE asynchrone Funktion
process.on('SIGINT', () => {
    // IIFE  = Immediately Invoked Function Expression
    // IIAFE = Immediately Invoked Asynchronous Function Expression
    (async () => {
        await disconnectDB();
    })();

    console.log('Der Server wird heruntergefahren.');
});
