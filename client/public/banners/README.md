# Banners do Carrossel

Para adicionar banners ao carrossel da homepage:

1. Adicione suas imagens de banner na pasta `public/banners/`
2. As imagens devem ter as dimensões recomendadas: **1920x600px** (ou proporção similar)
3. Atualize o arquivo `client/data/banners.ts` com os novos banners

Exemplo de banner:
```typescript
{
  id: '1',
  image: '/banners/banner-1.jpg',
  title: 'Título do Banner',
  description: 'Descrição opcional',
  link: '/products', // Link opcional
  alt: 'Texto alternativo para acessibilidade',
}
```

**Formatos suportados:** JPG, PNG, WebP
**Tamanho recomendado:** Máximo 2MB por imagem para melhor performance

