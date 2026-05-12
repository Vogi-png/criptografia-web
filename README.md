# 🔐 Criptografia Web - API de Criptografia (Rede de Feistel)

Este repositório contém o **Back-End** do nosso projeto de Segurança de Sistemas. Trata-se de uma API desenvolvida em **.NET 10** que utiliza uma implementação manual da **Rede de Feistel** para criptografar e descriptografar arquivos.

---

## 🛠️ O que você vai precisar baixar

Para rodar este projeto, garanta que sua máquina tenha os seguintes itens instalados:

1. **SDK do .NET 10.0.203**  
   É o motor que faz o C# funcionar.  
   - [Baixar aqui](https://dotnet.microsoft.com/en-us/learn/aspnet/blazor-tutorial/install)  
   *(Certifique-se de baixar a versão compatível com seu sistema).*

2. **Visual Studio Code (VS Code)**  
   Nosso editor de código recomendado.

3. **Extensão: C# Dev Kit**  
   - No VS Code, vá em extensões (`Ctrl + Shift + X`) e procure por **"C# Dev Kit"**.  
   - Essencial para o reconhecimento do projeto.

---

## 🚀 Preparando o Ambiente

Após baixar os arquivos do repositório ou clonar o projeto:

1. Abra a pasta do projeto no seu **VS Code**.
2. Abra o terminal:
   - Menu superior → **Terminal > New Terminal**
3. Verifique se você está na pasta onde reside o arquivo `.csproj`.
4. Digite o seguinte comando para restaurar as dependências e pacotes:

```bash
dotnet restore
```

---

## 💻 Como Compilar e Rodar o Programa

Com o terminal aberto na pasta do projeto, basta digitar:

```bash
dotnet run
```

---

## 🌐 Como usar (Swagger)

O Swagger já está configurado e embutido no código para facilitar os testes da API.

Assim que o comando `dotnet run` terminar de carregar, o terminal mostrará o link de execução (geralmente `http://localhost:5073`).

### Passos:

1. Abra o seu navegador.
2. Acesse:

```txt
http://localhost:5073/swagger
```

3. Utilize a interface para testar:
   - Upload de arquivos
   - Funções de criptografia
   - Funções de descriptografia

---

## 📂 Estrutura do Projeto (Para a Equipe)

### `Controllers/`
Gerenciamento das rotas e recebimento de arquivos.

### `Services/`
Lógica da Rede de Feistel, incluindo:
- S-Box
- Permutação
- Criptografia
- Descriptografia

### `Program.cs`
Configuração do servidor (**Kestrel**) e injeção de dependências.

---

## ⚠️ Atenção

Este projeto utiliza o **Target Framework `net10.0.203`**.
Se encontrar erros como:

```txt
SDK not found
```

verifique se possui a versão **10 do .NET** instalada corretamente.
