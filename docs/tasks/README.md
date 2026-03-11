# Tasks V2 — Motor de Busca Inteligente

Backlog de implementação baseado no PRD (`docs/PRD-v2.md`).

| Task | Arquivo | Escopo | Camada |
|---|---|---|---|
| **TASK 01** | `TASK01_Normalizacao_Base.md` | Lower case, remoção de acentos/cedilha, trim e espaços duplos | Backend — `queryPipeline.js` |
| **TASK 02** | `TASK02_Filtro_Semantico.md` | Remoção de stop words e adjetivos subjetivos | Backend — `queryPipeline.js` |
| **TASK 03** | `TASK03_Flexionamento.md` | Stemming simples: plural/singular e variações de gênero | Backend — `queryPipeline.js` |
| **TASK 04** | `TASK04_Sinonimos.md` | Dicionário de sinônimos JSON + expansão da query | Backend — `synonyms.json` + `queryPipeline.js` |
| **TASK 05** | `TASK05_Ranking_Disponibilidade.md` | Scoring: estoque (100) + título (50) + categoria (30) + vendas (10) | Backend — `productRepository.js` |
| **TASK 06** | `TASK06_Autocomplete.md` | Sugestões após 3 chars via endpoint dedicado | Backend + Frontend |
| **TASK 07** | `TASK07_Logs_Fallback.md` | Did you mean? (Levenshtein) + vitrine fallback + log zero-results | Backend + Frontend |

## Dependências entre Tasks

```
TASK01 (Normalização)
  └── TASK02 (Stop Words)        ← depende de TASK01
        └── TASK03 (Stemming)    ← depende de TASK01 + TASK02
              └── TASK04 (Sinônimos) ← depende do pipeline completo
                    └── TASK05 (Ranking) ← depende de TASK01-04
                          ├── TASK06 (Autocomplete) ← depende de TASK05
                          └── TASK07 (Logs/Fallback) ← depende de TASK05
```

## Arquivos Novos Previstos

```
backend/src/
├── services/
│   └── queryPipeline.js     ← TASK01 + 02 + 03 + 04
├── config/
│   └── synonyms.json        ← TASK04
└── repositories/
    └── logRepository.js     ← TASK07
```
