# Configuração do Sistema de Administração

## Passos para Configurar

### 1. Executar Migração do Prisma

```bash
cd server
npm run prisma:migrate -- --name add_admin_features
npm run prisma:generate
```

### 2. Criar Usuário Administrador

```bash
cd server
npm run create-admin
```

Ou configure no arquivo `.env`:
```
ADMIN_EMAIL=admin@manauaradesign.com
ADMIN_PASSWORD=senha_segura_aqui
ADMIN_NAME=Administrador
```

### 3. Acessar o Painel Admin

1. Faça login com as credenciais do admin criado
2. Acesse `/admin/dashboard`

## Funcionalidades Disponíveis

### Dashboard (`/admin/dashboard`)
- Métricas gerais (receita, pedidos, usuários, produtos)
- Gráficos de vendas e crescimento de usuários
- Estatísticas detalhadas

### Gestão de Produtos (`/admin/products`)
- Listar, editar e deletar produtos
- Buscar produtos
- Ver estatísticas de cada produto

### Gestão de Usuários (`/admin/users`)
- Listar usuários
- Alterar role (USER/ADMIN)
- Ver estatísticas de cada usuário

### Gestão de Pedidos (`/admin/orders`)
- Listar pedidos
- Filtrar por status
- Alterar status dos pedidos

### Gestão de Categorias (`/admin/categories`)
- Criar, editar e deletar categorias
- Definir categorias pais

### Segurança (`/admin/security`)
- Monitoramento de eventos de segurança
- Logs de segurança, auditoria e eventos
- Alertas em tempo real
- Detecção de SQL injection, XSS, força bruta

### Relatórios (`/admin/reports`)
- Exportar métricas em CSV/JSON
- Exportar logs em CSV/JSON
- Filtros por data

## Segurança

O sistema detecta automaticamente:
- Tentativas de SQL injection
- Tentativas de XSS
- Força bruta (múltiplos logins falhos)
- Requisições suspeitas

Todos os eventos são logados no banco de dados e em arquivos em `server/logs/`.

