# Melhores do Ano 2026

Coleta de indicações da reta final com as 22 categorias do PDF `Melhores_do_Ano_2026_Dossie.pdf`. O módulo começa desligado em todos os grupos e funciona independentemente das partidas. Não aparece nas imagens, nos menus dos jogos, em `ajuda` ou em `ajuda texto`.

## Comandos

| Comando | Quem usa | Resultado |
| --- | --- | --- |
| `ativar melhores do ano` | Admin do bot | Abre a coleta no grupo |
| `desativar melhores do ano` | Admin do bot | Fecha a coleta sem apagar o histórico |
| `ajuda melhores do ano` | Qualquer participante | Ajuda exclusiva e lista das 22 categorias |
| `indicar mensagem` | Participante, durante a coleta | Indica a mensagem de texto à qual respondeu |
| `indicar "texto" "autor"` | Participante, durante a coleta | Registra declaração manual |
| `indicar mensagem categoria 10` | Participante, durante a coleta | Indica a resposta para Pérola do Ano |
| `indicar "texto" "autor" categoria 22` | Participante, durante a coleta | Indica manualmente para Lá Ele |
| `indicações melhores do ano` | Qualquer participante | Primeira página do histórico |
| `indicações melhores do ano 2` | Qualquer participante | Próxima página (cinco registros por página) |
| `classificar indicação 1 categoria 10` | Admin do bot | Define ou corrige a categoria do registro #1 |

Sem categoria, a indicação fica **a classificar**; o admin pode organizá-la depois, mesmo com a coleta fechada. Para categorias por pessoa, envie o motivo e o nome da pessoa; para Melhor Nome do Grupo, envie o nome sugerido e seu autor.

O admin é o já configurado em `ADMIN_NUMBERS`, inclusive seus aliases, não qualquer administrador do WhatsApp. Sem verificador explícito de permissão, a ativação é negada. Comandos no privado não acessam o módulo. Ativar/desativar jogos não altera a coleta e ativar a coleta não ativa os jogos. Não há prazo automático: o responsável controla a abertura e o encerramento.

## Origem e persistência

Na Evolution, uma resposta fornece o texto e o ID da mensagem original e o JID do autor. Se o nome do autor não estiver disponível, o bot exibe seu identificador precedido por `@`; ele não atribui a frase a quem fez a indicação. Mensagens temporárias são suportadas. Mídia sem texto, prints e mensagens cujo contexto não veio no webhook precisam da forma manual. O adaptador Z-API atual usa a indicação manual, pois não fornece o texto e autor originais ao motor.

A declaração manual não equivale a uma prova verificada. O histórico distingue as origens, guarda quem indicou e quando, e é isolado por grupo. Texto limitado a 1000 caracteres e autor a 120. A mesma mensagem respondida só entra uma vez; na forma manual, texto e autor iguais (sem distinguir maiúsculas e espaços repetidos) também não se repetem. A categoria não muda essa identidade. Correções de categoria não removem a proteção contra duplicatas.

`awards_groups` guarda a ativação e quem a alterou; `awards_nominations` guarda as indicações. A migração existente cria ambas automaticamente no Neon, sem alterar os dados dos jogos. Inserções usam restrições únicas e trava compartilhada no estado da coleta, evitando duplicação e perda de registros em concorrência. Sem `DATABASE_URL`/`POSTGRES_URL`, o armazenamento em memória é apenas temporário, como o restante do simulador.

O módulo não importa os candidatos ou as odds do PDF, não executa apostas/votações, não distribui pontos e não integra o site Oscar mencionado no dossiê. O PDF é a fonte das categorias; as indicações desta coleta são novos registros.

## Validação

`npm run typecheck`, `npm test` e `npm run build`. Em ambientes sem sockets Unix, execute a mesma suíte com `node --import tsx --test tests/*.test.ts` para evitar o IPC do CLI `tsx`.
