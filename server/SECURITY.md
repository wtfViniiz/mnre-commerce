# 🔒 Guia de Segurança - Manauara Design

Este documento descreve as medidas de segurança implementadas no sistema, seguindo padrões OWASP e PCI DSS para proteção de pagamentos.

## ✅ Medidas Implementadas

### 1. **Headers de Segurança (Helmet.js)**
- ✅ Content Security Policy (CSP)
- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ X-XSS-Protection
- ✅ Strict-Transport-Security (HSTS)
- ✅ Referrer-Policy
- ✅ Permissions-Policy

### 2. **Autenticação e Autorização**
- ✅ Hash de senhas com bcrypt (12 salt rounds)
- ✅ JWT com expiração curta (15 minutos para access token)
- ✅ Refresh tokens (7 dias)
- ✅ Proteção contra força bruta (5 tentativas)
- ✅ Validação de força de senha:
  - Mínimo 8 caracteres
  - 1 letra maiúscula
  - 1 letra minúscula
  - 1 número
  - 1 caractere especial

### 3. **Proteção contra Ataques**
- ✅ SQL Injection (detecção e bloqueio)
- ✅ XSS (Cross-Site Scripting) - detecção e sanitização
- ✅ CSRF Protection (implementado)
- ✅ Rate Limiting (100 req/min para rotas públicas, ilimitado para admin)
- ✅ Timing Attack Protection (comparação de senhas constante)

### 4. **Validação e Sanitização**
- ✅ Validação de inputs com express-validator
- ✅ Sanitização de strings (remoção de tags, scripts, etc.)
- ✅ Validação de email
- ✅ Validação de tipos de dados
- ✅ Limite de tamanho de requisições (10MB)

### 5. **Segurança de Pagamentos (Mercado Pago)**
- ✅ Validação de assinatura de webhook (HMAC SHA256)
- ✅ Autenticação obrigatória para rotas de pagamento
- ✅ Validação de dados de pagamento
- ✅ Prevenção de envio de dados sensíveis via API
- ✅ Logging de todas as transações

### 6. **Logging e Auditoria**
- ✅ Logs de segurança no banco de dados
- ✅ Logs de segurança em arquivos
- ✅ Audit logs para ações administrativas
- ✅ Logging de tentativas de login
- ✅ Logging de eventos de segurança

### 7. **CORS e Headers**
- ✅ CORS configurado com origem específica
- ✅ Credentials permitidos apenas para origem autorizada

## 📋 Práticas Recomendadas para Produção

### Variáveis de Ambiente Obrigatórias

```env
# JWT
JWT_SECRET=<gerar-secret-forte-com-64-caracteres>
JWT_REFRESH_SECRET=<gerar-secret-diferente>

# Database
DATABASE_URL=<url-do-banco>

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=<token-do-mercadopago>
MERCADOPAGO_WEBHOOK_SECRET=<webhook-secret>

# Server
NODE_ENV=production
CLIENT_URL=https://seu-dominio.com
PORT=5000

# Admin
ADMIN_EMAIL=admin@seu-dominio.com
ADMIN_PASSWORD=<senha-forte>
```

### Gerar Secrets Seguros

```bash
# Gerar JWT_SECRET
openssl rand -base64 64

# Gerar JWT_REFRESH_SECRET
openssl rand -base64 64

# Gerar MERCADOPAGO_WEBHOOK_SECRET
openssl rand -base64 64
```

### Checklist de Deploy

- [ ] Todas as variáveis de ambiente configuradas
- [ ] HTTPS habilitado e certificado SSL válido
- [ ] Firewall configurado
- [ ] Backups automáticos do banco de dados
- [ ] Monitoramento de logs ativo
- [ ] Rate limiting ajustado para produção
- [ ] Secrets em gerenciador seguro (AWS Secrets Manager, etc)
- [ ] Database com senha forte
- [ ] Acesso SSH apenas com chaves
- [ ] Updates de segurança regulares

## 🚨 Resposta a Incidentes

### Em caso de ataque detectado:

1. **IPs bloqueados** são automaticamente registrados no banco
2. **Eventos de segurança** são logados com severidade
3. **Admin pode visualizar** logs em `/admin/security`
4. **Alertas** aparecem no dashboard administrativo

### Monitoramento

- Verificar `/admin/security` regularmente
- Revisar logs de segurança diariamente
- Configurar alertas para eventos CRITICAL
- Manter backups atualizados

## 📚 Referências

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [PCI DSS Requirements](https://www.pcisecuritystandards.org/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

