# Task 02: Remoção de Stop Words e Adjetivos Subjetivos

## Objetivo
Limpar a query removendo palavras que não definem o produto, focando no que é técnico.

## Requisitos
1. **Stop Words:** Criar uma lista (array) de preposições, artigos e conjunções (a, o, de, para, com, um, uma).
2. **Adjetivos Subjetivos:** Criar uma lista de termos "vazios" (bonito, barato, melhor, incrivel, top, bunitinha).
3. **Lógica:** Se a palavra da query estiver em uma dessas listas, ela deve ser ignorada na busca.

## Exemplo de Saída
- Entrada: "maquina de lavar barata"
- Saída: ["maquina", "lavar"]