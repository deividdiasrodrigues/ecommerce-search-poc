# Task 04: Implementação do Array de Sinônimos

## Objetivo
Conectar termos populares aos termos técnicos cadastrados no banco.

## Requisitos
1. **Estrutura:** Criar um arquivo de configuração (JSON ou Tabela) de chaves e valores.
2. **Mapeamento Inicial:**
   - `lava roupa, lavadora, maquina de lavar` -> `lavadora de roupas`
   - `geladeira, refrigerador` -> `refrigerador`
   - `tv, televisao, smart tv` -> `smart tv`
3. **Lógica:** Antes da consulta ao banco, substituir o termo da query pelo termo "âncora" do dicionário.