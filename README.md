# 🔐 Criptografia Web - Rede de Feistel

Este repositório contém o projeto completo da matéria de Criptografia/Segurança de Sistemas.

O projeto possui:

- **Back-End** em **.NET 10**, responsável pela API e pela lógica de criptografia.
- **Front-End** em **HTML, CSS e JavaScript**, responsável pela interface usada para enviar arquivos e baixar o resultado.

A criptografia foi implementada manualmente utilizando uma **Rede de Feistel**, com funções de criptografia e descriptografia de arquivos.

---

## 🛠️ O que você vai precisar baixar

Para rodar este projeto, garanta que sua máquina tenha os seguintes itens instalados:

1. **SDK do .NET 10**
   É o motor que faz o C# funcionar.
   - [Baixar aqui](https://dotnet.microsoft.com/pt-br/download)
   *(Certifique-se de baixar a versão compatível com seu sistema).*

2. **Visual Studio Code (VS Code)**
   Editor de código recomendado para abrir e editar o projeto.

3. **Extensão: C# Dev Kit**
   - No VS Code, vá em extensões (`Ctrl + Shift + X`) e procure por **"C# Dev Kit"**.
   - Essencial para o reconhecimento do projeto .NET.

---

## 📂 Estrutura do Projeto

O repositório está organizado da seguinte forma:

```txt
criptografia-web/
├── backend/
│   ├── Controllers/
│   ├── Services/
│   ├── Program.cs
│   ├── Criptografia.csproj
│   └── appsettings.json
│
├── frontend/
│   ├── index.html
│   └── assets/
│       ├── css/
│       └── js/
│
├── criptografia.sln
├── README.md
└── .gitignore
```

### `backend/`

Contém a API desenvolvida em .NET.

É dentro dela que ficam:

- As rotas da aplicação.
- A configuração do servidor.
- A lógica de criptografia.
- O algoritmo da Rede de Feistel.

### `frontend/`

Contém a interface visual do projeto.

É nela que o usuário consegue:

- Escolher entre criptografar ou descriptografar.
- Digitar a chave.
- Selecionar um arquivo.
- Enviar o arquivo para o backend.
- Baixar o resultado processado.

### `criptografia.sln`

Arquivo de solução do Visual Studio/.NET.

Ele aponta para o projeto do backend em:

```txt
backend/Criptografia.csproj
```

Esse arquivo ajuda a abrir e compilar o projeto pelo Visual Studio ou pelo terminal.

---

## 🚀 Preparando o Ambiente

Após baixar os arquivos do repositório ou clonar o projeto:

1. Abra a pasta do projeto no seu **VS Code**.
2. Abra o terminal:
   - Menu superior → **Terminal > New Terminal**
3. Entre na pasta do backend:

```bash
cd backend
```

4. Restaure as dependências do projeto:

```bash
dotnet restore
```

---

## 💻 Como Compilar e Rodar o Back-End

Com o terminal aberto dentro da pasta `backend`, execute:

```bash
dotnet run
```

Assim que o comando terminar de carregar, o backend ficará disponível em:

```txt
http://localhost:5073
```

Também é possível compilar o projeto pela solução, usando o comando abaixo na raiz do repositório:

```bash
dotnet build criptografia.sln
```

---

## 🌐 Como Usar o Front-End

Com o backend rodando, abra o arquivo:

```txt
frontend/index.html
```

O front-end já está configurado para se comunicar com a API em:

```txt
http://localhost:5073
```

Essa configuração fica no arquivo:

```txt
frontend/assets/js/config.js
```

---

## 🌐 Como Usar a API pelo Swagger

O Swagger já está configurado no backend para facilitar os testes da API.

Assim que o backend estiver rodando, abra o navegador e acesse:

```txt
http://localhost:5073/swagger
```

Pelo Swagger é possível testar:

- Upload de arquivos.
- Função de criptografia.
- Função de descriptografia.
- Retorno do arquivo processado.

---

## 🔁 Endpoint Principal

O endpoint principal da aplicação é:

```txt
POST /api/Cripto/processar
```

Ele recebe:

- `arquivo`: arquivo enviado pelo usuário.
- `chave`: senha usada no processo.
- `descriptografar`: indica se o arquivo será criptografado ou descriptografado.

Valores esperados para `descriptografar`:

- `false` → criptografar.
- `true` → descriptografar.

---

## 🔑 Atenção Sobre a Chave

O backend exige que a chave tenha pelo menos **4 caracteres**.

Para formar a chave usada no algoritmo, o sistema considera os **4 primeiros caracteres** digitados pelo usuário.

Por isso, para descriptografar um arquivo corretamente, é necessário usar a mesma chave utilizada na criptografia.

---

## 📂 Principais Arquivos do Back-End

### `Controllers/CriptoController.cs`

Gerencia a rota da API, recebe o arquivo enviado pelo front-end e devolve o arquivo processado.

### `Services/Feistel.cs`

Contém a lógica da Rede de Feistel, incluindo:

- Divisão dos blocos.
- Rodadas do algoritmo.
- S-Box.
- Permutação.
- Criptografia.
- Descriptografia.

### `Program.cs`

Configura o servidor, os controllers, o Swagger e o CORS para permitir a comunicação com o front-end.

---

## ⚠️ Atenção

Este projeto utiliza o **Target Framework `net10.0`**.

Se encontrar erros como:

```txt
SDK not found
```

verifique se possui a versão **10 do .NET** instalada corretamente.

Arquivos gerados automaticamente, como `bin/`, `obj/`, caches do Visual Studio e arquivos temporários, não devem ser enviados para o GitHub. Eles ficam ignorados pelo arquivo `.gitignore`.
