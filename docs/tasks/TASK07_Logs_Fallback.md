# Task 07: Tratamento de Erros e Melhoria Contínua

## Objetivo
Evitar a página de "Nenhum resultado encontrado" e aprender com os erros.

## Requisitos
1. **Did you mean? (Levenshtein):** Se a busca der zero resultados, calcular distância de caracteres para sugerir o termo correto (ex: "geladera" -> "geladeira").
2. **Vitrine de Fallback:** Se nada funcionar, exibir os produtos mais vendidos da loja.
3. **Logging:** Salvar em um log todos os termos que retornaram 0 resultados para análise humana posterior.