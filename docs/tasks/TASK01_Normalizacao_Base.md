# Task 01: Normalização e Limpeza de String

## Objetivo
Garantir que o motor de busca receba apenas caracteres "puros", eliminando variações de digitação irrelevantes.

## Critérios de Aceite
1. **Lower Case:** Converter toda a query para letras minúsculas.
2. **Sanitização:** Remover caracteres especiais, acentuação e cedilha.
   - Ex: "Caminhão" -> "caminhao"
3. **Trim:** Remover espaços extras no início, no fim e espaços duplos entre palavras.

## Exemplo de Saída
- Entrada: "  Sofa de Algodão  "
- Saída: "sofa de algodao"