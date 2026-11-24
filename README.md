# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
"# FrontEnd_Fhive_Web" 


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
