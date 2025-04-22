# _key kounter 5000_

> **_Track your typing. Feel the rhythm. Rule the keyboard._**

<div align="center">
  <img src="./assets/icon.png" alt="logo" style="max-height:300px; border-radius:18px; box-shadow:0 4px 24px rgba(0,0,0,0.18);margin-bottom: 20px;" />
</div>

**KEY KOUNTER 5000** é um app desktop cross-platform (macOS, Windows, Linux) que monitora suas teclas pressionadas globalmente, em tempo real. Ideal para produtividade, performance de digitação, ou simplesmente por estilo.

Utilizando a framework [**Electron**](https://www.electronjs.org/), o app é desenvolvido em HTML, CSS e JavaScript puros.

# Funcionalidades Principais 🤖

- ⌨️ **Keylogger local** com registro de teclas e timestamps
- 📈 **Dashboard de estatísticas** com:

  - KPM (Keystrokes per Minute) ao vivo
  - Teclas mais pressionadas
  - Média de intervalos de digitação
  - Tempo ocioso e atividade média
  - Categorização de perfil de usuário

- 🔊 **Modo musical retrô**: toca synthwave enquanto você digita
- 🧠 **Modo visual**: teclas aparecem piscando aleatoriamente na tela, como um código neon

# Estética ⚡️

O _**key kounter 5000**_ se inspira no visual futurista dos anos 80, com cores vibrantes, fontes monospace retrô e um modo dark padrão.

# Instalação 🚀

## Windows 🔵

Baixe o `key-kounter-5000-win32-x64-{versão}.zip` na página de releases, extraia e execute o `.exe`.

## macOS (Apple Silicon & Intel) 🍎

Baixe o `.dmg` ou escolha o `.zip` de acordo com sua arquitetura. Estão disponíveis:

- `key-kounter-5000-darwin-arm64-{versão}.zip`
- `key-kounter-5000-darwin-x64-{versão}.zip`

## Linux 🐧

Baixe o `key-kounter-5000-linux-x64-{versão}.zip`, extraia e rode o executável.

# Arquitetura 🧩

- **Frontend**: HTML/CSS/JS vanilla com Chart.js

- **Electron**: Comunicação segura via preload + contextBridge

- **Módulo de captura global de teclas**: [node-global-key-listener](https://www.npmjs.com/package/node-global-key-listener)

# Desenvolvimento 🛠️

### Pré-requisitos

- [Node.js](https://nodejs.org/en/download) 18+
- npm

### Instale as dependências

```
npm install
```

### Rode o app em dev mode

```
npm run dev
```

### Build para produção 📦

```
npm run make
```

# Contribuindo 🤝

Contribuições são muito bem-vindas! Fique à vontade para abrir issues, PRs ou sugerir ideias novas.

> _**Keep counting. Keep coding. key kounter 5000.**_
