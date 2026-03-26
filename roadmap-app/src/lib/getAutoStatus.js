export function getAutoStatus(axe) {
  const today = new Date().toISOString().split('T')[0]
  const progress = Number.parseInt(axe?.progress || 0, 10)

  if (progress >= 100) return { label: 'Terminé', type: 'done' }
  if (axe?.endDate && axe.endDate < today) return { label: 'En retard', type: 'key' }
  if (progress > 0 || (axe?.startDate && axe.startDate <= today))
    return { label: 'En cours', type: 'prep' }
  return { label: 'À faire', type: 'todo' }
}
