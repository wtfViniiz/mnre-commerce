import { MercadoPagoConfig, Preference } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
  options: {
    timeout: 5000,
    idempotencyKey: 'abc',
  },
})

const preference = new Preference(client)

export interface CreatePreferenceParams {
  items: Array<{
    title: string
    quantity: number
    unit_price: number
    currency_id?: string
  }>
  payer?: {
    name?: string
    email?: string
  }
  back_urls?: {
    success?: string
    failure?: string
    pending?: string
  }
  auto_return?: 'approved' | 'all'
  external_reference?: string
}

export const createPreference = async (params: CreatePreferenceParams) => {
  try {
    const response = await preference.create({
      body: {
        items: params.items.map((item) => ({
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unit_price,
          currency_id: item.currency_id || 'BRL',
        })),
        payer: params.payer,
        back_urls: params.back_urls || {
          success: `${process.env.CLIENT_URL || 'http://localhost:3000'}/orders`,
          failure: `${process.env.CLIENT_URL || 'http://localhost:3000'}/checkout`,
          pending: `${process.env.CLIENT_URL || 'http://localhost:3000'}/orders`,
        },
        auto_return: params.auto_return || 'approved',
        external_reference: params.external_reference,
      },
    })

    return response
  } catch (error) {
    console.error('Erro ao criar preferência Mercado Pago:', error)
    throw error
  }
}

export const getPayment = async (paymentId: string) => {
  try {
    // Usar API REST do Mercado Pago para buscar pagamento
    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Erro ao buscar pagamento')
    }

    return await response.json()
  } catch (error) {
    console.error('Erro ao buscar pagamento:', error)
    throw error
  }
}

