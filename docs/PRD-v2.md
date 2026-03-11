# PRD: Motor de Busca Inteligente (Simple & Sharp)

## 1. Visão Geral
**Objetivo:** Construir um motor de busca para e-commerce com 99,99% de assertividade, focando na intenção de compra do usuário e eliminando ruídos semânticos por meio de regras claras e manutenção simplificada.

---

## 2. Pilares de Processamento da Query
Para garantir a precisão, toda busca realizada pelo usuário deve passar por três camadas de tratamento antes de atingir o banco de dados.

### A. Limpeza e Normalização (Remoção de Ruído)
O sistema deve isolar o "núcleo" da busca, ignorando termos irrelevantes.
* **Stop Words:** Remover artigos (o, a), preposições (de, para) e conjunções (e, ou).
* **Adjetivos Subjetivos:** Ignorar termos como "bonito", "barato", "melhor", "incrível", "top".
* **Normalização:** Converter todos os caracteres para minúsculo e remover acentuação/cedilha (ex: "Caminhão" → "caminhao").

### B. Flexionamento (Gênero e Número)
Tratar variações gramaticais para que não segmentem o resultado indevidamente.
* **Plural/Singular:** "Cadeiras" deve retornar os mesmos resultados que "Cadeira".
* **Gênero:** "Boneco" e "Boneca" devem ser tratados conforme a categoria, mas neutralizados na busca por radical quando aplicável.

### C. Dicionário de Sinônimos (Array Associativo)
Mapeamento de termos equivalentes para evitar o erro de "Produto não encontrado" quando o item existe com outro nome.
* **Exemplo de Array:**
    * `["máquina de lavar", "lava roupas", "lavadora"]`
    * `["tv", "televisao", "smart tv", "televisor"]`
    * `["geladeira", "refrigerador"]`

---

## 3. Regras de Negócio e Ranqueamento (Relevância)
A ordem dos produtos deve seguir critérios lógicos de conversão.

| Prioridade | Critério | Regra de Aplicação |
| :--- | :--- | :--- |
| **1 (Crítica)** | **Disponibilidade** | Produtos em estoque (In Stock) aparecem primeiro. |
| **2 (Alta)** | **Match de Título** | Termo buscado encontrado no Nome do Produto. |
| **3 (Alta)** | **Categoria** | Se buscar "Nike", priorizar Calçados sobre Acessórios. |
| **4 (Média)** | **Popularidade** | Produtos com maior taxa de conversão (vendas/cliques). |

---

## 4. Experiência do Usuário (UX Search)
Estratégias para manter o usuário no funil de vendas mesmo em casos de erro.

* **Autocomplete Ativo:** Sugerir termos e categorias enquanto o usuário digita (mínimo 3 caracteres).
* **Tratamento de Erro (Did you mean?):** Se a busca não retornar resultados, aplicar algoritmo de *Levenshtein Distance* para sugerir o termo correto (ex: "Ipone" → "Você quis dizer iPhone?").
* **Fallback (Vitrine de Saída):** Caso não haja match mesmo após as correções, exibir "Produtos mais buscados" em vez de uma página em branco.

---

## 5. Requisitos Não Funcionais
* **Latência:** Tempo de resposta da busca < 200ms.
* **Logs de Erro:** Sistema deve logar termos buscados com "Zero Resultados" para atualização quinzenal do dicionário de sinônimos.
* **Escalabilidade:** Capacidade de processar múltiplas queries simultâneas sem perda de performance.

---

## 6. Exemplo de Processamento Final
**Input do Usuário:** *"Quero ver uma geladeira de 110v barata"*

1.  **Limpeza:** `geladeira 110v` (Removeu: quero, ver, uma, de, barata).
2.  **Sinônimo:** `refrigerador 110v`.
3.  **Resultado:** Exibe refrigeradores 110v em estoque, ordenados pelos mais vendidos.