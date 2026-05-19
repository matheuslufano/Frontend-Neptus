# Imagem Docker

Existem 2 Dockerfiles:

- `BuildDockerfile`: cria uma imagem de build/producao.
- `Dockerfile`: imagem recomendada para desenvolvimento.

## Variaveis de ambiente

As variaveis do Docker ficam centralizadas na pasta `env/`.

Para preparar o ambiente:

```bash
cp env/docker.env.example env/docker.env
```

Preencha `env/docker.env` com os valores reais antes de subir os containers.

## Desenvolvimento local

A partir da pasta `docker/`, rode:

```bash
docker compose --env-file ../env/docker.env --profile dev up -d --build
```

Para rebuildar a imagem:

```bash
docker compose --env-file ../env/docker.env --profile dev up -d --build --force-recreate
```

Acesse: http://localhost:3000

Para parar:

```bash
docker compose --env-file ../env/docker.env --profile dev down
```

## Build de producao

A partir da pasta `docker/`, rode:

```bash
docker compose --env-file ../env/docker.env --profile build up -d --build
```

Para rebuildar a imagem:

```bash
docker compose --env-file ../env/docker.env --profile build up -d --build --force-recreate
```

Acesse: http://localhost ou https://localhost

Para parar:

```bash
docker compose --env-file ../env/docker.env --profile build down
```
