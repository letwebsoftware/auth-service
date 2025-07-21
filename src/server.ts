import { buildFastifyApp } from ".";
import { Config } from "./config";

const app = buildFastifyApp();

app.listen({ port: Config().get().appPort, host: "0.0.0.0" }, (err, address) => {
  if (err) throw err;
  console.log(`Server running at ${address}`);
});