# Task 08: Correção Ortográfica por Similaridade (Fuzzy Matching)

## Objetivo
Garantir que o usuário encontre produtos mesmo quando digita o termo com erros ortográficos ou variações de escrita.

## Requisitos
1. **Algoritmo:** Implementar correção baseada em Distância de Levenshtein entre o termo digitado e o dicionário de termos conhecidos do catálogo.
2. **Dicionário:** Construir automaticamente a partir de duas fontes:
   - Títulos dos produtos cadastrados no banco.
   - Aliases e âncoras do dicionário de sinônimos (TASK04).
3. **Regras Conservadoras:** Aplicar correção apenas quando:
   - O token tiver no mínimo 4 caracteres (tokens curtos como "tv" não são corrigidos).
   - A distância de edição for ≤ 2 (máximo de 2 inserções, deleções ou substituições).
   - O candidato começar com a mesma letra do token digitado (reduz falsos positivos).
4. **Posição no Pipeline:** Executar após o Stemming (TASK03) e antes da Expansão de Sinônimos (TASK04), para que o termo corrigido passe pela expansão normalmente.
5. **Word Boundary para Tokens Curtos:** Tokens de até 3 caracteres (ex: "mx", "tv") devem usar match com delimitador de palavra no SQL — `CONCAT(' ', coluna, ' ') LIKE '% token %'` — para evitar falsos positivos como "ZoomX" ao buscar "mx".

## Exemplos de Saída
| Entrada | Correção | Motivo |
|---|---|---|
| `ipone` | `iphone` | distância 1 (falta o 'h') |
| `samsug` | `samsung` | distância 1 (falta o 'n') |
| `notbook` | `notebook` | distância 1 (falta o 'e') |
| `headfone` | `headphone` | distância 2 |
| `galaxi` | `galaxy` | distância 1 |
| `iphone` | `iphone` | sem alteração (já correto) |
| `tv` | `tv` | sem alteração (token curto) |
| `xyz` | `xyz` | sem alteração (sem candidato próximo) |

## Arquivos Implementados
- `backend/src/services/fuzzyCorrector.js` — lógica de Levenshtein e correção por token
- `backend/src/config/knownTerms.js` — dicionário construído em runtime
- `backend/src/services/queryPipeline.js` — etapa `correctSpelling()` adicionada ao pipeline
- `backend/src/repositories/productRepository.js` — word-boundary via CONCAT para tokens curtos
- `backend/src/tests/fuzzyCorrector.test.js` — 20 testes unitários
