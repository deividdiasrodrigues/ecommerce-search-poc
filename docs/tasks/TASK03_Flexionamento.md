# Task 03: Tratamento de Plural e Gênero (Stemming Simples)

## Objetivo
Garantir que o usuário ache "Cadeira" buscando por "Cadeiras".

## Requisitos
1. **Regra de Plural:** Remover "s", "es" ou "is" ao final das palavras (aplicar lógica de radical).
2. **Regra de Gênero:** Em categorias neutras, normalizar terminações "o/a".
3. **Nota:** Se o sistema usar um banco de dados como Elasticsearch, configurar o "Stemmer" para Português.

## Exemplo
- "Tenis Pretos" -> "tenis preto"
- "Almofadas" -> "almofada"