'use client'

import React, { useEffect, useState } from 'react'
import { DataTable } from '@/components/admin/DataTable'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import api from '@/lib/api'
import { Badge } from '@/components/ui/Badge'

interface User {
  id: string
  email: string
  name: string
  role: string
  createdAt: string
  _count: {
    orders: number
    reviews: number
    favorites: number
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadUsers()
  }, [page, search, roleFilter])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
      })
      const response = await api.get(`/admin/management/users?${params}`)
      setUsers(response.data.users)
      setTotalPages(response.data.pagination.pages)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.put(`/admin/management/users/${userId}`, { role: newRole })
      loadUsers()
    } catch (error) {
      alert('Erro ao atualizar usuário')
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Nome',
      render: (user: User) => (
        <div>
          <div className="font-medium">{user.name}</div>
          <div className="text-xs text-gray-500">{user.email}</div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (user: User) => (
        <select
          value={user.role}
          onChange={(e) => handleRoleChange(user.id, e.target.value)}
          className="px-2 py-1 border rounded text-sm"
        >
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      ),
    },
    {
      key: 'stats',
      header: 'Estatísticas',
      render: (user: User) => (
        <div className="text-xs text-gray-500">
          {user._count.orders} pedidos | {user._count.reviews} reviews | {user._count.favorites} favoritos
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Cadastrado em',
      render: (user: User) => new Date(user.createdAt).toLocaleDateString('pt-BR'),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
        <p className="text-gray-600 mt-1">Gerencie os usuários do sistema</p>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar usuários..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value)
            setPage(1)
          }}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">Todos os roles</option>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        emptyMessage="Nenhum usuário encontrado"
      />

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <span className="flex items-center px-4">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  )
}

