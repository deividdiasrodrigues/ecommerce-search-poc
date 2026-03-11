# Task 05: Ordenação e Relevância (Ranking)

## Objetivo
Definir qual produto aparece no topo da lista.

## Regras de Peso (Scoring)
1. **Estoque (Peso 100):** Se `estoque > 0`, ganha prioridade máxima.
2. **Match de Título (Peso 50):** Termo exato no nome do produto.
3. **Match de Categoria (Peso 30):** Se a palavra buscada for o nome de uma categoria.
4. **Vendas (Peso 10):** Ordenar por produtos mais vendidos (best sellers) em caso de empate.

## Critério de Exclusão
- Produtos inativos ou descontinuados não devem ser indexados.