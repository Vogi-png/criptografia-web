using System;
using System.Collections.Generic;

namespace Criptografia.Services
{
    public class Feistel
    {
        // Uma S-Box (Caixa de Substituição) simples, embaralhada aleatoriamente.
        // Na vida real, usa-se matemática complexa, mas esta atende ao requisito de substituição.
        private readonly byte[] SBox = new byte[256] {
            99, 124, 119, 123, 242, 107, 111, 197, 48, 1, 103, 43, 254, 215, 171, 118,
            202, 130, 201, 125, 250, 89, 71, 240, 173, 212, 162, 141, 156, 250, 11, 60,
            // (Para simplificar o código de estudo, repetimos a tabela, mas ela cria a confusão necessária)
            99, 124, 119, 123, 242, 107, 111, 197, 48, 1, 103, 43, 254, 215, 171, 118,
            202, 130, 201, 125, 250, 89, 71, 240, 173, 212, 162, 141, 156, 250, 11, 60,
            99, 124, 119, 123, 242, 107, 111, 197, 48, 1, 103, 43, 254, 215, 171, 118,
            202, 130, 201, 125, 250, 89, 71, 240, 173, 212, 162, 141, 156, 250, 11, 60,
            99, 124, 119, 123, 242, 107, 111, 197, 48, 1, 103, 43, 254, 215, 171, 118,
            202, 130, 201, 125, 250, 89, 71, 240, 173, 212, 162, 141, 156, 250, 11, 60,
            99, 124, 119, 123, 242, 107, 111, 197, 48, 1, 103, 43, 254, 215, 171, 118,
            202, 130, 201, 125, 250, 89, 71, 240, 173, 212, 162, 141, 156, 250, 11, 60,
            99, 124, 119, 123, 242, 107, 111, 197, 48, 1, 103, 43, 254, 215, 171, 118,
            202, 130, 201, 125, 250, 89, 71, 240, 173, 212, 162, 141, 156, 250, 11, 60,
            99, 124, 119, 123, 242, 107, 111, 197, 48, 1, 103, 43, 254, 215, 171, 118,
            202, 130, 201, 125, 250, 89, 71, 240, 173, 212, 162, 141, 156, 250, 11, 60,
            99, 124, 119, 123, 242, 107, 111, 197, 48, 1, 103, 43, 254, 215, 171, 118,
            202, 130, 201, 125, 250, 89, 71, 240, 173, 212, 162, 141, 156, 250, 11, 60
        };

        // GERAÇÃO DE SUBCHAVES (Derivação)
        private byte[][] GerarSubchaves(byte[] chaveMestre, int numRodadas)
        {
            byte[][] subchaves = new byte[numRodadas][];
            // Transforma os 4 bytes em um número de 32 bits
            uint chave32 = BitConverter.ToUInt32(chaveMestre, 0); 

            for (int i = 0; i < numRodadas; i++)
            {
                // Rotaciona os bits para criar uma chave diferente por rodada
                chave32 = (chave32 << 3) | (chave32 >> 29);
                subchaves[i] = BitConverter.GetBytes(chave32);
            }
            return subchaves;
        }

        // FUNÇÃO DE RODADA (F) - Executa Substituição e Permutação
        private byte[] FuncaoF(byte[] metadeDireita, byte[] subchave)
        {
            // 1. Substituição dependente de chave (S-Box + XOR)
            // O XOR com a subchave garante que a substituição mude dependendo da senha
            byte sub1 = SBox[metadeDireita[0] ^ subchave[0]];
            byte sub2 = SBox[metadeDireita[1] ^ subchave[1]];

            // 2. Permutação dependente de chave
            // Juntamos os 2 bytes em um bloco de 16 bits
            ushort combinado = (ushort)((sub1 << 8) | sub2);
            
            // A quantidade de rotação é decidida pela subchave (dependente de chave)
            int rotacoes = subchave[2] % 16; 
            
            // Rotaciona os bits (Permutação)
            ushort permutado = (ushort)((combinado << rotacoes) | (combinado >> (16 - rotacoes)));

            // Separa de volta em 2 bytes e retorna
            return new byte[] { (byte)(permutado >> 8), (byte)(permutado & 0xFF) };
        }

        // MÉTODO PRINCIPAL
        public byte[] Processar(byte[] dados, byte[] chave, bool descriptografar)
        {
            List<byte> resultado = new List<byte>();
            int numRodadas = 3; // Requisito: Pelo menos 3 rodadas
            
            // Deriva 3 subchaves diferentes de 32 bits
            byte[][] subchaves = GerarSubchaves(chave, numRodadas);

            // Requisito: Tamanho do bloco = 32 bits (4 bytes)
            for (int i = 0; i < dados.Length; i += 4)
            {
                byte L1 = dados[i];
                byte L2 = (i + 1 < dados.Length) ? dados[i + 1] : (byte)0;
                byte R1 = (i + 2 < dados.Length) ? dados[i + 2] : (byte)0;
                byte R2 = (i + 3 < dados.Length) ? dados[i + 3] : (byte)0;

                byte[] L = new byte[] { L1, L2 };
                byte[] R = new byte[] { R1, R2 };

                // Aplica as 3 rodadas
                for (int rodada = 0; rodada < numRodadas; rodada++)
                {
                    // Se for descriptografar, usamos as chaves de trás pra frente
                    int indiceChave = descriptografar ? (numRodadas - 1 - rodada) : rodada;
                    byte[] subchaveAtual = subchaves[indiceChave];

                    // Aplica a Função F na metade direita
                    byte[] fRes = FuncaoF(R, subchaveAtual);

                    // XOR da esquerda com o resultado de F
                    byte[] novoR = new byte[] { (byte)(L[0] ^ fRes[0]), (byte)(L[1] ^ fRes[1]) };
                    
                    // Swap (A antiga direita vira a nova esquerda)
                    byte[] novoL = R;

                    L = novoL;
                    R = novoR;
                }

                // Desfazemos o último Swap para padronizar a saída
                resultado.Add(R[0]);
                resultado.Add(R[1]);
                resultado.Add(L[0]);
                resultado.Add(L[1]);
            }

            return resultado.ToArray();
        }
    }
}
