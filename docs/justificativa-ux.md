# Justificativa de UX — Plataforma SmartFarm

Este documento justifica cada afirmação do parágrafo de experiência do usuário escrito na monografia, mapeando cada conceito teórico a evidências concretas da implementação.

---

## O parágrafo

> A experiência do usuário foi orientada pelas heurísticas de Nielsen (1994), aplicadas em três frentes: a visibilidade do status do sistema por meio de indicadores semânticos redundantes como cor, rótulo e marcadores, classificando cada leitura como Ideal, Monitorar ou Atenção utilizando thresholds. Auxílio na recuperação de erros através de empty states contextualizados que diagnosticam a ausência de dados e sugerem a próxima ação. Complementarmente, a conformidade com a WCAG 2.1 AA utilizando atributos ARIA, foco visível e independência de cor, além da adoção de ícones semânticos e hierarquia de navegação alinhada ao modelo mental do produtor rural operacionalizam os princípios de Norman (2013) e Krug (2014), reduzindo a carga cognitiva.

---

## 1. Heurísticas de Nielsen (1994)

### O que são as heurísticas de Nielsen?

Jakob Nielsen é um dos maiores pesquisadores de usabilidade do mundo. Em 1994, ele publicou **10 heurísticas de usabilidade** — princípios gerais que servem como guias de boas práticas para o design de interfaces. Não são regras rígidas, mas diretrizes que, quando seguidas, reduzem erros, confusão e frustração do usuário.

A palavra "heurística" significa uma regra de bolso baseada em experiência acumulada — não um teorema matemático, mas um princípio que funciona na prática em uma grande variedade de situações.

Das 10 heurísticas de Nielsen, o parágrafo aplica diretamente três delas:

---

### Heurística 1 — Visibilidade do status do sistema

**O que é:** o sistema deve sempre manter o usuário informado sobre o que está acontecendo, fornecendo feedback adequado em tempo razoável.

Em outras palavras: o usuário nunca deve ficar se perguntando *"o que está acontecendo?"* ou *"está tudo bem?"*. A interface deve comunicar o estado atual de forma clara e constante.

**Como está implementado na plataforma:**

O sistema de thresholds classifica cada leitura de sensor em três estados semânticos: **Ideal**, **Monitorar** e **Atenção**. Cada estado usa três canais visuais simultâneos para comunicar a informação:

- **Cor**: verde para Ideal, amarelo-mostarda para Monitorar, terracota para Atenção
- **Rótulo textual**: as próprias palavras "Ideal", "Monitorar", "Atenção" em português
- **Marcador (dot)**: uma bolinha colorida que aparece ao lado do rótulo

O uso de três canais simultâneos — cor + texto + marcador — é chamado de **redundância sensorial**. Isso garante que a informação chegue mesmo se um dos canais falhar (por exemplo, um usuário daltônico pode não distinguir o vermelho do verde, mas ainda lê "Atenção" no rótulo e vê o formato do marcador).

Essa classificação aparece em:
- Cada card de leitura na página de detalhe do sensor
- O status geral do sensor na página de parâmetros
- Os marcadores no mapa interativo, onde cada pino exibe a cor do status mais crítico do sensor naquele momento
- O painel lateral do mapa, que lista os sensores com seus respectivos badges de status

---

### Heurística 9 — Ajudar usuários a reconhecer, diagnosticar e recuperar-se de erros

**O que é:** mensagens de erro devem ser expressas em linguagem simples (sem códigos de erro), descrever precisamente o problema e sugerir uma solução construtiva.

Nielsen estende este princípio para além de erros técnicos: qualquer situação em que o sistema não tem dados para exibir — seja por falha, seja por ausência legítima — deve ser tratada de forma que o usuário entenda *o que aconteceu* e *o que fazer a seguir*.

**Como está implementado na plataforma:**

A plataforma possui três variantes de **empty state** (tela de estado vazio), cada uma contextualizada para uma situação específica:

- **"Sem sensores cadastrados"** — aparece no mapa, nas páginas de parâmetros e na página de configurações quando o usuário ainda não configurou nenhum sensor. Inclui uma descrição orientando que a configuração é feita pelo aplicativo móvel.
- **"Sem dados neste período"** — aparece no gráfico de séries temporais quando o período selecionado não tem leituras registradas. Orienta o usuário a tentar um período maior ou aguardar novas leituras.
- **"Sem localização disponível"** — aparece no mapa quando nenhum sensor enviou coordenadas GPS ainda. Explica a causa de forma simples.

Em todos os casos, o componente segue a mesma estrutura: ícone contextual (Wifi para sensores, gráfico de linhas para dados, marcador de mapa para localização) + título curto + descrição explicativa. Nenhuma tela exibe apenas um espaço em branco ou uma mensagem genérica como "erro 404".

---

## 2. WCAG 2.1 AA — Acessibilidade

### O que é a WCAG?

**WCAG** (*Web Content Accessibility Guidelines*) é uma especificação publicada pelo W3C (consórcio que define os padrões da web) que estabelece critérios para tornar conteúdo web acessível a pessoas com deficiências — visuais, motoras, auditivas ou cognitivas.

A versão **2.1** foi publicada em 2018. Ela define três níveis de conformidade:
- **Nível A** — requisitos mínimos
- **Nível AA** — padrão adotado pela maioria das legislações e organizações
- **Nível AAA** — máximo nível de acessibilidade

O **nível AA** é o referenciado no parágrafo. Ele inclui critérios como contraste mínimo de cores, navegação por teclado, e comunicação de informações não apenas por cor.

### O que são atributos ARIA?

**ARIA** (*Accessible Rich Internet Applications*) é uma especificação complementar ao HTML que adiciona **metadados semânticos** para tecnologias assistivas como leitores de tela.

O problema que ARIA resolve: em React, componentes são construídos com `<div>` e `<span>` — elementos HTML sem semântica nativa. Um leitor de tela não sabe se aquela `<div>` é uma aba, um alerta ou um campo inválido. Os atributos ARIA comunicam isso explicitamente.

Existem três tipos de atributos ARIA:
- **role** — define o papel do elemento ("o que este elemento é"): `role="alert"`, `role="tab"`, `role="status"`
- **aria-* (estado)** — comunica em que estado o elemento está: `aria-selected`, `aria-invalid`, `aria-expanded`
- **aria-* (propriedade)** — fornece informações adicionais: `aria-label`, `aria-hidden`, `aria-describedby`

**Como está implementado na plataforma:**

A plataforma adota os seguintes padrões ARIA:

- **`role="alert"` no componente de alerta e nos helpers de erro de formulário** — quando um alerta ou mensagem de erro aparece na tela, o leitor de tela interrompe o que está lendo e anuncia o conteúdo imediatamente, sem que o usuário precise navegar até o elemento.
- **`role="tablist"` + `role="tab"` + `aria-selected` no seletor de período** — o componente de seleção de período (24h, 7 dias, 30 dias...) é marcado como uma lista de abas. O leitor de tela anuncia, por exemplo, *"7 dias, aba, selecionada, 3 de 6"*.
- **`role="status"` no overlay de carregamento** — quando a tela de carregamento aparece, o leitor de tela é notificado do estado de espera.
- **`aria-label` em botões que contêm apenas ícones** — botões como o sino de notificações, o X de fechar diálogo e o campo de e-mail da landing page recebem `aria-label` em português para que o leitor de tela saiba o que o botão faz.
- **`aria-invalid` em campos de formulário** — quando há erro de validação em um input ou textarea, o campo recebe `aria-invalid`, e o leitor de tela anuncia "campo inválido" ao focar nele.
- **`aria-hidden` em ícones decorativos** — ícones que aparecem ao lado de um rótulo textual (como o ícone de termômetro ao lado de "Temperatura do solo") são marcados com `aria-hidden`. Isso evita que o leitor de tela leia "imagem, termômetro, Temperatura do solo" — ele lê apenas "Temperatura do solo", sem repetição.
- **`aria-[current=page]` na navegação da sidebar** — o item ativo na sidebar recebe um atributo que indica "página atual", anunciado pelo leitor de tela durante a navegação.

### Foco visível — WCAG §2.4.7

**O que é:** todo elemento interativo (botão, link, campo) deve ter um indicador visual claro quando está focado via teclado.

Usuários que não usam mouse — seja por deficiência motora, seja por preferência — navegam com `Tab` e `Shift+Tab`. Sem um indicador de foco visível, eles não sabem onde estão na página.

**Como está implementado:** todos os elementos interativos da plataforma exibem um anel de foco em verde-folha (`leaf-100`) com espessura de 4px quando focados via teclado. Isso inclui botões, links da sidebar, campos de formulário, checkboxes, selects, toggles e ícone-botões. A cor verde-folha foi escolhida por ser a cor primária do sistema de design, garantindo consistência visual enquanto atende ao critério de contraste.

### Independência de cor — WCAG §1.4.1

**O que é:** informações não devem ser transmitidas **exclusivamente** por cor. Um usuário daltônico deve conseguir interpretar a interface mesmo sem distinguir as cores.

**Como está implementado:** a plataforma usa **redundância de cor** no sistema de status. Um sensor em estado de atenção não é comunicado apenas pela cor vermelha do marcador — ele também exibe o rótulo textual "Atenção" e uma bolinha (dot) ao lado do badge. Um usuário que não distingue vermelho de verde ainda interpreta o status pelo texto e pelo marcador visual.

---

## 3. Norman (2013) — *The Design of Everyday Things*

### Quem é Norman e o que ele defende?

Donald Norman é um psicólogo cognitivo e designer americano, ex-funcionário da Apple. Seu livro *The Design of Everyday Things* (publicado originalmente em 1988 e revisado em 2013) é considerado a obra fundadora do design centrado no usuário.

O argumento central de Norman é que **objetos mal projetados obrigam o usuário a aprender como usá-los, enquanto objetos bem projetados comunicam seu uso por si mesmos**. O problema, segundo ele, não é o usuário — é o design.

### Modelo mental do usuário

**O que é:** cada pessoa forma uma representação interna de como um sistema funciona, baseada em experiências anteriores com objetos do mundo real. Norman chama isso de **modelo mental**. Quando o design de um produto **corresponde ao modelo mental** do usuário, o uso é intuitivo. Quando contradiz, o usuário comete erros, se frustra e culpa a si mesmo — quando na verdade o culpado é o design.

**Como está implementado na plataforma:**

O produtor rural tem um modelo mental de como inspeciona sua lavoura:
1. Primeiro ele **vê o todo** — caminha pelo campo, observa a propriedade
2. Depois ele **examina pontos específicos** — mede um talhão, verifica uma planta
3. Por último ele **ajusta** — regula irrigação, calibra equipamento

A hierarquia de navegação da sidebar espelha exatamente esse fluxo:
1. **Mapa** — o todo: ver todos os sensores na propriedade
2. **Parâmetros** (Umidade, Temperatura, Luminosidade...) — os pontos específicos: examinar cada variável
3. **Configurações** — os ajustes: personalizar thresholds, renomear sensores

Isso não é uma escolha arbitrária de ordem. É o design correspondendo ao modelo mental do agricultor, de forma que a interface parece "natural" mesmo para quem nunca usou um dashboard antes.

### Affordance e signifier — ícones semânticos

**O que é:** Norman define *affordance* como a relação entre um objeto e o usuário que sugere como aquele objeto pode ser usado. Uma maçaneta redonda *afforda* girar. Um botão saliente *afforda* apertar. Em interfaces digitais, os principais affordances são visuais — chamados de *signifiers*: pistas visuais que comunicam o que um elemento faz.

**Como está implementado na plataforma:**

Os ícones da plataforma foram escolhidos por correspondência direta com o referente real:
- **Gota de água** (Droplets) para a seção de Umidade do Solo
- **Termômetro** para Temperatura do Solo e Temperatura do Ar
- **Nuvem com gota** para Umidade do Ar
- **Sol** para Luminosidade
- **Bateria** para o nível de carga do sensor

Um produtor rural que nunca usou um software de monitoramento reconhece uma gota como "água/umidade" e um termômetro como "temperatura" — essas são associações culturais consolidadas. Os ícones funcionam como *signifiers* que dispensam aprendizado: o usuário não precisa decorar o menu, apenas reconhecer o ícone.

---

## 4. Krug (2014) — *Don't Make Me Think*

### Quem é Krug e o que ele defende?

Steve Krug é consultor americano de usabilidade web. Seu livro *Don't Make Me Think* (3ª edição em 2014, publicado no Brasil como *Não Me Faça Pensar*) é o livro de usabilidade web mais vendido de todos os tempos, justamente por ser direto e prático.

A tese central do livro é uma única frase: **"Don't make me think"** — *Não me faça pensar*.

### O que significa "não me faça pensar"?

Krug observou que usuários não leem páginas web — eles as **escaneiam**. Não seguem sequências lógicas — clicam na primeira coisa que parece plausível. Não tomam decisões ótimas — tomam decisões *suficientes*.

Toda vez que um usuário precisa **parar e pensar** antes de agir — *"o que este botão faz?"*, *"o que é '7d'?"*, *"estou no lugar certo?"* — a interface falhou. Esse esforço mental desnecessário é chamado de **carga cognitiva**.

O objetivo do design, segundo Krug, é eliminar carga cognitiva de cada interação, tornando tudo auto-evidente.

**Como está implementado na plataforma:**

Cada decisão abaixo elimina um momento de hesitação:

- **Períodos por extenso** — o seletor de período usa "7 dias", "15 dias", "1 ano" em vez de abreviações como "7d", "15d", "1y". O agricultor não precisa pensar o que significa "7d".

- **Status em português claro** — os estados são "Ideal", "Monitorar", "Atenção" em vez de "OK", "WARN", "ALERT" ou símbolos técnicos. Não há ambiguidade.

- **Sidebar sempre visível com ícone + texto** — o usuário não precisa memorizar onde fica cada seção. Ela está sempre à esquerda, com ícone e rótulo, mesmo com a sidebar recolhida.

- **Empty states que explicam** — quando a tela não tem dados, o sistema não exibe um espaço em branco. Ele explica o que aconteceu em linguagem simples. O usuário não precisa pensar *"a tela quebrou?"* — ele lê *"Sem dados neste período. Tente um período maior."*

- **Copywriting sem jargão** — na landing page e em toda a interface, foram evitados termos como "dashboard", "threshold", "sync", "alert". Em seus lugares: "configurações", "limite de alerta", "atualizar", "atenção".

- **Hierarquia de landing page** — a página pública segue a sequência Problema → Solução → Como funciona → O que monitora → Preços → CTA. Cada seção responde a uma pergunta que o visitante tem naquele momento, sem exigir que ele navegue fora da ordem linear.

---

## 5. Ponto de atenção: o que ainda não foi validado

O parágrafo afirma que a hierarquia de navegação está *"alinhada ao modelo mental do produtor rural"*. É importante reconhecer que essa afirmação é uma **hipótese de design** — não uma conclusão de pesquisa com usuários.

Não foram conduzidos testes de usabilidade com agricultores reais, entrevistas de campo ou análise de tarefas formal no escopo deste TCC. A correspondência com o modelo mental do produtor foi inferida a partir do entendimento do domínio agrícola e dos princípios de Norman, não validada empiricamente.

**Se a banca perguntar:** *"Como vocês sabem que a hierarquia corresponde ao modelo mental do agricultor?"*

A resposta defensável é: *"Trata-se de uma hipótese de design fundamentada na lógica do fluxo de trabalho agrícola (inspeção → diagnóstico → ajuste) e nos princípios de Norman sobre correspondência com o mundo real. A validação empírica dessa hipótese com produtores reais é apontada como trabalho futuro."*

---

## 6. Referências bibliográficas (ABNT)

```
KRUG, Steve. Não me faça pensar, atualizado: uma abordagem de bom senso
à usabilidade web e mobile. 3. ed. Rio de Janeiro: Alta Books, 2014.

NIELSEN, Jakob. 10 Usability Heuristics for User Interface Design.
Nielsen Norman Group, 1994. Disponível em:
https://www.nngroup.com/articles/ten-usability-heuristics/.
Acesso em: 15 maio 2026.

NORMAN, Donald A. The design of everyday things. Revised and expanded
edition. New York: Basic Books, 2013.

WORLD WIDE WEB CONSORTIUM (W3C). Web Content Accessibility Guidelines
(WCAG) 2.1. W3C Recommendation, 5 jun. 2018. Disponível em:
https://www.w3.org/TR/WCAG21/. Acesso em: 15 maio 2026.

WORLD WIDE WEB CONSORTIUM (W3C). Accessible Rich Internet Applications
(WAI-ARIA) 1.2. W3C Recommendation, 6 jun. 2023. Disponível em:
https://www.w3.org/TR/wai-aria-1.2/. Acesso em: 15 maio 2026.
```
