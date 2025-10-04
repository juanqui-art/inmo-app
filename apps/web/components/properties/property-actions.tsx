/**
 * PROPERTY ACTIONS
 * Botones de acciones para editar/eliminar propiedad
 */

'use client'

import { Button } from '@repo/ui'
import { Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import { deletePropertyAction } from '@/app/actions/properties'

interface PropertyActionsProps {
  propertyId: string
}

export function PropertyActions({ propertyId }: PropertyActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = () => {
    if (!showConfirm) {
      setShowConfirm(true)
      return
    }

    startTransition(async () => {
      const result = await deletePropertyAction(propertyId)
      if (result.error) {
        alert(result.error)
      }
    })
  }

  return (
    <div className="flex gap-2">
      <Link href={`/dashboard/propiedades/${propertyId}/editar`} className="flex-1">
        <Button variant="outline" className="w-full" size="sm">
          <Pencil className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </Link>

      <Button
        variant={showConfirm ? 'destructive' : 'outline'}
        size="sm"
        onClick={handleDelete}
        disabled={isPending}
        className="flex-1"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        {isPending ? 'Eliminando...' : showConfirm ? 'Confirmar' : 'Eliminar'}
      </Button>

      {showConfirm && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowConfirm(false)}
          disabled={isPending}
        >
          Cancelar
        </Button>
      )}
    </div>
  )
}
