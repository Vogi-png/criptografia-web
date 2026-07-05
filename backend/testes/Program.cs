using System;
using System.Linq;
using Criptografia.Services;

// Limpa a tela do console para ver os resultados mais claros
Console.Clear();

// Cria a instância do algoritmo Feistel
var feistel = new Feistel();

// Chave usada nos testes, precisa ter pelo menos 4 bytes | Pode ser alterada para testes.
var chave = System.Text.Encoding.UTF8.GetBytes("45tu894e5tgujerd9itgrd90tyr");

// Função de teste que compara duas entradas e conta os bits diferentes nas saídas
static (byte[] out1, byte[] out2, int bitsDiferentes) ExecutarTeste(byte[] dados1, byte[] dados2, Feistel feistel, byte[] chave) {

    // Processa as duas entradas e obtém os bytes de saída
    var out1 = feistel.Processar(dados1, chave, false);
    var out2 = feistel.Processar(dados2, chave, false);

    // Conta quantos bits mudam entre as duas saídas, essencial para verificar o efeito avalanche.
    int diferencasBits = out1.Zip(out2, (a, b) => {
        int dif = 0;
        for (int bit = 0; bit < 8; bit++) {
            if (((a >> bit) & 1) != ((b >> bit) & 1)) dif++;
        }
        return dif;
    }).Sum();

    return (out1, out2, diferencasBits);
}

// Define cenários para testar o efeito avalanche no algoritmo
var cenarios = new (string Nome, byte[] Dados1, byte[] Dados2)[] {

    ("Alterando 1 bit no primeiro byte.", System.Text.Encoding.UTF8.GetBytes("AAAA"), AlterarBit(System.Text.Encoding.UTF8.GetBytes("AAAA"), 0, 0)),
    ("Alterando 1 bit no segundo byte.", System.Text.Encoding.UTF8.GetBytes("BBBB"), AlterarBit(System.Text.Encoding.UTF8.GetBytes("BBBB"), 1, 0)),
    ("Alterando 1 bit no terceiro byte.", System.Text.Encoding.UTF8.GetBytes("CCCC"), AlterarBit(System.Text.Encoding.UTF8.GetBytes("CCCC"), 2, 0)),
    ("Alterando 1 bit no quarto byte.", System.Text.Encoding.UTF8.GetBytes("DDDD"), AlterarBit(System.Text.Encoding.UTF8.GetBytes("DDDD"), 3, 0)),
    ("Alterando 1 bit no meio do bloco.", System.Text.Encoding.UTF8.GetBytes("1234"), AlterarBit(System.Text.Encoding.UTF8.GetBytes("1234"), 2, 4))
};


// Exibe os resultados dos testes de efeito avalanche.
for (int i = 0; i < cenarios.Length; i++) {
    var (nome, dados1, dados2) = cenarios[i];
    var (out1, out2, bitsDiferentes) = ExecutarTeste(dados1, dados2, feistel, chave);

    Console.WriteLine($"Teste {i + 1}: {nome}");
    Console.WriteLine("Entrada 1 = " + BitConverter.ToString(dados1));
    Console.WriteLine("Entrada 2 = " + BitConverter.ToString(dados2));
    Console.WriteLine("Saída 1 = " + BitConverter.ToString(out1));
    Console.WriteLine("Saída 2 = " + BitConverter.ToString(out2));
    Console.WriteLine($"Bits diferentes = {bitsDiferentes}");
    Console.WriteLine();
}

// Teste de descriptografia para verificar a integridade do processo.
Console.WriteLine("Descriptografia:");

// Texto original sem criptografia.
Console.Write("Digite o texto a ser testado:");
var textoTeste = Console.ReadLine()!;
var original = System.Text.Encoding.UTF8.GetBytes(textoTeste);

// Texto Cifrado
var cifrado = feistel.Processar(original, chave, false);

// Texto Decifrado
var decriptado = feistel.Processar(cifrado, chave, true);

// Original x Cifrado x Decifrado
Console.WriteLine("Original: " + System.Text.Encoding.UTF8.GetString(original));
Console.WriteLine("Cifrado: " + BitConverter.ToString(cifrado));
Console.WriteLine("Decifrado: " + System.Text.Encoding.UTF8.GetString(decriptado));
if (System.Text.Encoding.UTF8.GetString(original) == System.Text.Encoding.UTF8.GetString(decriptado)) {
    Console.WriteLine("Descriptografia bem-sucedida.");
} 
else Console.WriteLine("Falha na descriptografia.");
Console.WriteLine();

// Função auxiliar para alterar um bit específico em um array de bytes.
static byte[] AlterarBit(byte[] dados, int indiceByte, int indiceBit) {
    var copia = (byte[])dados.Clone();
    copia[indiceByte] ^= (byte)(1 << indiceBit);
    return copia;
}
