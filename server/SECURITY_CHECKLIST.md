# ✅ Checklist de Segurança - Produção

## Antes de Fazer Deploy

### 🔐 Secrets e Variáveis de Ambiente

- [ ] `JWT_SECRET` gerado com `openssl rand -base64 64`
- [ ] `JWT_REFRESH_SECRET` gerado (diferente do JWT_SECRET)
- [ ] `NEXTAUTH_SECRET` gerado
- [ ] `MERCADOPAGO_WEBHOOK_SECRET` configurado
- [ ] `NODE_ENV=production` definido
- [ ] `DATABASE_URL` configurado (não use SQLite em produção!)
- [ ] Todas as variáveis do `.env.example` configuradas

### 🌐 HTTPS e Certificados

- [ ] Certificado SSL válido instalado
- [ ] HTTPS habilitado e funcionando
- [ ] Redirecionamento HTTP → HTTPS configurado
- [ ] HSTS habilitado (já configurado no código)

### 🗄️ Banco de Dados

- [ ] **NÃO use SQLite em produção!** Use PostgreSQL ou MySQL
- [ ] Backup automático configurado
- [ ] Senha forte do banco de dados
- [ ] Conexão criptografada (SSL/TLS)
- [ ] Acesso restrito (apenas servidor pode acessar)

### 🔒 Segurança da Aplicação

- [ ] Firewall configurado (portas 80, 443 abertas apenas)
- [ ] Rate limiting ajustado para produção
- [ ] Logs sendo monitorados
- [ ] Alertas configurados para eventos críticos
- [ ] Admin criado com senha forte
- [ ] Primeiro admin alterou senha padrão

### 🔑 Mercado Pago

- [ ] Token de acesso configurado
- [ ] Webhook secret configurado
- [ ] Webhook URL configurado no painel Mercado Pago
- [ ] Testado em sandbox antes de produção

### 📦 Dependências

- [ ] `npm audit` executado e vulnerabilidades corrigidas
- [ ] Dependências atualizadas
- [ ] Build de produção testado

### 🧪 Testes de Segurança

- [ ] Testado login com senha fraca (deve ser rejeitado)
- [ ] Testado SQL injection (deve ser bloqueado)
- [ ] Testado XSS (deve ser bloqueado)
- [ ] Testado rate limiting
- [ ] Testado CSRF protection
- [ ] Testado refresh token mechanism

## Após Deploy

### 📊 Monitoramento

- [ ] Dashboard de segurança acessível
- [ ] Logs sendo coletados
- [ ] Alertas funcionando
- [ ] Métricas de segurança sendo monitoradas

### 🔄 Manutenção Contínua

- [ ] Revisar logs de segurança semanalmente
- [ ] Atualizar dependências mensalmente
- [ ] Rotacionar secrets trimestralmente
- [ ] Fazer backup do banco diariamente
- [ ] Revisar e atualizar políticas de segurança

## 🚨 Em Caso de Incidente

1. **Bloquear IPs suspeitos** - via painel admin
2. **Revisar logs** - identificar padrões
3. **Alterar secrets** - se necessário
4. **Notificar usuários** - se dados foram comprometidos
5. **Documentar incidente** - para análise futura

## 📞 Contatos de Emergência

- **Suporte Técnico**: [adicionar]
- **Segurança**: [adicionar]
- **Mercado Pago**: [adicionar]

---

**Última atualização**: ${new Date().toLocaleDateString('pt-BR')}

