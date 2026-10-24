# PRD — Central de Demandas da Equipe

Documento de Requisitos do Produto · Revisão para participação da turma sem login · 23/10/2026

**Status:** implementação local e abertura de PR autorizadas em 24/10/2026. O pedido atual termina com a PR preparada para merge, sem merge ou publicação. P01 confirmada: alunos entram só com e-mail, e o histórico permanece no mesmo navegador. O instrutor autorizou o projeto compartilhado e o prefixo definidos no `.env` local, preservando os demais dados e objetos.

Este documento define o produto, seus limites e como verificar seu funcionamento. Parte de `Pasted text.txt` e incorpora a decisão posterior do instrutor: solicitantes acessam por link ou QR code, informam apenas o e-mail e são cadastrados na hora; somente o administrador faz login. Essa decisão substitui a exigência anterior de login e contas previamente provisionadas para alunos. O desenvolvimento local foi autorizado em pedido posterior. O envio ao repositório remoto foi autorizado no pedido de implementação de 24/10/2026; a publicação continua em etapa posterior.

## 1. Visão, problema, objetivo e aprendizado esperado

As demandas da equipe chegam por mensagens espalhadas. Quem solicita não sabe se o pedido foi recebido nem onde acompanhar o atendimento. Quem atende precisa reunir os pedidos, organizar o trabalho e dar retorno.

A **Central de Demandas da Equipe** será uma aplicação web para uma única equipe. Na aula, os participantes enviarão demandas ao instrutor pelo celular. Solicitantes registrarão e acompanharão suas demandas; o administrador, chamado de gestor na versão inicial, consultará todas, avaliará prioridades, responderá e conduzirá o atendimento até a conclusão. São dois perfis, não três.

A hipótese é que um lugar único, com número da demanda, situação, prioridade e comentários, torne o acompanhamento mais claro. Redução de atrasos e aumento de produtividade não são resultados comprovados nem compromissos desta versão.

O produto será construído ao vivo em um curso de três horas para iniciantes, incluindo produto, fundamentos técnicos e caminhos de implementação. O instrutor exibirá um QR code para o endereço público do solicitante. Cada participante informa seu e-mail, começa com uma lista vazia e envia uma demanda para ser atendida ao vivo. O recorte deve demonstrar esse fluxo e verificar o isolamento entre participantes. A sequência da seção 10 prioriza essa entrega; sua execução no tempo disponível precisa ser preparada e verificada.

O processo usa uma adaptação didática das atividades do Lean Inception, de Paulo Caroli, em seis fases: Visão, Personas, Jornadas, Funcionalidades, Primeira versão e Validação. Benchmark complementa a visão. Este PRD faz a ponte para o desenvolvimento com IA e não é apresentado como um artefato obrigatório do Lean Inception. Não foram fornecidos entrevistas, resultados de benchmark ou evidências de validação.

Além de verificar o funcionamento, observaremos se Ana consegue descobrir o andamento sem depender de mensagens externas e se Rui entende o que chegou e o que precisa de atenção. Esses aprendizados serão qualitativos, sem metas numéricas ainda não acordadas. Concluir um teste funcional, por si só, não comprova benefício no uso real.

## 2. Personas, necessidades e jornadas completas

| Pessoa e perfil | Necessidade | Acesso esperado |
| --- | --- | --- |
| Ana — solicitante/aluna | Participar da demonstração, pedir itens para trabalhar e acompanhar o atendimento. | Acessar sem login, informar apenas e-mail, criar demandas e acompanhar/comentar antes da conclusão. |
| Rui — administrador/instrutor | Receber pedidos da turma, organizar o atendimento e dar retorno ao vivo. | Fazer login, consultar todas as demandas, comentar, revisar prioridades e avançar situações; também criar demandas próprias. |
| Beto — outro participante | Representar outro solicitante para verificar o isolamento. | O mesmo fluxo de Ana, sem cadastro prévio ou senha. |

Ana, Beto e Rui são personas, não credenciais existentes. Só o administrador terá conta previamente provisionada, com e-mail e senha. Os participantes informam seu próprio e-mail no acesso público; não exigimos nome, senha, código enviado por e-mail ou confirmação por link. O e-mail é uma identificação declarada, sem comprovação de titularidade.

### Jornada de Ana

1. Lê o QR code ou abre o link do solicitante, informa apenas o e-mail e seleciona “Continuar”. O sistema registra o participante na hora; no primeiro acesso, mostra lista vazia, contagens zeradas e a ação “Nova demanda”.
2. Abre o formulário e preenche título e descrição. A prioridade Média está pré-selecionada; pode escolher Baixa, Alta ou Crítica. Crítica revela um campo obrigatório para explicar o bloqueio e a falta de alternativa temporária.
3. Envia a demanda. Após a gravação completa, recebe a confirmação e o número gerado. A situação inicial é **Aberta**, com a prioridade escolhida.
4. Consulta os detalhes, a situação, a prioridade atual e os comentários. Pode acrescentar contexto enquanto a demanda estiver Aberta ou Em andamento; não altera os dados originais, a prioridade ou a situação.
5. Atualiza a consulta para encontrar respostas e mudanças feitas por Rui.
6. Após a conclusão, continua consultando a demanda e seus comentários, em modo somente leitura. Pode voltar à lista. O comportamento de retorno em outro navegador está destacado na seção 9; não deve ser confundido com login do solicitante.

### Jornada de Rui

1. Abre o acesso administrativo separado, faz login com e-mail e senha e consulta todas as demandas da turma, ordenadas da mais recente para a mais antiga, com contagens e filtro por situação.
2. Abre uma demanda, reconhece sua situação e prioridade atuais e avalia o contexto.
3. Se precisar elevar ou reduzir a prioridade, informa uma justificativa. A mudança e seu comentário de decisão são salvos juntos e ficam visíveis ao autor da demanda.
4. Avança de Aberta para Em andamento e pode responder por comentário.
5. Avança de Em andamento para Concluída. O registro permanece disponível para consulta, sem reabertura, novos comentários ou revisão de prioridade.
6. Quando precisar fazer um pedido próprio, usa o mesmo formulário e as mesmas regras de abertura. Sua permissão posterior decorre do perfil de administrador, inclusive na própria demanda. Ao terminar, pode sair da conta administrativa.

### História central da demonstração

Ana acessa pelo QR code, informa seu e-mail e encontra uma lista vazia. Abre **“Solicitar teclado e mouse”**, com descrição **“Preciso de teclado e mouse para trabalhar.”** e prioridade **Média**. Rui, autenticado como administrador, encontra o pedido e o e-mail informado, revisa para **Alta** e justifica **“Sem itens disponíveis para trabalhar.”**. A decisão aparece nos comentários, com valores anterior e novo, motivo, autor e horário. Rui muda a situação para **Em andamento** e pode comentar **“Vou providenciar os itens.”**. Ana atualiza a consulta e encontra a prioridade, o motivo, a resposta e a situação. Rui conclui; Ana continua consultando. Beto participa pelo mesmo QR code, mas não recebe acesso administrativo nem uma lista geral de demandas.

A prioridade desse exemplo não deve ser inferida apenas pelo nome dos itens. O contexto informado orienta a avaliação do gestor.

## 3. Escopo da primeira versão e o que fica para depois

### Incluído

- Uma única equipe, com participantes como solicitantes e o instrutor como administrador.
- Entrada pública do solicitante, com apenas e-mail e criação imediata do cadastro, sem login, senha, código ou confirmação por e-mail.
- Conta administrativa previamente provisionada, login com e-mail e senha, saída e tratamento de sessão encerrada; perfil administrativo nunca concedido pelo formulário público.
- QR code obrigatório para a demonstração publicada, apontando para a página do solicitante; link escrito disponível como alternativa.
- Criação de demandas com título, descrição e prioridade; justificativa adicional obrigatória apenas na abertura Crítica.
- Número legível, autoria, data/hora, situação e prioridade atual; lista e detalhes com persistência no Supabase real.
- Lista restrita ao acesso de cada pessoa, filtro por situação e contagens por situação sobre todo o conjunto acessível.
- Comentários comuns e registros obrigatórios de decisões de prioridade, visíveis ao autor da demanda e ao gestor.
- Revisão de prioridade pelo gestor, com justificativa e proteção contra gravação parcial e estado desatualizado.
- Sequência de atendimento Aberta → Em andamento → Concluída; consulta após conclusão.
- Interface em português, responsiva, utilizável por teclado e com estados claros.
- Primeira entrega de desenvolvimento local; publicação na Vercel em uma etapa posterior, conduzida pelo instrutor.

### Fora desta versão

Não incluir anexos, notificações por e-mail ou push, SLA, automações, classificação ou respostas por IA, múltiplas equipes, múltiplos responsáveis por demanda, atribuição de responsável, categorias, exportação, busca avançada, gestão de usuários ou recuperação de senha implementada no aplicativo. O cadastro público simplificado de solicitantes por e-mail passa a fazer parte do escopo; cadastro público de administrador continua proibido. Não adicionar senha, código de acesso, confirmação por e-mail ou nome obrigatório ao fluxo do aluno.

Também não incluir edição ou exclusão de títulos, descrições e comentários depois de salvos; exclusão de demandas; notas internas; reabertura; comentários após conclusão; histórico detalhado de todas as alterações ou tela de auditoria. A exceção ao histórico é o registro obrigatório, nos comentários, da justificativa de abertura Crítica e de cada revisão de prioridade.

Tempo real não é obrigatório: atualizar a consulta é suficiente. Os itens adiados podem ser reavaliados depois do aprendizado com esta versão, sem compromisso de implementação e sem integrar seus critérios de aceite.

## 4. Funcionalidades e regras de negócio

### 4.1. Acesso e identidade

**Solicitante:** a página pública apresenta apenas o campo “Seu e-mail” e a ação “Continuar”. Não há área de login, senha, código, link de confirmação ou exigência de conta prévia. Remover espaços das extremidades e recusar e-mail vazio ou com formato inválido na interface e no serviço. Essa validação verifica formato, não existência da caixa postal nem identidade da pessoa.

Ao continuar com um e-mail válido, registrar o participante no banco e estabelecer seu acesso de solicitante. Confirmar a entrada só após persistir o cadastro; se falhar, preservar o e-mail e permitir nova tentativa. O primeiro acesso de um novo participante mostra lista vazia e contagens zeradas, sem criar demanda de exemplo. A partir daí, abrir, consultar e comentar seguem as regras do produto. O e-mail não precisa ser repetido em cada demanda e fica disponível ao administrador para identificar quem fez o pedido.

**Administrador:** acesso separado, com login de e-mail e senha pelo Supabase Auth, conta previamente provisionada e perfil definido de forma controlada. Credenciais inválidas e sessão encerrada recebem mensagens claras. Sair encerra o acesso administrativo naquela sessão. Senhas são gerenciadas pelo serviço de autenticação, nunca pelas tabelas de participantes, demandas ou comentários. Informar o e-mail do administrador na página pública nunca concede seu perfil, sua sessão ou acesso ao painel.

**Identidade e permissões:** o e-mail informado é um dado declarado. O serviço deve gerar um identificador interno para o participante e vincular demandas e comentários ao acesso correspondente, sem aceitar um autor arbitrário enviado pelo navegador. Não exigir nome; para exibição, usar “Você” na própria visão, o e-mail declarado na visão do administrador e o nome configurado do administrador em suas respostas. A existência de um cadastro não comprova que a pessoa é titular daquele e-mail.

**P01 confirmada — histórico no navegador de origem:** o participante acessa seus pedidos enquanto o navegador conservar sua sessão. Outro navegador começa vazio mesmo com o mesmo e-mail. Não unir cadastros ou recuperar pedidos por comparação de e-mail. Limpar dados locais, perder a sessão ou trocar de dispositivo não apaga as demandas, mas impede recuperá-las pelo solicitante nesta versão. Não haverá login ou recuperação por e-mail para alunos. Informar essa limitação na entrada.

### 4.1.1. QR code da aula

- Disponibilizar um QR code que abra diretamente o endereço público do solicitante, acompanhado do link escrito como alternativa.
- Ao ler o código em um celular sem acesso anterior, abrir a identificação por e-mail, nunca o login administrativo. Depois de informar o e-mail, o novo participante encontra a lista vazia e pode criar uma demanda.
- O código contém apenas o endereço público; não inclui e-mails de alunos, senhas, sessões ou permissões administrativas. Compartilhar o link permite que outra pessoa inicie sua própria participação.
- O QR code deve estar disponível para o instrutor exibir na aula. Não é necessário criar um editor de QR codes ou uma tela adicional de gestão.
- Gerar e testar o QR code definitivo quando existir o endereço publicado. `localhost` não atende aos celulares da turma. Sua inclusão neste PRD não autoriza publicar agora.

### 4.2. Abertura de demanda

| Campo | Regra |
| --- | --- |
| Título | Obrigatório, até 120 caracteres; não aceitar somente espaços. |
| Descrição | Obrigatória, até 2.000 caracteres; não aceitar somente espaços. |
| Prioridade | Obrigatória: Baixa, Média, Alta ou Crítica. Média pré-selecionada no formulário. Ausência ou valor inválido também são recusados no serviço de dados. |
| Justificativa de abertura Crítica | Campo específico, além da descrição, obrigatório ao escolher Crítica. De 1 a 1.000 caracteres após remover espaços das extremidades; recusar vazio ou somente espaços. Orientar a explicar o impacto, o bloqueio e a falta de alternativa temporária. |

Os limites devem aparecer na interface e ser validados na gravação. Para Baixa, Média e Alta não há exigência de justificativa extra na abertura.

Toda demanda começa **Aberta**, inclusive quando criada por Rui. A prioridade indicada é a prioridade atual até uma eventual revisão do gestor. Não haverá campos separados de prioridade solicitada e aprovada.

O serviço de dados gera o identificador interno, o número legível e a data/hora de criação e vincula o autor ao participante identificado ou ao administrador autenticado. Valores arbitrários de autor, horário ou situação inicial enviados pelo navegador não podem prevalecer. O e-mail é informado uma única vez na entrada pública, não como um campo editável de autoria em cada pedido.

Uma abertura Crítica grava a demanda e um comentário de justificativa em uma única operação atômica: ou ambos são salvos, ou nenhum é salvo. Só então a interface confirma o sucesso e apresenta o número.

### 4.3. Lista, detalhes e contagens

- O solicitante consulta somente as demandas vinculadas ao seu acesso e os comentários delas; acessos de navegadores diferentes permanecem separados mesmo com o mesmo e-mail. O administrador consulta todas as demandas e comentários da única equipe, inclusive os próprios pedidos.
- A lista apresenta número, título, situação, prioridade atual e data/hora de criação, da mais recente para a mais antiga. Os detalhes apresentam também descrição, autor e comentários, com caminho para voltar à lista.
- O filtro tem as opções **Todas**, **Aberta**, **Em andamento** e **Concluída**. Ele limita apenas as demandas exibidas na lista.
- As contagens de Aberta, Em andamento e Concluída abrangem sempre todas as demandas que a pessoa pode consultar, independentemente do filtro. A interface explica essa diferença, por exemplo: “Totais das demandas que você pode consultar; o filtro altera apenas a lista.”
- Não expor conteúdo, comentários ou contagens de demandas de terceiros a um solicitante, inclusive em consultas diretas ao serviço.
- Atualizar a consulta deve buscar o estado persistido para que uma pessoa encontre as mudanças feitas por outra. Não exigir sincronização em tempo real.

### 4.4. Comentários

- Solicitante e gestor podem comentar nas demandas a que têm acesso enquanto estiverem **Aberta** ou **Em andamento**.
- Comentários comuns têm de 1 a 1.000 caracteres, sem aceitar texto vazio ou somente espaços. Autor, vínculo com a demanda e data/hora são registrados de forma confiável.
- Exibir comentários em ordem cronológica, do mais antigo para o mais recente, com nome do autor e data/hora. Não existem notas internas.
- Comentários comuns, justificativas de abertura Crítica e registros de revisão de prioridade obedecem às mesmas permissões de consulta e à proibição de edição e exclusão.
- O serviço distingue comentários comuns de decisões de prioridade. Uma mensagem comum que mencione uma prioridade não altera a classificação nem se transforma em registro oficial de decisão.
- Depois da conclusão, nenhum perfil pode acrescentar comentários. Se a tela estiver desatualizada e a demanda já tiver sido concluída, o serviço recusa o envio; a interface explica o ocorrido, preserva o texto e atualiza a consulta. A preservação do texto não permite reenviá-lo para uma demanda concluída.

### 4.5. Prioridade e sua revisão

As prioridades são **Baixa**, **Média**, **Alta** e **Crítica**. Nesta demonstração, Crítica significa um bloqueio que impede a execução do trabalho e não tem alternativa temporária. A orientação pede que esse contexto seja explicado. A validação automática verifica o preenchimento e o limite do motivo; não comprova a criticidade do conteúdo. O gestor avalia a classificação. Prioridade expressa urgência e impacto percebidos, sem promessa de prazo ou SLA.

Depois de salvar a abertura, somente o gestor pode revisar a prioridade, apenas enquanto a demanda estiver Aberta ou Em andamento. Pode elevar ou reduzir qualquer nível, inclusive revisar para Crítica ou reduzir de Crítica para Alta. O solicitante pode comentar mudanças de contexto para avaliação, sem alterar a prioridade.

Cada mudança exige uma justificativa de 1 a 1.000 caracteres, recusando texto vazio ou somente espaços. Revisar para Crítica exige esse mesmo motivo, sem solicitar uma segunda justificativa.

O serviço compõe um comentário de decisão com **prioridade anterior, nova prioridade, motivo, autor autenticado e data/hora**. O valor anterior vem do registro atual, nunca de texto arbitrário do navegador. Mudança e comentário são atômicos: se qualquer parte falhar, nenhuma delas é aplicada, e o motivo digitado é preservado para nova tentativa.

Confirmar uma prioridade que não mudou não exige justificativa nem gera revisão ou comentário de decisão. Se a demanda tiver mudado desde a abertura do formulário de revisão, recusar a tentativa baseada no estado antigo, atualizar a consulta e pedir que o gestor reavalie. Essa verificação deve ocorrer no serviço, inclusive quando outra operação tiver mudado a prioridade ou concluído a demanda. A nova tentativa só pode ocorrer após a reavaliação e se o estado atual permitir.

Essa permissão não autoriza editar título, descrição, autor ou data de criação, nem excluir registros.

### 4.6. Situação e conclusão

| Situação atual | Próxima situação permitida | Quem pode alterar | Comentários e revisão de prioridade |
| --- | --- | --- | --- |
| Aberta | Em andamento | Gestor | Permitidos conforme o perfil e o acesso à demanda. |
| Em andamento | Concluída | Gestor | Permitidos até a conclusão persistida. |
| Concluída | Nenhuma | Ninguém | Proibidos; registro somente para leitura. |

Não permitir pular etapas ou voltar a uma situação anterior. O serviço valida a transição contra a situação atual, sem confiar apenas na tela. O solicitante nunca altera a situação, nem em seu próprio pedido. Concluir não exclui o registro e não cria possibilidade de reabertura. Não é exigido um comentário para cada transição nem um histórico de situações.

### 4.7. Confirmação, falhas e persistência

- Confirmar abertura, comentário, revisão de prioridade e mudança de situação somente após o salvamento no Supabase, incluindo o comentário obrigatório quando aplicável.
- Enquanto uma operação estiver em andamento, impedir cliques repetidos naquela ação e mostrar o estado de salvamento. Isso reduz envios repetidos, mas não garante ausência geral de duplicatas, por exemplo, após perda de conexão e nova tentativa.
- Em caso de falha, não mostrar sucesso; preservar os campos preenchidos, incluindo justificativas, explicar o problema e permitir nova tentativa quando o estado e as permissões ainda permitirem.
- Se o resultado de uma gravação não puder ser confirmado por falha de comunicação, não afirmar sucesso nem ausência de gravação; orientar a atualizar a consulta antes de repetir. Esse tratamento é uma suposição de interface registrada na seção 9.
- Recarregar não apaga registros salvos e deve manter a consulta do participante enquanto seu acesso continuar disponível. O administrador continua vendo os registros após sair e fazer login novamente. Perder o acesso do navegador não apaga dados do banco; o solicitante começa com novo cadastro se perder a sessão original (P01 confirmada). Preservar campos durante erros não implica guardar permanentemente formulários ainda não enviados.
- Validar no serviço de dados todas as restrições de leitura, autoria, comentários, prioridade, transições, perfil e edição/exclusão. Esconder botões ou bloquear rotas no navegador não basta; chamadas diretas precisam obedecer às mesmas regras.

## 5. Telas e estados: preenchimento, carregamento, sucesso, erro, vazio e acesso negado

Todas as telas usam português, rótulos claros, foco visível e navegação por teclado. Campos, mensagens e ações devem permanecer legíveis e acessíveis em computador e celular. Não usar apenas cor para comunicar situação, prioridade ou erro. Mostrar os limites dos campos e explicar como corrigir entradas inválidas.

| Tela ou contexto | Conteúdo e ações | Estados e comportamento |
| --- | --- | --- |
| Entrada pública por link ou QR code | Apenas “Seu e-mail”, “Continuar” e explicação breve de que o e-mail identifica as demandas da demonstração. | E-mail vazio ou inválido com orientação; cadastro em andamento sem cliques repetidos; falha mantém o e-mail. Após cadastro persistido, abrir lista vazia para o novo participante. Sem senha, código, confirmação por e-mail ou nome obrigatório. |
| Login administrativo | E-mail, senha e ação de entrar, em acesso separado. | Entrada em andamento; credenciais inválidas; falha de conexão com nova tentativa. Após autenticação e autorização administrativa, abrir a lista de todos os pedidos. Sem cadastro público de administrador. |
| Lista | Demandas acessíveis, prioridade atual, situação, filtro, contagens e nova demanda; sair da conta apenas no acesso administrativo. | Carregamento; lista preenchida; primeira lista vazia com convite para criar demanda; filtro sem resultados com opção de alterar/limpar; erro com nova tentativa. Não mostrar registros ou indicadores fictícios. |
| Nova demanda | Título, descrição e prioridade Média pré-selecionada. Campo de justificativa aparece para Crítica. | Preenchimento e validação junto aos campos; salvamento com ação temporariamente indisponível; erro mantendo o conteúdo; sucesso apenas após persistência completa, com número e acesso aos detalhes. |
| Detalhes | Número, título, descrição, autor, criação, situação, prioridade e comentários cronológicos; voltar à lista e atualizar consulta. | Carregamento; erro de consulta; ausência de comentários; somente leitura após conclusão. Quando permitido, oferecer ação de comentar; somente ao gestor, ações de revisar prioridade e avançar situação. Ambos leem os registros de decisão nas demandas acessíveis. |
| Comentar | Campo de texto e ação de enviar, apenas quando permitido. | Limite informado; validação; salvamento; sucesso com comentário persistido; erro preservando texto. Se a demanda acabou de ser concluída, explicar, atualizar e desabilitar o envio. |
| Revisar prioridade | Situação e prioridade atuais em destaque, seleção da nova prioridade e motivo quando houver mudança. | Sem mudança, não pedir motivo nem registrar revisão. Com mudança, validar motivo; salvar atomicamente; erro mantém motivo. Estado desatualizado exige nova consulta e reavaliação, sem sucesso falso. |
| Mudar situação | Situação atual e ação para a próxima etapa permitida. | Ação disponível somente para gestor e transição válida; salvamento; sucesso após persistência; falha com orientação e atualização quando necessário. |
| Sessão administrativa encerrada | Mensagem de que o administrador precisa entrar novamente. | Interromper dados e ações administrativos e levar ao login administrativo; não deixar dados de uma sessão anterior visíveis no acesso público. |
| Acesso do participante indisponível | Explicação simples e retorno à identificação por e-mail. | Não direcionar o solicitante para login ou pedir senha. Não apagar registros salvos; explicar que outro acesso começa vazio e não recupera o histórico pelo e-mail. |
| Acesso negado ou demanda não encontrada | Mensagem segura e caminho para a lista ou entrada correspondente ao perfil. | Para endereço indisponível, usar “Demanda não encontrada ou acesso não permitido”, sem revelar conteúdo alheio. Para ação proibida em demanda acessível, explicar a restrição. Tentar abrir o painel sem sessão administrativa exige login do administrador. |

A mensagem unificada para um endereço indisponível preserva os estados de erro sem permitir que um solicitante descubra a existência de uma demanda de outra pessoa. Essa é uma suposição de apresentação detalhada na seção 9.

## 6. Dados e permissões por pessoa, com uma matriz simples de acesso

O modelo abaixo é conceitual: não define SQL, arquivos da aplicação ou mecanismos específicos de implementação.

### 6.1. Dados mínimos e relações

| Informação | Dados necessários e relação | Responsabilidade de gravação |
| --- | --- | --- |
| Participante/solicitante | Identificador interno, e-mail declarado, data/hora do cadastro e vínculo com seu acesso. Um participante pode criar várias demandas e comentários. Não há nome ou senha obrigatórios. | Criado na hora após informar e-mail válido; serviço gera identificador e horário e atribui somente o perfil solicitante. O e-mail não é identidade verificada nem chave suficiente para conceder administração. O e-mail não é único; cada acesso independente tem identidade própria. Não existe recuperação pelo e-mail. |
| Administrador | Identificador da conta autenticada, nome de exibição e perfil administrativo controlado. Pode ser autor de demandas e comentários. | Conta previamente provisionada pelo instrutor; login e senha pelo Supabase Auth. O formulário público nunca cria, altera ou recupera essa conta. |
| Demanda | Identificador interno, número legível único, título, descrição, referência ao autor, situação, prioridade atual e data/hora de criação. Uma demanda possui zero ou mais comentários; uma abertura Crítica já possui sua justificativa. | Serviço gera identificador, número e horário e determina autor e situação inicial. O usuário fornece somente os campos permitidos na abertura. Depois, apenas o gestor altera prioridade e situação, dentro das regras. |
| Comentário | Identificador, referência à demanda, texto ou motivo, referência ao autor, data/hora e tipo confiável: comum, justificativa de abertura Crítica ou revisão de prioridade. | Serviço determina vínculo autorizado, autoria, horário e tipo. Comentário comum vem de envio permitido; os outros tipos são criados exclusivamente pelas operações correspondentes de abertura ou revisão. |
| Dados de revisão no comentário | Prioridade anterior e nova prioridade, apenas para o tipo revisão; o texto contém o motivo. Autor e horário são os mesmos dados confiáveis do comentário. | Serviço captura a prioridade anterior do registro vigente e a nova do valor validado, salvando com a mudança. O navegador não pode forjar o tipo nem esses valores como registro de decisão. |
| Controle de concorrência da demanda | Marcador de versão do estado para reconhecer que a demanda mudou desde a leitura do formulário. Não é um histórico de eventos. | Mantido pelo serviço e comparado na operação de revisão. Sua forma técnica é uma suposição reversível; a recusa de revisão desatualizada é obrigatória. |

A justificativa de abertura Crítica é identificada por seu tipo, sem inventar uma prioridade anterior. Revisões posteriores permanecem como comentários mesmo se a prioridade atual mudar novamente. Não armazenar prioridades “solicitada” e “aprovada” separadas nem duplicar o motivo em um histórico adicional. O limite de 1.000 caracteres aplica-se ao texto ou motivo digitado; os metadados confiáveis da decisão ficam separados e não reduzem esse limite nem truncam a justificativa.

Exibir “Você” para o próprio solicitante e o nome configurado do administrador nas respostas. O administrador pode consultar o e-mail declarado vinculado à demanda para identificar o participante durante a aula. A consulta do solicitante não expõe diretório de e-mails ou dados de outros participantes. Não adicionar exportação ou envio de mensagens por causa da coleta de e-mail.

### 6.2. Matriz de acesso

Nesta matriz, “visitante” ainda não concluiu a identificação por e-mail. “Solicitante” representa Ana ou Beto após esse cadastro imediato, sem login. “Administrador” é o gestor autenticado. “Próprios pedidos” significa os registros vinculados à identidade da sessão original, conforme P01 confirmada.

| Ação | Visitante | Solicitante sem login | Administrador autenticado |
| --- | --- | --- | --- |
| Abrir página pública e informar e-mail | Sim; cria cadastro de solicitante na hora | Pode continuar seu acesso | Pode divulgar o link e o QR code |
| Abrir painel administrativo ou administrar | Não; exige login administrativo | Não, mesmo informando e-mail do administrador | Sim, dentro das regras abaixo |
| Criar demanda | Não | Sim, em nome próprio e pelas regras de abertura | Sim, em nome próprio e pelas mesmas regras |
| Consultar demanda e comentários | Não | Somente os próprios pedidos | Todos os pedidos da equipe |
| Consultar contagens por situação | Não | Somente o conjunto dos próprios pedidos | Todo o conjunto da equipe |
| Criar comentário comum | Não | Nos próprios pedidos Aberta ou Em andamento | Em qualquer pedido Aberta ou Em andamento |
| Gerar justificativa de abertura Crítica | Não | Apenas como parte atômica da própria abertura Crítica | Apenas como parte atômica da própria abertura Crítica |
| Revisar prioridade e gerar sua decisão | Não | Não | Sim, antes da conclusão, com motivo válido e sem estado desatualizado |
| Avançar situação | Não | Não | Somente Aberta → Em andamento → Concluída |
| Alterar título, descrição, autor, número ou criação de registro salvo | Não | Não | Não |
| Editar ou excluir comentários, inclusive decisões | Não | Não | Não |
| Excluir demandas | Não | Não | Não |
| Comentar, revisar prioridade ou reabrir após conclusão | Não | Não | Não |
| Consultar e-mail declarado de um pedido | Não | Apenas o próprio | Sim, nos pedidos da equipe |
| Escolher ou alterar livremente perfil | Não | Não | Não; não há gestão de usuários no aplicativo |

As proibições incluem operações diretas no serviço de dados. Somente a conta administrativa é provisionada pelo instrutor; os solicitantes são cadastrados no fluxo público. A ausência de login do aluno não libera consultas irrestritas ao banco nem alterações administrativas.

## 7. Stack, ambientes e dependências

### Stack definida

- **TypeScript, React e Vite:** aplicação web responsiva executada no navegador.
- **Supabase:** banco de dados, login administrativo com Supabase Auth, proteção de acesso e aplicação confiável das regras de gravação.
- **GitHub:** código preparado para versionamento, sem inclusão de segredos.
- **Vercel:** hospedagem do frontend na etapa posterior de publicação.

O frontend pode conversar diretamente com o Supabase. Tela, regras e memória são funções e podem compartilhar uma plataforma; não exigir servidor próprio na Vercel apenas para separá-las. A estrutura deve ser simples, com regras e operações atômicas no serviço de dados. Manter a stack definida; uma substituição exigiria incompatibilidade concreta e justificativa, não identificadas neste PRD.

**Mecanismo de acesso para P01 confirmada:** usar um segredo aleatório por navegador, emitido pelo serviço no cadastro e mantido no armazenamento local. As operações do solicitante validam esse segredo no banco; somente seu hash é armazenado no schema privado da dinâmica. Não transmitir o segredo em URLs, QR code ou logs nem permitir consulta direta às tabelas pelo visitante. Não criar usuários de alunos no Auth compartilhado nem habilitar Anonymous Sign-Ins. A inspeção do projeto confirmou políticas amplas para o papel `authenticated` e um gatilho de criação de usuário de outro aplicativo; essa opção evita ativá-los. O administrador continua com Supabase Auth. Trata-se de uma adaptação técnica reversível que preserva P01 e as jornadas, sem novo servidor ou mudança de stack. O segredo funciona como credencial de posse: quem o obtiver poderá acessar aquele participante; proteger contra vazamento e scripts injetados. Perder os dados locais inicia outro histórico.

### Ambientes e limites de execução

| Etapa | Condição esperada |
| --- | --- |
| PRD | Referência atualizada para o desenvolvimento local autorizado; publicação não autorizada. |
| Desenvolvimento e verificação local | Frontend servido localmente, conectado a o projeto Supabase real definido por `SUPABASE_PROJECT_REF`, com objetos limitados a `SUPABASE_DATABASE_PREFIX`. Dados persistem no serviço, mesmo que a interface esteja local. |
| Publicação posterior | Frontend hospedado na Vercel, com configurações e fluxo de autenticação verificados no endereço publicado. Etapa separada, conduzida pelo instrutor, sem publicação automática. |

O instrutor autorizou usar o projeto definido por `SUPABASE_PROJECT_REF` no `.env` local. Criar somente objetos dentro de `SUPABASE_DATABASE_PREFIX` e `SUPABASE_PRIVATE_SCHEMA`; preservar tabelas, dados, políticas e funções existentes de outras aplicações. Não executar reset, seed geral, alteração de permissões globais ou migrações de outras aplicações. Mudanças compartilhadas de autenticação exigem verificar seus efeitos antes da aplicação. Valores reais de contas, e-mails, projetos e URLs não devem ser copiados para os Markdown. Não colocar senhas ou chaves secretas no navegador, repositório ou logs. Configurações públicas do cliente Supabase não substituem políticas de acesso e regras de gravação.

O QR code faz parte da entrega para a aula: aponta para o endereço publicado do solicitante e abre a identificação por e-mail, sem login. A área administrativa tem acesso separado e protegido. O código definitivo depende da URL real de publicação; não inventar um endereço nem gerar agora um QR code para `localhost`.

### Dependências da futura implementação

1. Disponibilidade e acesso autorizado ao projeto Supabase definido no `.env` e autorizado para esta dinâmica, com autenticação, dados e regras preparados antes do uso.
2. Provisionamento seguro apenas da conta administrativa, com nome de exibição, e-mail e senha fornecidos pelo instrutor. Ana, Beto e os demais alunos serão cadastrados ao informar e-mail no acesso público.
3. Configurações públicas do cliente, conexão com a internet e tratamento seguro de credenciais privilegiadas usadas na preparação. Verificar a viabilidade de cadastros simultâneos na rede da aula, sem presumir capacidade ilimitada.
4. Ambiente local e navegadores separados para verificar dois participantes e o administrador; verificar que o mesmo e-mail em outro navegador não recupera nem associa demandas.
5. Para a etapa posterior: acesso autorizado ao GitHub e à Vercel, endereço público real do solicitante, acesso administrativo configurado e QR code correspondente preparado para exibição. Testar a leitura em um celular antes da aula.

Essas dependências não exigem fornecer credenciais para revisar este documento. A forma operacional de provisionar acessos e a configuração técnica serão tratadas no desenvolvimento, mantendo as permissões já definidas.

## 8. Critérios de aceite numerados, separando local e publicação

Os critérios abaixo são verificações futuras, não resultados de testes já executados. A versão local usa o Supabase real, uma conta administrativa provisionada e participantes cadastrados na hora. Quando um critério exige proteção no serviço, verificar chamadas diretas. P01 está confirmada: verificar que repetir o e-mail em outro navegador não recupera o histórico.

### 8.1. Versão local

1. **CA-L01 — Entrada pública sem login.** Em navegador novo, Ana abre o link do solicitante, informa somente e-mail e continua sem senha, nome obrigatório, código ou confirmação por e-mail. O cadastro é persistido na hora. E-mail vazio, somente espaços ou de formato inválido é recusado na interface e no serviço. Falha preserva o e-mail, sem confirmar cadastro inexistente. O primeiro acesso de participante novo mostra lista vazia, contagens zeradas e “Nova demanda”.
2. **CA-L02 — Login somente administrativo.** Rui entra e sai com a conta provisionada. Sem sessão administrativa válida, ninguém consulta a lista geral, revisa prioridade ou altera situação, inclusive por chamada direta. Credenciais inválidas e sessão encerrada têm mensagem clara. Informar o e-mail de Rui na entrada pública cria, no máximo, um acesso de solicitante e jamais concede administração. Sair remove o acesso administrativo e seus dados da tela.
3. **CA-L03 — Abertura válida e persistente.** Média aparece pré-selecionada. Após a identificação por e-mail, Ana abre demanda com prioridade Média, Baixa ou Alta sem justificativa extra. Recebe número único legível; o pedido fica vinculado ao seu cadastro e e-mail declarado, Aberta, com prioridade escolhida e horário confiável. O serviço determina a autoria. Recarregar mantendo o acesso permite consultar os registros salvos; outro navegador começa vazio, mesmo com o mesmo e-mail.
4. **CA-L04 — Título e descrição.** A interface e o serviço recusam título ou descrição ausentes, vazios, somente com espaços ou acima de 120 e 2.000 caracteres, respectivamente. Valores válidos nos limites são aceitos, com os demais campos válidos. A interface informa os limites e o campo a corrigir.
5. **CA-L05 — Prioridade obrigatória.** Ausência de prioridade ou valor fora de Baixa, Média, Alta e Crítica é recusado na gravação, também por chamada direta. A pré-seleção do formulário não elimina essa validação.
6. **CA-L06 — Abertura Crítica.** Selecionar Crítica mostra o campo e a orientação de impacto/bloqueio. Sem motivo, com somente espaços ou com mais de 1.000 caracteres após remover espaços das extremidades, a abertura é recusada. Motivos preenchidos de 1 a 1.000 caracteres passam pela validação de tamanho; o sistema não afirma que o texto comprova criticidade. Com dados válidos, demanda e comentário de justificativa aparecem para Ana e Rui.
7. **CA-L07 — Atomicidade na abertura Crítica.** Provocando falha na gravação do comentário obrigatório, não fica salva a demanda nem sua justificativa isoladamente. A interface não confirma sucesso e preserva os campos e o motivo para nova tentativa. A regra vale também na operação direta do serviço.
8. **CA-L08 — Isolamento e e-mail repetido.** Beto, identificado separadamente, não lê, comenta ou altera a demanda de Ana, não consulta seus comentários e não a infere por contagens. Verificar endereço direto e operações no serviço. Se Beto repetir o e-mail de Ana em outro navegador, continua sem acesso aos pedidos dela e começa vazio. Informar e-mail repetido nunca une cadastros nem concede administração.
9. **CA-L09 — Comentários permitidos.** Ana consulta seu pedido e envia comentário válido quando Aberta e quando Em andamento. Rui também comenta nos pedidos acessíveis antes da conclusão. Cada comentário aparece com autor e horário corretos, em ordem cronológica, e permanece após recarregar. Sem comentários, o estado correspondente é claro.
10. **CA-L10 — Validação de comentários.** Comentário vazio, somente com espaços ou acima de 1.000 caracteres é recusado na interface e no serviço. Texto válido com 1 ou 1.000 caracteres é aceito quando as demais condições de acesso e situação são atendidas.
11. **CA-L11 — Visão e atendimento do gestor.** Com demandas de Ana e Beto, Rui consulta ambas, comenta e realiza Aberta → Em andamento → Concluída. Após atualizar sua própria consulta, cada solicitante encontra apenas a resposta e a situação dos pedidos a que tem acesso.
12. **CA-L12 — Revisão de prioridade.** Rui revisa Média para Alta com motivo válido. O comentário de decisão mostra Média, Alta, motivo, nome de Rui e horário corretos. Verificar também revisão para Crítica, sem segundo campo de motivo, e redução de Crítica para Alta. O serviço recusa revisão sem motivo, somente com espaços ou acima de 1.000 caracteres; os limites válidos são aceitos.
13. **CA-L13 — Atomicidade da revisão.** Se falhar o salvamento do comentário de decisão, a prioridade permanece anterior e não aparece uma revisão parcial. Se falhar a mudança, não fica um comentário isolado indicando que ocorreu. Não mostrar sucesso; manter o motivo. Verificar a operação no serviço de dados.
14. **CA-L14 — Revisão desatualizada.** Abrir um formulário de revisão e, por outra sessão autorizada, mudar a prioridade ou a situação da demanda antes de confirmar. A tentativa baseada no estado antigo é recusada no serviço; a consulta é atualizada e o gestor recebe orientação para reavaliar, com o motivo preservado. Se a demanda foi concluída, a revisão continua proibida. Uma alteração intermediária não pode passar despercebida só porque o valor depois voltou a ser igual.
15. **CA-L15 — Mesma prioridade.** Confirmar a prioridade atual, sem alteração do estado desde a leitura, não exige justificativa e não gera revisão nem comentário duplicado. Esse comportamento não permite ignorar a verificação de estado desatualizado.
16. **CA-L16 — Integridade das decisões.** O solicitante não consegue forjar tipo de comentário de decisão, prioridade anterior/nova, autor ou horário. O serviço cria esses registros apenas nas operações autorizadas. Texto livre semelhante a uma decisão permanece comentário comum e não altera prioridade. Nem o gestor pode impor ao registro de decisão um valor anterior arbitrário.
17. **CA-L17 — Pedido próprio do gestor.** Rui consegue criar demanda própria com as mesmas opções, limites e exigência de justificativa para Crítica. Ela começa Aberta e tem Rui como autor, sem exceção nas regras de criação.
18. **CA-L18 — Limites de alteração.** Após a abertura, Ana e Beto não alteram situação, prioridade, autoria ou perfil. O serviço não aceita autoria, horário ou situação inicial arbitrários na criação. Rui não pode editar títulos e descrições salvos, trocar autoria, editar/excluir comentários ou excluir demandas. Verificar também chamadas diretas e tentativas de alterar campos extras junto de uma revisão permitida.
19. **CA-L19 — Transições válidas.** O serviço recusa Aberta → Concluída, Em andamento → Aberta e qualquer retorno a partir de Concluída, inclusive por chamada direta. A interface só oferece a próxima etapa válida ao gestor e exibe a situação atual antes da ação.
20. **CA-L20 — Conclusão somente para leitura.** Depois de concluir, Ana e Rui continuam consultando o registro e todos os comentários autorizados, mas nenhum deles acrescenta comentário, revisa prioridade ou reabre. Tentar comentar por uma tela que ainda mostra Aberta ou Em andamento é recusado pelo serviço; a interface explica, preserva o texto e atualiza a situação sem permitir o envio.
21. **CA-L21 — Lista, filtro e contagens.** A lista mostra prioridade atual e demandas da mais recente para a mais antiga. Cada opção do filtro exibe apenas demandas acessíveis da situação correspondente; Todas reúne as acessíveis. As contagens de cada situação continuam correspondendo ao conjunto total acessível, sem mudar em função do filtro. A interface explica essa regra.
22. **CA-L22 — Estados vazios e de consulta.** Sem demandas, apresentar estado de lista vazia. Sem correspondência no filtro, apresentar estado específico e opção de mudar o filtro. Uma contagem realmente zero aparece como zero; carregamento e falha não são apresentados como ausência comprovada de dados. Não inserir registros ou indicadores fictícios. Verificar também carregamento, erro com nova tentativa e endereço não encontrado/sem acesso.
23. **CA-L23 — Confirmação e falhas.** Com gravação atrasada, abertura, comentário e atualização mostram salvamento e impedem cliques repetidos naquela ação. Sucesso só aparece após confirmação de persistência completa. Com falha, não há sucesso falso; campos e motivos permanecem preenchidos para nova tentativa permitida. Não apresentar essa proteção como garantia geral contra duplicatas.
24. **CA-L24 — Uso em computador, celular e teclado.** Como aluno, completar identificação por e-mail, abertura, consulta, filtro e comentário em tela pequena e por teclado, sem ações inacessíveis. Como administrador, completar login, revisão de prioridade e avanço de situação. Rótulos, foco e mensagens são perceptíveis; detalhes permitem voltar à lista e reconhecer prioridade e situação antes de alterar.
25. **CA-L25 — Ambiente e proteção dos dados.** A versão local usa o Supabase real definido por `SUPABASE_PROJECT_REF`, limitado a `SUPABASE_DATABASE_PREFIX`. Senhas não estão em demandas/comentários; segredos não estão no código entregue ao navegador, no repositório ou em logs. A aplicação usa apenas seus próprios objetos prefixados no projeto compartilhado definido no `.env`, sem ler ou alterar os dados das demais aplicações. Configurações públicas não permitem contornar os controles verificados nos demais critérios.
26. **CA-L26 — Fluxo completo da demonstração.** Executar a história da seção 2: Ana informa e-mail, começa com lista vazia e abre “Solicitar teclado e mouse”; Rui, autenticado como administrador, vê o pedido e o e-mail declarado, revisa Média → Alta com motivo, avança, comenta e conclui. Ana acompanha ao atualizar. Beto, com acesso separado, não vê o pedido. Sem exigir login ou envio de e-mail ao aluno.

### 8.2. Etapa publicada

27. **CA-P01 — Dois acessos publicados.** Após publicação conduzida pelo instrutor, o endereço do solicitante abre em computador e celular sem login e permite cadastro imediato por e-mail. O acesso administrativo separado exige login. Sessão administrativa encerrada e credenciais inválidas continuam sendo tratadas, sem expor o painel na entrada pública.
28. **CA-P02 — Participação ao vivo.** Participantes em celulares diferentes informam e-mails e enviam pedidos; Rui os encontra no painel e responde, e cada participante acompanha suas demandas ao atualizar. Repetir a história central, a persistência, as regras de escrita e o isolamento conforme P01. Verificar previamente a entrada da turma na rede prevista para a aula, sem prometer quantidade simultânea ainda não acordada.
29. **CA-P03 — QR code obrigatório.** O instrutor dispõe do QR code e do link escrito correspondentes à URL pública real do solicitante. Ler o código em celular novo abre a identificação apenas por e-mail, sem login, senha ou código de confirmação; após cadastro, aparece a lista vazia. O destino não é `localhost` nem o login administrativo. O código não contém e-mail individual, senha, sessão ou credencial administrativa.

### 8.3. Aprendizado com o uso

Após a verificação funcional, observar se Ana consegue ler o QR code, informar o e-mail, entender a lista vazia, criar um pedido e encontrar prioridade, motivo da revisão e andamento. Observar se Rui entende o que chegou, identifica o participante pelo e-mail declarado e escolhe o próximo passo. Registrar dúvidas e necessidade de ajuda, sem criar metas numéricas ou conclusões de produtividade ainda não demonstradas. Esses achados não substituem os critérios de acesso e integridade.

## 9. Suposições e decisões pendentes

### 9.1. Análise crítica

O novo pedido altera explicitamente a decisão anterior de login obrigatório para todos e de ausência de cadastro público. Este PRD adota entrada pública apenas por e-mail, cadastro imediato, login exclusivo do administrador e QR code incluído na aula. As regras de demandas, prioridade, comentários e conclusão continuam válidas. O instrutor confirmou P01: acompanhamento no mesmo navegador, sem recuperação pelo e-mail. Também autorizou substituir o projeto isolado pelo projeto compartilhado definido no `.env`, limitado a novos objetos prefixados.

- **E-mail declarado:** qualquer pessoa pode digitar um endereço de outra. Coletar o endereço permite identificar o pedido para a dinâmica da aula, mas não comprova autoria real. Não promover alguém a administrador por comparação de e-mails ou por um campo enviado pelo navegador.
- **Retomada e isolamento:** recuperar pedidos apenas digitando o mesmo e-mail permitiria a outra pessoa acessá-los. Manter vínculo com o navegador preserva a separação entre acessos, mas não recupera o histórico depois de perder esse acesso. Foi escolhido o vínculo com o navegador; não prometer recuperação por e-mail.
- **QR code público:** facilita a entrada na aula e não restringe participação aos presentes. Qualquer pessoa com o link pode iniciar o fluxo de solicitante. Ele nunca concede administração; não há convite individual ou código secreto de turma nesta versão.
- **Lista vazia e persistência:** a lista vazia é o estado inicial de um cadastro novo, não uma limpeza dos dados sempre que alguém atualiza a página. Os pedidos recebidos permanecem no banco e no painel administrativo.
- **Duração do curso:** três horas incluem várias atividades, e não apenas programação. Atomicidade, proteção no serviço e separação dos acessos exigem preparação e verificação. A pressão de tempo não autoriza substituí-los por dados fictícios ou controles apenas visuais; se faltar tempo, a demonstração permanece incompleta até cumprir os critérios locais.
- **Comentários e conclusão:** a permissão geral de comentar termina na conclusão, para ambos os perfis. Registros obrigatórios de prioridade são exceção ao adiamento de histórico, mas não à imutabilidade dos comentários nem ao bloqueio após conclusão.
- **Crítica e julgamento:** exigir motivo preenchido não comprova bloqueio real. A avaliação é humana; não adicionar classificação por IA, análise automática do texto ou prazo implícito.
- **Concorrência:** atualizar a página é suficiente para acompanhar mudanças, mas não protege uma gravação. O serviço precisa conferir o estado vigente e recusar decisões baseadas em estado antigo, além de impedir comentário após conclusão e gravações parciais.
- **Permissão do gestor:** Rui poder criar um pedido não lhe permite ignorar regras de abertura. Poder revisar uma prioridade não autoriza editar o restante do registro nem administrar usuários.
- **Contagens e privacidade:** totais devem ser calculados dentro do mesmo acesso das consultas. O filtro atua apenas na lista. Mensagens de erro e dados de autoria também não podem revelar pedidos alheios.
- **Dependências operacionais:** conta administrativa e configuração do ambiente foram preparadas na implementação anterior e devem ser conferidas nesta pasta; URL publicada e QR code definitivo dependem da etapa de publicação autorizada. Não inventar credenciais ou link público. Os alunos não precisam de contas previamente provisionadas.

### 9.2. Suposições pequenas e reversíveis propostas

Estas escolhas detalham a apresentação ou uma solução técnica mínima; não são novas decisões de negócio. Podem ser revistas mantendo as regras e os critérios correspondentes.

| ID | Suposição proposta | Justificativa e limite |
| --- | --- | --- |
| S01 | Usar número legível no formato `DEM-` seguido de oito caracteres alfanuméricos, gerado de forma não sequencial pelo serviço, com unicidade garantida. | Permite reconhecer o pedido sem sugerir o volume global de demandas. O identificador interno continua separado; o formato não concede acesso nem promete sequência sem lacunas. |
| S02 | Remover espaços das extremidades de título, descrição, comentários e motivos antes de validar tamanho e salvar; preservar espaços e quebras internos. | Uniformiza a regra de texto útil. A remoção já é obrigatória para a justificativa de abertura Crítica; sua extensão aos demais textos é reversível, mantendo os limites definidos. |
| S03 | Exibir data e hora no formato brasileiro e no fuso do navegador, informando o fuso utilizado na interface. | Facilita leitura local sem mudar o instante confiável gerado pelo serviço. O fuso de apresentação não é uma regra de prazo ou SLA. |
| S04 | Usar um marcador de versão que mude a cada alteração de situação ou prioridade da demanda. | Permite detectar revisões desatualizadas, inclusive mudanças intermediárias que retornem ao mesmo valor, sem criar histórico completo. Comentários comuns são registros separados e não alteram esses campos. O mecanismo concreto será escolhido no desenvolvimento. |
| S05 | Unificar a mensagem de detalhe inexistente e detalhe sem permissão; manter explicação de ação proibida quando a demanda já for acessível. | Evita confirmar a existência de pedidos alheios e ainda orienta a pessoa. Não muda as permissões. |
| S06 | Após abertura bem-sucedida, levar aos detalhes com confirmação e número; oferecer ação simples de atualizar a consulta. | Completa a jornada sem acrescentar uma tela de confirmação ou exigir tempo real. |
| S07 | Em falha de comunicação com resultado incerto, orientar a consultar antes de repetir o envio. | Evita afirmar que nada foi salvo quando a confirmação não chegou. Não acrescenta garantia geral de deduplicação. |
| S08 | Usar uma credencial aleatória por navegador, armazenando só seu hash em tabela privada própria. | Isola participantes sem criar usuários no Auth compartilhado; não oferece recuperação por e-mail nem expiração automática nesta versão. A credencial pode ser revogada pelo operador do banco. |

### 9.3. Decisões confirmadas e dependências

**P01 confirmada pelo instrutor:** alunos entram apenas com e-mail; histórico no mesmo navegador. Outro navegador inicia um cadastro independente e vazio, mesmo com e-mail repetido. Perder a sessão não apaga os dados já salvos, mas não há recuperação nesta versão. Login e senha permanecem exclusivos do administrador.

**Ambiente confirmado pelo instrutor:** usar o projeto, prefixo e schema privado definidos no `.env` local por `SUPABASE_PROJECT_REF`, `SUPABASE_DATABASE_PREFIX` e `SUPABASE_PRIVATE_SCHEMA`. A conta administrativa escolhida é indicada por `ADMIN_EMAIL`, com perfil próprio da dinâmica vinculado à conta Auth existente. A conta GitHub escolhida é indicada por `GITHUB_ACCOUNT`. Os valores reais permanecem fora deste documento. Não reutilizar tabelas, perfis ou regras de outras aplicações. O perfil administrativo desta dinâmica é atribuído separadamente. Verificar políticas existentes antes de habilitar novos mecanismos globais de autenticação.

Não há decisão de produto pendente. Em 24/10/2026, a estrutura da Central foi preservada e seus objetos foram removidos do banco por pedido do instrutor para reconstrução em aula. A conta administrativa do Auth foi mantida; seu vínculo próprio deverá ser provisionado novamente após a recriação. Consulte o [README](../README.md) para o estado e as evidências e o [AGENTS.md](../AGENTS.md) para a autorização atual de CI/CD. A reconstrução começa somente quando solicitada; esses registros não dispensam os critérios de aceite deste PRD.

## 10. Sequência curta sugerida para construir e verificar o produto

Sequência do desenvolvimento local autorizado; a publicação continua sendo uma etapa separada.

1. **Revisar e preparar.** Aplicar P01 confirmada, conferir suposições, obter acesso ao Supabase autorizado definido no `.env` e provisionar apenas o administrador. Preparar ambiente local e versionamento sem segredos.
2. **Estabelecer dados e acesso.** Preparar cadastro imediato por e-mail, vínculo de acesso do participante conforme P01 e login administrativo separado. Aplicar permissões, transições, distinção dos comentários, atomicidade e controle de concorrência no serviço. Verificar que o fluxo público jamais concede administração.
3. **Completar entrada, abertura e consulta.** Construir identificação apenas por e-mail, lista inicialmente vazia, formulário, detalhes, filtro e contagens; login e saída apenas para o administrador. Conectar ao Supabase real e verificar persistência, validações, abertura Crítica atômica e acesso restrito.
4. **Completar o atendimento.** Adicionar comentários, revisão justificada de prioridade e avanço de situação. Verificar decisões visíveis, proibições de edição/exclusão, falhas parciais e gravações a partir de telas desatualizadas.
5. **Verificar a versão local e observar o uso.** Executar CA-L01 a CA-L26 com participantes em navegadores separados e o administrador autenticado, incluindo tentativas diretas e o caso de e-mail repetido conforme P01. Conferir celular, teclado e estados; observar a história completa.
6. **Preparar a demonstração publicada em etapa separada.** Após verificação local e pedido para publicar, hospedar na Vercel, obter a URL do solicitante e gerar o QR code e o link escrito para projeção. Executar CA-P01 a CA-P03, inclusive leitura em celular e entrada na rede da turma. Registrar o que passou, falhou ou ficou sem verificação.
