# Relatório de integração — Fhive Web

## Objetivo
Integrar as alterações de interface e apresentação da versão `FrontEnd_Fhive_Web_1.zip` sobre a base `FrontEnd_Fhive_Web.zip`, mantendo os arquivos exclusivos e os recursos de implantação da versão principal.

## Estratégia aplicada
- Base utilizada: `FrontEnd_Fhive_Web.zip` (main).
- Alterações visuais e de conteúdo da versão `_1` aplicadas nos arquivos compartilhados listados abaixo.
- Arquivos de documentação principal preservados; este relatório registra a integração sem substituir o README existente.
- Página de produtos integrada manualmente para combinar a composição revisada da versão `_1` com o download do aplicativo já existente na main.
- Dependências instaladas (`node_modules`) e metadados locais do Git não foram incluídos no pacote final. O código-fonte, configurações, recursos públicos e dependências declaradas foram mantidos.

## Recursos da main preservados
- `public/app-config.json`
- `public/downloads/FHIVE.apk`
- `src/imagens/CelularIntro.png`
- `src/imagens/CelularLogado.png`
- Seção de download do aplicativo Android, incluindo CTA e imagens de demonstração, reintegrada na página de produtos.
- `package.json` e `package-lock.json` da base principal.

## Arquivos compartilhados atualizados a partir da versão `_1`
- `index.html`
- `src/componentes/BarraNavegacaoOficial/index.tsx`
- `src/componentes/CardCompra/index.tsx`
- `src/componentes/CardCompra/styles.module.css`
- `src/componentes/CardRotina/index.tsx`
- `src/componentes/FooterBar/index.tsx`
- `src/componentes/FooterBar/styles.module.css`
- `src/componentes/GraficoEnergia/index.tsx`
- `src/componentes/ModalAnalise/index.tsx`
- `src/componentes/ModalCriarEquipe/index.tsx`
- `src/componentes/ModalCriarEquipe/styles.module.css`
- `src/componentes/ModalEntrarEquipe/index.tsx`
- `src/componentes/ModalGerenciarIntegrantes/index.tsx`
- `src/dados/dadoMockado.tsx`
- `src/dados/rotinasEquipe.ts`
- `src/paginas/ambienteAparelhos/index.tsx`
- `src/paginas/analiseDados/index.tsx`
- `src/paginas/configuracaoEquipe/index.tsx`
- `src/paginas/inicial/index.tsx`
- `src/paginas/inicial/styles.module.css`
- `src/paginas/login/index.tsx`
- `src/paginas/quemSomos/index.tsx`
- `src/paginas/registrar/index.tsx`
- `src/paginas/rotinas/index.tsx`
- `src/paginas/solucao/index.tsx`
- `src/secoes/Inicial/PrimeiraSecao/index.tsx`
- `src/secoes/Inicial/SegundaSecaoInicial/index.tsx`
- `src/secoes/Inicial/SegundaSecaoInicial/styles.module.css`
- `src/secoes/Produtos/PrimeiraSecao/index.tsx`
- `src/secoes/Produtos/SegundaSecao/index.tsx`
- `src/secoes/Produtos/SegundaSecao/style.module.css`

## Integração controlada
- `src/paginas/produtos/index.tsx`: composição e conteúdo da versão `_1`, com a seção de download da main preservada.
- `src/paginas/produtos/styles.module.css`: estilos atualizados da versão `_1`, acrescidos dos estilos responsivos da seção de download da main.
- `README.md`: mantido conforme a base principal.

## Instalação e validação local
Na pasta do projeto, execute:

```bash
npm ci
npm run build
npm run lint
```

A validação de build/lint deve ser repetida no ambiente de destino, com a versão de Node.js compatível com o projeto.
