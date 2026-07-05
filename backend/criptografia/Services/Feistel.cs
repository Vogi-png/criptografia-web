using System;
using System.Collections.Generic;

namespace Criptografia.Services {

    // Serviço que implementa um algoritmo de criptografia Feistel simples
    public class Feistel {

        // Número de rodadas da rede de Feistel
        private const int NumRodadas = 32;

        // Gera as subchaves usadas em cada rodada da Feistel
        private uint[] GerarSubchaves(byte[] chaveMestre, int numRodadas) {

            uint[] subchaves = new uint[numRodadas];
            uint chave32 = BitConverter.ToUInt32(chaveMestre, 0);

            for (int i = 0; i < numRodadas; i++) {

                // Mistura a chave com uma constante e a gira para criar uma subchave distinta.
                chave32 = RotacionarEsquerda(chave32, 5);
                chave32 ^= (0x9E3779B9u + (uint)i * 0x85EBCA6Bu);
                chave32 ^= chave32 >> 11;
                chave32 = RotacionarEsquerda(chave32, 7);
                chave32 ^= (uint)(i + 1) * 0xA5A5A5A5u;
                subchaves[i] = chave32;
            }
            return subchaves;
        }

        // Função F da rede de Feistel: aplica substituição e permutação dependentes da subchave.
        private ushort FuncaoF(ushort metadeDireita, uint subchave) {

            byte[] bytes = BitConverter.GetBytes(metadeDireita);
            byte[] saida = new byte[2];

            for (int i = 0; i < 2; i++) {

                // Mistura a metade direita com partes da subchave
                byte valor = (byte)(bytes[i] ^ (subchave >> (i * 8) & 0xFF));
                valor = (byte)(valor + (byte)((subchave >> (((i + 1) % 4) * 8)) & 0xFF));
                valor = (byte)((valor << 3) | (valor >> 5));
                valor ^= (byte)((subchave >> (16 + (i * 4))) & 0x0F);
                saida[i] = valor;
            }

            ushort combinado = BitConverter.ToUInt16(saida, 0);

            // Faz uma permutação simples com rotação
            int rotacoes = (int)(subchave & 0x7u) + 1;
            ushort permutado = (ushort)((combinado << rotacoes) | (combinado >> (16 - rotacoes)));

            return (ushort)(permutado ^ (ushort)(subchave >> 16));
        }

        // Método principal usado para criptografar e descriptografar arquivos.
        public byte[] Processar(byte[] dados, byte[] chave, bool descriptografar) {

            if (chave.Length < 4) throw new ArgumentException("ERRO: A chave deve ter pelo menos 4 bytes para formar 32 bits.");

            // Quando criptografar, aplica padding para deixar o tamanho múltiplo de 4 bytes
            byte[] dadosParaProcessar = descriptografar ? dados : AplicarPadding(dados);
            List<byte> resultado = new List<byte>(dadosParaProcessar.Length);
            uint[] subchaves = GerarSubchaves(chave, NumRodadas);

            // Cada bloco tem 32 bits (4 bytes) e é dividido em duas metades de 16 bits.
            for (int i = 0; i < dadosParaProcessar.Length; i += 4) {

                byte[] bloco = new byte[4];
                Buffer.BlockCopy(dadosParaProcessar, i, bloco, 0, 4);

                uint bloco32 = BitConverter.ToUInt32(bloco, 0);
                ushort esquerdo = (ushort)(bloco32 >> 16);
                ushort direito = (ushort)(bloco32 & 0xFFFF);

                // Aplica as rodadas da rede de Feistel.
                for (int rodada = 0; rodada < NumRodadas; rodada++) {

                    int indiceChave = descriptografar ? (NumRodadas - 1 - rodada) : rodada;
                    uint subchaveAtual = subchaves[indiceChave];

                    ushort fRes = FuncaoF(direito, subchaveAtual);
                    ushort novoDireito = (ushort)(esquerdo ^ fRes);
                    ushort novoEsquerdo = direito;

                    esquerdo = novoEsquerdo;
                    direito = novoDireito;
                }

                // Junta as metades novamente para formar o bloco processado
                uint blocoProcessado = ((uint)direito << 16) | esquerdo;
                byte[] blocoSaida = BitConverter.GetBytes(blocoProcessado);
                resultado.AddRange(blocoSaida);
            }

            // Converte a lista de bytes para array e remove o padding se estiver descriptografando.
            byte[] bytesProcessados = resultado.ToArray();
            if (descriptografar) {
                bytesProcessados = RemoverPadding(bytesProcessados);
            }
            return bytesProcessados;
        }

        // Adiciona zeros para deixar o tamanho múltiplo de 4 bytes
        private byte[] AplicarPadding(byte[] dados) {

            int resto = dados.Length % 4;
            if (resto == 0)
                return dados;

            byte[] comPadding = new byte[dados.Length + (4 - resto)];
            Buffer.BlockCopy(dados, 0, comPadding, 0, dados.Length);
            return comPadding;
        }

        // Remove zeros adicionados pelo padding após descriptografar
        private byte[] RemoverPadding(byte[] dados) {

            int tamanhoReal = dados.Length;
            while (tamanhoReal > 0 && dados[tamanhoReal - 1] == 0) {
                tamanhoReal--;
            }

            byte[] semPadding = new byte[tamanhoReal];
            Buffer.BlockCopy(dados, 0, semPadding, 0, tamanhoReal);
            return semPadding;
        }

        // Rotação à esquerda de 32 bits
        private static uint RotacionarEsquerda(uint valor, int qtd) {
            return (valor << qtd) | (valor >> (32 - qtd));
        }
    }
}