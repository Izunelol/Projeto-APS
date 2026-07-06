# Demonstração: Leitura de QR Code pela Câmera do Celular

> Guia passo a passo para demonstrar o SmartLab rodando no computador e no celular ao
> mesmo tempo, com o celular escaneando via câmera o QR Code de um ponto exibido na tela
> do computador.

---

## 1. Por que não basta acessar pelo IP da rede local

O navegador só libera acesso à câmera (`getUserMedia`) em um **contexto seguro**:
`https://` ou `localhost`. Um endereço como `http://192.168.0.10:3000` acessado pelo
celular na mesma Wi-Fi **não conta como seguro** e o navegador bloqueia a câmera.

Além disso, se o frontend estiver em HTTPS e o backend continuar em HTTP, as chamadas
`fetch` do frontend para o backend também são bloqueadas (mixed content).

Por isso, a forma mais simples de demonstrar em qualquer rede (Wi-Fi ou dados móveis do
celular) é expor **dois túneis HTTPS temporários** — um para o frontend (`:3000`) e um
para o backend (`:8080`) — usando o **Cloudflare Tunnel** (`cloudflared`). É gratuito,
não exige conta/cartão e permite rodar os dois túneis ao mesmo tempo (diferente do plano
free do ngrok, que só permite 1 túnel simultâneo por conta).

---

## 2. Pré-requisitos

- Backend rodando localmente na porta `8080` (via `mvnw` ou pela IDE).
- Frontend rodando localmente na porta `3000` (`npm run dev`).
- `cloudflared` instalado no computador que vai apresentar a demonstração.

### Instalar o `cloudflared` (Windows)

Com `winget`:

```powershell
winget install --id Cloudflare.cloudflared
```

Ou baixe o executável diretamente em:
`https://github.com/cloudflare/cloudflared/releases` (arquivo `cloudflared-windows-amd64.exe`).

Confirme a instalação:

```powershell
cloudflared --version
```

---

## 3. Subir o backend e o frontend localmente

Em dois terminais separados, a partir da raiz do projeto:

```powershell
# Terminal 1 — Backend
cd backend
./mvnw spring-boot:run
```

```powershell
# Terminal 2 — Frontend
cd frontend
npm run dev
```

Confirme que `http://localhost:8080/swagger-ui.html` e `http://localhost:3000` abrem
normalmente no computador antes de seguir.

---

## 4. Abrir os dois túneis HTTPS

Em mais dois terminais:

```powershell
# Terminal 3 — túnel do backend
cloudflared tunnel --url http://localhost:8080
```

```powershell
# Terminal 4 — túnel do frontend
cloudflared tunnel --url http://localhost:3000
```

Cada comando imprime uma URL do tipo:

```
https://algo-aleatorio-1.trycloudflare.com   -> backend
https://algo-aleatorio-2.trycloudflare.com   -> frontend
```

Guarde as duas URLs. Elas mudam a cada execução — se reiniciar o túnel, repita os
próximos passos com a nova URL.

---

## 5. Apontar o frontend para o backend via túnel

Crie (ou edite) o arquivo `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=https://algo-aleatorio-1.trycloudflare.com
```

> `NEXT_PUBLIC_API_URL` é embutida no build ao iniciar o servidor — **reinicie** o
> `npm run dev` (Terminal 2) depois de salvar o `.env.local` para o valor novo ser
> aplicado.

Esse arquivo é local e não deve ser commitado (confirme que `.env.local` está no
`.gitignore` do frontend).

---

## 6. Liberar o CORS do backend para a URL do túnel do frontend

O backend lê as origens permitidas da variável `CORS_ALLOWED_ORIGINS` (ver
`backend/src/main/resources/application.yml`), aceitando múltiplas origens separadas
por vírgula.

Antes de subir o backend (Terminal 1), defina a variável incluindo a URL do túnel do
frontend, mantendo o `localhost` para continuar testando também pelo computador:

```powershell
$env:CORS_ALLOWED_ORIGINS = "http://localhost:3000,https://algo-aleatorio-2.trycloudflare.com"
cd backend
./mvnw spring-boot:run
```

---

## 7. Testar no celular

1. No celular, conecte-se a qualquer rede (Wi-Fi ou dados móveis — não precisa ser a
   mesma rede do computador).
2. Abra no navegador a URL HTTPS do **frontend** (a do Terminal 4).
3. Cloudflare pode mostrar uma tela de aviso na primeira visita — é só prosseguir.
4. Faça login normalmente.
5. Na tela inicial (Painel), toque em **"Usar câmera para escanear"**.
6. Aceite a permissão de câmera quando o navegador pedir.

---

## 8. Roteiro sugerido para a demonstração

1. No computador, abra a ficha de um ponto de inspeção já cadastrado (`/pontos/{codigo}`)
   e clique em **"Gerar QR Code"** para exibi-lo na tela.
2. No celular (já com a câmera aberta via "Usar câmera para escanear"), aponte para o
   QR Code exibido no monitor do computador.
3. O celular deve reconhecer o código automaticamente e navegar direto para a ficha
   daquele ponto, confirmando a leitura em tempo real.
4. Opcional: a partir da ficha do ponto aberta no celular, registre uma nova inspeção
   para mostrar o fluxo completo de campo funcionando no aparelho móvel.

---

## 9. Encerrando a demonstração

Depois de terminar, feche os dois terminais dos túneis (`Ctrl+C`) — as URLs do
`trycloudflare.com` são efêmeras e param de responder assim que o processo é encerrado.
Não é necessário nenhum tipo de limpeza adicional (nenhuma conta foi criada, nada foi
publicado de forma permanente).
