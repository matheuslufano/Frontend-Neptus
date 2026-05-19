import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const source = resolve("env/.env.local");
const target = resolve(".env.local");

if (existsSync(source)) {
  copyFileSync(source, target);
  console.log("Variaveis de ambiente sincronizadas de env/.env.local para .env.local.");
} else {
  console.warn("Arquivo env/.env.local nao encontrado. Copie env/.env.example e preencha as variaveis.");
}
