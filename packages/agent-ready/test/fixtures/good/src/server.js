import { createServer } from "node:http";

const port = Number(process.env.PORT ?? 3000);

createServer((_req, res) => res.end("ok")).listen(port);
