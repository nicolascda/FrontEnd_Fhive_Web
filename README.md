# FHIVE Web

Interface web da plataforma **Fhive**, um projeto voltado à organização e ao acompanhamento de dispositivos conectados (IoT).

O front-end reúne páginas institucionais e um ambiente de demonstração com recursos para:

- organizar equipamentos por equipe;
- consultar informações e indicadores dos dispositivos;
- comparar dados por equipamento e período;
- criar rotinas com dias, horários e ações em sequência;
- visualizar cenários e equipamentos em ambientes tridimensionais;
- gerenciar integrantes, permissões e configurações das equipes.

## Tecnologias

- React
- TypeScript
- Vite
- React Router
- Three.js e React Three Fiber
- Swiper
- Lucide React e React Icons

## Executar o projeto

Instale as dependências:

```bash
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Gere a versão de produção:

```bash
npm run build
```

Execute a análise estática:

```bash
npm run lint
```

## Integração com o backend

As telas que exigem autenticação, persistência ou dados de equipamentos utilizam chamadas HTTP para rotas relativas da aplicação. Para utilizar essas funções com dados reais, o backend correspondente deve estar disponível e configurado no ambiente de execução.

Quando não há equipamentos cadastrados, algumas áreas exibem informações demonstrativas locais para apresentar a interface. Esses valores servem apenas para demonstração e não representam medições de dispositivos físicos.

# Créditos e licenças dos modelos 3D

Os modelos abaixo foram fornecidos no pacote `dados.zip` e são carregados localmente pelo frontend do FHIVE.

| Arquivo no projeto | Modelo | Criador | Licença | Fonte |
|---|---|---|---|---|
| `industria/conversor.glb` | Low-Poly Conveyor for SCADA & HMI | bucbucket | Creative Commons Attribution 4.0 (CC BY 4.0) | https://sketchfab.com/3d-models/low-poly-conveyor-for-scada-hmi-fe72a89566b04b45b79d3e9297a6a5cf |
| `industria/ArCondicionado_industrial.glb` | Industrial Air Conditioner | HusarL | Creative Commons Attribution 4.0 (CC BY 4.0) | https://sketchfab.com/3d-models/industrial-air-conditioner-82797367c2b94fb1981e556577a3c898 |
| `industria/braco_robo.glb` | Industrial Robot | Arkady Gribachev | Creative Commons Attribution-NonCommercial 4.0 (CC BY-NC 4.0) | https://sketchfab.com/3d-models/industrial-robot-74017754d6d443a1bc258da98b08e6fc |
| `escola/cadeira.glb` | Student Desk & Chair | Darren McNerney 3D | Creative Commons Attribution 4.0 (CC BY 4.0) | https://sketchfab.com/3d-models/student-desk-chair-9c4695584b084eeabee757ce36e68863 |
| `escola/laptop.glb` | Laptop 3d model | Mda3d | Creative Commons Attribution 4.0 (CC BY 4.0) | https://sketchfab.com/3d-models/laptop-3d-model-3dc2b2db47d84d428f44b41e807f2ae9 |
| `saude/cama_hospital.glb` | Hospital Bed | Logan S. | Creative Commons Attribution 4.0 (CC BY 4.0) | https://sketchfab.com/3d-models/hospital-bed-50bbd85b31284005b09cc5ee03563f74 |
| `saude/monitor.glb` | VitaCore-X - medical equipment | Brian Trepanier | Creative Commons Attribution 4.0 (CC BY 4.0) | https://sketchfab.com/3d-models/vitacore-x-medical-equipment-137fab1732d04990b896aca769cd39fe |

## Atenção à licença do braço robótico

O arquivo `industria/braco_robo.glb` está identificado como CC BY-NC 4.0. Essa licença restringe o uso comercial. Ele foi integrado ao protótipo conforme solicitado, mas deve ser substituído por um modelo com licença compatível ou usado mediante autorização expressa do criador antes de qualquer distribuição/uso comercial do FHIVE.

Para os arquivos CC BY 4.0, mantenha os créditos acima em qualquer distribuição do projeto e consulte os termos da licença antes de redistribuir versões modificadas dos modelos.
