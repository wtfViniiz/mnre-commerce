import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@manauaradesign.com'
  const password = process.env.ADMIN_PASSWORD || 'admin123'
  const name = process.env.ADMIN_NAME || 'Administrador'

  try {
    // Verificar se já existe
    const existing = await prisma.user.findUnique({
      where: { email },
    })

    if (existing) {
      // Atualizar para admin se não for
      if (existing.role !== 'ADMIN') {
        await prisma.user.update({
          where: { id: existing.id },
          data: { role: 'ADMIN' },
        })
        console.log('✅ Usuário atualizado para ADMIN')
      } else {
        console.log('ℹ️  Usuário admin já existe')
      }
      return
    }

    // Criar novo admin
    const hashedPassword = await bcrypt.hash(password, 10)
    const admin = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'ADMIN',
      },
    })

    console.log('✅ Usuário admin criado com sucesso!')
    console.log(`📧 Email: ${email}`)
    console.log(`🔑 Senha: ${password}`)
    console.log('⚠️  Altere a senha após o primeiro login!')
  } catch (error) {
    console.error('❌ Erro ao criar admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()

