import { useState } from 'react'
import { Check, Pencil, X } from 'lucide-react'
import { Input } from '@/shared/ui/input'
import { IconButton } from '@/shared/ui/icon-button'
import { showToast } from '@/shared/lib/toast'
import { useSensorNicknamesStore } from '@/shared/stores/sensor-nicknames-store'

interface SensorNameEditorProps {
  devEUI: string
  /** Nome exibido hoje — já é o apelido, quando existe um. */
  name: string
}

export const SensorNameEditor = ({ devEUI, name }: SensorNameEditorProps) => {
  const setNickname = useSensorNicknamesStore((s) => s.setNickname)
  const hasNickname = useSensorNicknamesStore((s) => !!s.nicknames[devEUI])

  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(name)

  const startEditing = () => {
    setValue(name)
    setEditing(true)
  }

  const save = () => {
    setNickname(devEUI, value)
    setEditing(false)
    showToast.success(
      value.trim() === '' ? 'Nome original restaurado.' : 'Apelido do sensor atualizado.',
    )
  }

  if (!editing) {
    return (
      <div className="flex min-w-0 items-center gap-1.5">
        <span className="truncate font-display text-sm font-semibold text-fg">{name}</span>
        <IconButton
          icon={Pencil}
          label={`Editar apelido de ${name}`}
          size="sm"
          onClick={startEditing}
        />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      <Input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') save()
          if (e.key === 'Escape') setEditing(false)
        }}
        placeholder={hasNickname ? 'Vazio restaura o nome original' : 'Apelido do sensor'}
        aria-label="Apelido do sensor"
        className="py-1.5 text-sm"
      />
      <IconButton icon={Check} label="Salvar apelido" variant="primary" size="sm" onClick={save} />
      <IconButton
        icon={X}
        label="Cancelar edição"
        size="sm"
        onClick={() => setEditing(false)}
      />
    </div>
  )
}
