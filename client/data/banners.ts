export interface Banner {
  id: string
  image: string
  title?: string
  description?: string
  link?: string
  alt: string
}

// Placeholder banners - substitua pelas suas imagens reais
// Coloque suas imagens na pasta public/banners/
export const banners: Banner[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1920&h=600&fit=crop',
    title: 'Novas Camisas Personalizadas',
    description: 'Crie sua camisa única com a qualidade Manauara Design',
    link: '/products?categoryId=2',
    alt: 'Banner de camisas personalizadas',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1920&h=600&fit=crop',
    title: 'Times de Futebol',
    description: 'Camisas oficiais dos principais times brasileiros',
    link: '/products?categoryId=1',
    alt: 'Banner de times de futebol',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1522276498395-f4f68f7f8454?w=1920&h=600&fit=crop',
    title: 'Promoção Especial',
    description: 'Frete grátis em compras acima de R$ 200',
    link: '/products',
    alt: 'Banner de promoção',
  },
]
