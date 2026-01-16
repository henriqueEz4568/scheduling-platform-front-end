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