# 📐 Instruções de Organização de Tipos (Types)

Este documento define o padrão obrigatório para organização de **tipos TypeScript** no projeto.

O objetivo é:
- Melhorar legibilidade
- Evitar duplicação
- Facilitar manutenção e reaproveitamento
- Manter pages e components mais limpos

---

## ✅ Regra principal

❗ **NENHUM tipo de response de API ou props de componente deve ser declarado diretamente dentro de pages ou components.**

Todos os tipos devem ficar **centralizados na pasta `types/`**.

---
## 🌐 Regra obrigatória para chamadas de API

### 1️⃣ Arquivos `.tsx` (pages e components)

❗ **Toda chamada de API em arquivos `.tsx` deve usar exclusivamente:**

```ts
fetch('/api/...')
que esse fetch vai chamar pages/api que la vai usar a instancia do axios, siga o padrão 