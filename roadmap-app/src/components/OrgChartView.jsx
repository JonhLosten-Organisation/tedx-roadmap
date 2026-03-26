import React, { useEffect, useRef, useState } from 'react'
import {
  Users,
  UserPlus,
  FolderPlus,
  Trash2,
  Edit2,
  ChevronRight,
  Briefcase,
  Plus,
  PlusCircle,
  Save,
  X,
  GripVertical,
  User,
  Camera,
  Palette,
} from 'lucide-react'

const MemberCard = ({
  member,
  serviceId,
  isAdmin,
  serviceColor,
  editingItem,
  setEditingItem,
  deleteItem,
  handleDragStart,
  updateItem,
}) => {
  const fileInputRef = useRef(null)

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        updateItem('member', member.id, serviceId, { avatar: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  if (
    editingItem &&
    String(editingItem.id) === String(member.id) &&
    editingItem.type === 'member'
  ) {
    return (
      <div className="animate-scale-in z-30 flex min-w-[160px] flex-col gap-2 rounded-xl border border-white/20 bg-black/90 p-3 shadow-2xl backdrop-blur-xl sm:min-w-[180px]">
        <input
          autoFocus
          className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold text-white outline-none"
          defaultValue={member.name}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.stopPropagation()
              updateItem('member', member.id, serviceId, { name: e.target.value })
            }
            if (e.key === 'Escape') {
              e.stopPropagation()
              setEditingItem(null)
            }
          }}
          onClick={(e) => e.stopPropagation()}
        />
        <input
          className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[9px] italic text-white/60 outline-none"
          defaultValue={member.role}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.stopPropagation()
              const nameInput = e.currentTarget.parentElement.querySelector('input')
              updateItem('member', member.id, serviceId, {
                name: nameInput.value,
                role: e.target.value,
              })
            }
          }}
          onClick={(e) => e.stopPropagation()}
        />
        <div className="flex items-center justify-between px-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setEditingItem(null)
            }}
            className="text-[8px] font-bold uppercase text-white/40 hover:text-white"
          >
            Annuler
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              const inputs = e.currentTarget.parentElement.parentElement.querySelectorAll('input')
              updateItem('member', member.id, serviceId, {
                name: inputs[0].value,
                role: inputs[1].value,
              })
              setEditingItem(null)
            }}
            className="text-[8px] font-bold uppercase text-ted-red hover:text-white"
          >
            Enregistrer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="group/card relative rounded-lg border border-white/5 bg-white/5 p-1.5 shadow-sm transition-all hover:border-white/20 sm:p-2"
      style={{
        borderLeftColor: member.isLeader ? '#FF0000' : serviceColor || '#ffffff20',
        borderLeftWidth: '3px',
      }}
      draggable={isAdmin}
      onDragStart={(e) => {
        e.stopPropagation()
        handleDragStart('member', member.id, serviceId)
      }}
    >
      <div className="flex items-center gap-2">
        <div className="group/avatar relative shrink-0">
          <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/10 shadow-inner sm:h-8 sm:w-8">
            {member.avatar ? (
              <img src={member.avatar} alt={member.name} className="h-full w-full object-cover" />
            ) : (
              <User size={14} className="text-white/30" />
            )}
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current.click()
              }}
              aria-label="Modifier la photo du membre"
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity group-hover/avatar:opacity-100"
            >
              <Camera size={10} className="text-white" />
            </button>
          )}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handlePhotoUpload}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-bold uppercase leading-tight tracking-wide text-white sm:text-[11px]">
            {member.name}
          </p>
          <p className="truncate text-[8px] font-black uppercase italic tracking-widest text-white/80 sm:text-[9px]">
            {member.role}
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover/card:opacity-100">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setEditingItem({
                  id: String(member.id),
                  type: 'member',
                  serviceId: String(serviceId),
                })
              }}
              aria-label="Modifier le membre"
              className="p-1 text-ted-muted hover:text-white"
            >
              <Edit2 size={10} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                deleteItem('member', member.id, serviceId)
              }}
              aria-label="Supprimer le membre"
              className="p-1 text-ted-muted hover:text-ted-red"
            >
              <Trash2 size={10} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const ServiceNode = ({
  service,
  isRoot = false,
  level = 0,
  isAdmin,
  editingItem,
  setEditingItem,
  draggedItem,
  handleDragStart,
  handleDragEnd,
  handleDragOver,
  handleDrop,
  updateItem,
  addService,
  deleteItem,
  addMember,
}) => {
  const fileInputRef = useRef(null)
  const serviceColor = service.color || (isRoot ? '#002B5B' : '#ffffff20')

  const handleManagerPhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        updateItem('service', service.id, null, { managerAvatar: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const colors = ['#002B5B', '#00A8E8', '#FF0000', '#FF9F00', '#4CAF50', '#9C27B0', '#333333']

  return (
    <div
      className={`relative flex animate-premium-entry flex-col items-center ${!isRoot ? 'mt-6 sm:mt-8' : ''}`}
    >
      {!isRoot && (
        <div
          className="absolute left-1/2 top-[-24px] h-6 w-px bg-white/20 sm:top-[-32px] sm:h-8"
          style={{ backgroundColor: serviceColor + '40' }}
        ></div>
      )}

      <div
        className={`group/service-header relative mb-6 flex flex-col items-center transition-all duration-300 sm:mb-8 ${draggedItem && draggedItem.id === String(service.id) ? 'scale-95 opacity-20 grayscale' : 'scale-100 opacity-100'}`}
        onDragOver={handleDragOver}
        onDrop={(e) => {
          e.stopPropagation()
          handleDrop('service', service.id)
        }}
      >
        {editingItem &&
        String(editingItem.id) === String(service.id) &&
        editingItem.type === 'service' ? (
          <div className="animate-scale-in z-50 flex min-w-[200px] flex-col gap-3 rounded-xl border border-white/20 bg-black/95 p-4 shadow-2xl backdrop-blur-3xl sm:min-w-[220px]">
            <p className="text-center text-[9px] font-bold uppercase tracking-widest text-ted-muted">
              Titre du Service
            </p>
            <input
              autoFocus
              className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-center text-xs font-bold text-white outline-none"
              defaultValue={service.name}
              onKeyDown={(e) =>
                e.key === 'Enter' &&
                updateItem('service', service.id, null, { name: e.target.value })
              }
            />

            <p className="mt-2 text-center text-[9px] font-bold uppercase tracking-widest text-ted-muted">
              Responsable
            </p>
            <input
              className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-center text-[10px] text-white outline-none"
              placeholder="Nom Prénom"
              defaultValue={service.managerName}
              onChange={(e) =>
                updateItem('service', service.id, null, { managerName: e.target.value })
              }
            />
            <input
              className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-center text-[9px] italic text-white/60 outline-none"
              placeholder="Rôle / Titre"
              defaultValue={service.managerRole}
              onChange={(e) =>
                updateItem('service', service.id, null, { managerRole: e.target.value })
              }
            />

            <p className="mt-2 text-center text-[9px] font-bold uppercase tracking-widest text-ted-muted">
              Couleur du Pôle
            </p>
            <div className="flex justify-center gap-1">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={(e) => {
                    e.stopPropagation()
                    updateItem('service', service.id, null, { color: c })
                  }}
                  className={`h-4 w-4 rounded-full border transition-all ${serviceColor === c ? 'scale-110 border-white' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setEditingItem(null)
                }}
                className="text-[9px] font-bold uppercase text-white/40 hover:text-white"
              >
                Annuler
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setEditingItem(null)
                }}
                className="rounded-lg bg-ted-red px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest text-white shadow-lg shadow-ted-red/20 transition-all hover:bg-ted-accent"
              >
                Enregistrer
              </button>
            </div>
          </div>
        ) : (
          <div
            className="group/handle relative flex flex-col items-center gap-2"
            draggable={isAdmin && !isRoot}
            onDragStart={(e) => {
              e.stopPropagation()
              handleDragStart('service', service.id)
            }}
            onDragEnd={handleDragEnd}
          >
            <div
              className={`relative flex flex-col items-center rounded-3xl border p-3 shadow-lg transition-all duration-300 hover:translate-y-[-2px] sm:p-4 ${isRoot ? 'min-w-[240px] border-ted-red/30 bg-ted-red/10 sm:min-w-[280px]' : 'min-w-[170px] sm:min-w-[200px]'}`}
              style={{
                backgroundColor: !isRoot ? serviceColor || 'rgba(255,255,255,0.05)' : undefined,
                borderColor: isRoot ? undefined : 'rgba(255,255,255,0.08)',
              }}
            >
              {isAdmin && !isRoot && (
                <div className="absolute left-2 top-2 cursor-grab text-white/10 active:cursor-grabbing group-hover/handle:text-white/40">
                  <GripVertical size={14} />
                </div>
              )}

              <div className="flex w-full flex-col items-center gap-3">
                <h3
                  className={`w-full border-b border-white/10 pb-2 text-center font-bebas uppercase tracking-[2px] text-white ${isRoot ? 'mb-1 text-lg opacity-100 sm:text-xl' : 'text-xs opacity-70 sm:text-sm'}`}
                >
                  {service.name}
                </h3>

                {/* Manager Section */}
                <div
                  className={`flex w-full flex-col items-center gap-2 rounded-2xl border border-white/5 bg-white/5 p-2 shadow-inner ${isRoot ? 'bg-white/10 py-3 sm:py-4' : ''}`}
                >
                  <div className="group/manager-avatar relative shrink-0">
                    <div
                      className={`flex items-center justify-center overflow-hidden rounded-full border-2 border-white/20 bg-white/10 text-white shadow-lg ${isRoot ? 'h-14 w-14 sm:h-16 sm:w-16' : 'h-10 w-10 sm:h-12 sm:w-12'}`}
                    >
                      {service.managerAvatar ? (
                        <img
                          src={service.managerAvatar}
                          alt={service.managerName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User size={isRoot ? 32 : 24} />
                      )}
                    </div>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          fileInputRef.current.click()
                        }}
                        aria-label="Modifier la photo du responsable"
                        className="absolute inset-0 z-10 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity group-hover/manager-avatar:opacity-100"
                      >
                        <Camera size={isRoot ? 14 : 12} className="text-white" />
                      </button>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleManagerPhotoUpload}
                    />
                  </div>
                  <div className="text-center">
                    <p
                      className={`font-black uppercase tracking-wider text-white ${isRoot ? 'text-[12px] sm:text-[13px]' : 'text-[10px] sm:text-[11px]'}`}
                    >
                      {service.managerName || 'NOM PRÉNOM'}
                    </p>
                    <p
                      className={`font-bold uppercase italic tracking-tighter ${isRoot ? 'text-[9px] text-white/60 sm:text-[10px]' : 'text-[8px] text-ted-red sm:text-[9px]'}`}
                    >
                      {service.managerRole || 'RESPONSABLE'}
                    </p>
                  </div>
                </div>

                {/* Members List */}
                <div className="mt-1 w-full space-y-1.5">
                  {service.members?.map((member) => (
                    <MemberCard
                      key={member.id}
                      member={member}
                      serviceId={service.id}
                      isAdmin={isAdmin}
                      serviceColor={serviceColor}
                      editingItem={editingItem}
                      updateItem={updateItem}
                      deleteItem={deleteItem}
                      setEditingItem={setEditingItem}
                      handleDragStart={handleDragStart}
                    />
                  ))}
                  {isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        addMember(service.id)
                      }}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/5 py-1.5 text-[8px] font-bold uppercase text-white/20 transition-all hover:border-white/20 hover:text-white/40"
                    >
                      <Plus size={10} /> Nouveau
                    </button>
                  )}
                </div>
              </div>
            </div>

            {isAdmin && (
              <div className="z-20 flex gap-1 rounded-lg border border-white/10 bg-black/60 p-1 opacity-0 shadow-sm backdrop-blur-md transition-opacity group-hover/service-header:opacity-100">
                <button
                  type="button"
                  aria-label="Modifier le pôle"
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingItem({ id: String(service.id), type: 'service' })
                  }}
                  className="p-1 hover:text-white"
                >
                  <Edit2 size={10} />
                </button>
                <button
                  type="button"
                  aria-label="Ajouter un sous-pôle"
                  onClick={(e) => {
                    e.stopPropagation()
                    addService(service.id)
                  }}
                  className="p-1 hover:text-ted-red"
                >
                  <Plus size={10} />
                </button>
                {!isRoot && (
                  <button
                    type="button"
                    aria-label="Supprimer le pôle"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteItem('service', service.id)
                    }}
                    className="p-1 hover:text-ted-red"
                  >
                    <Trash2 size={10} />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {service.subServices?.length > 0 && (
          <div className="absolute bottom-[-32px] h-8 w-px bg-white/10"></div>
        )}
      </div>

      {service.subServices?.length > 0 && (
        <div className="flex min-w-max flex-wrap items-start justify-center gap-4 px-3 sm:gap-8 sm:px-8">
          {service.subServices?.map((sub) => (
            <ServiceNode
              key={sub.id}
              service={sub}
              level={level + 1}
              isAdmin={isAdmin}
              editingItem={editingItem}
              setEditingItem={setEditingItem}
              draggedItem={draggedItem}
              handleDragStart={handleDragStart}
              handleDragEnd={handleDragEnd}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              updateItem={updateItem}
              addService={addService}
              deleteItem={deleteItem}
              addMember={addMember}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const OrgChartView = ({ orgData, setOrgData, isAdmin }) => {
  const [editingItem, setEditingItem] = useState(null)
  const [draggedItem, setDraggedItem] = useState(null)

  const didInitRootRef = useRef(false)

  useEffect(() => {
    if (didInitRootRef.current) return
    if (!orgData?.services || orgData.services.length === 0) {
      const rootService = {
        id: 'root-service',
        name: 'DIRECTION GÉNÉRALE',
        color: '#002B5B',
        members: [],
        subServices: [],
      }
      setOrgData({ ...orgData, services: [rootService] })
      didInitRootRef.current = true
    }
  }, [orgData, setOrgData])

  const findAndModify = (services, id, task) => {
    if (!services) return []
    return services.map((s) => {
      if (String(s.id) === String(id)) return task(s)
      if (s.subServices && s.subServices.length > 0) {
        return { ...s, subServices: findAndModify(s.subServices, id, task) }
      }
      return s
    })
  }

  const addService = (parentId) => {
    const newService = {
      id: Date.now().toString(),
      name: 'Nouveau Service',
      managerName: '',
      managerRole: 'RESPONSABLE',
      managerAvatar: null,
      color: '#00A8E8',
      members: [],
      subServices: [],
    }
    const newServices = findAndModify(orgData.services, parentId, (s) => ({
      ...s,
      subServices: [...(s.subServices || []), newService],
    }))
    setOrgData({ ...orgData, services: newServices })
  }

  const addMember = (serviceId) => {
    const newMember = {
      id: Date.now().toString(),
      name: 'COLLABORATEUR',
      role: 'MISSION',
      avatar: null,
    }
    const newServices = findAndModify(orgData.services, serviceId, (s) => ({
      ...s,
      members: [...(s.members || []), newMember],
    }))
    setOrgData({ ...orgData, services: newServices })
  }

  const updateItem = (type, id, serviceId, newData) => {
    let newServices
    if (type === 'service') {
      newServices = findAndModify(orgData.services, id, (s) => ({ ...s, ...newData }))
    } else if (type === 'member') {
      newServices = findAndModify(orgData.services, serviceId, (s) => ({
        ...s,
        members: (s.members || []).map((m) =>
          String(m.id) === String(id) ? { ...m, ...newData } : m,
        ),
      }))
    }
    setOrgData({ ...orgData, services: newServices })
  }

  const deleteItem = (type, id, serviceId) => {
    if (!window.confirm('Supprimer cet élément ?')) return
    let newServices
    if (type === 'service') {
      if (String(id) === 'root-service') return alert('Action impossible.')
      const recursiveDelete = (services) => {
        if (!services) return []
        return services
          .filter((s) => String(s.id) !== String(id))
          .map((s) => ({
            ...s,
            subServices: s.subServices ? recursiveDelete(s.subServices) : [],
          }))
      }
      newServices = recursiveDelete(orgData.services)
    } else if (type === 'member') {
      newServices = findAndModify(orgData.services, serviceId, (s) => ({
        ...s,
        members: (s.members || []).filter((m) => String(m.id) !== String(id)),
      }))
    }
    setOrgData({ ...orgData, services: newServices })
    setEditingItem(null)
  }

  const handleDragStart = (type, id, sourceServiceId) => {
    if (!isAdmin) return
    setDraggedItem({ type, id, sourceServiceId })
  }

  const handleDragEnd = () => setDraggedItem(null)
  const handleDragOver = (e) => isAdmin && e.preventDefault()

  const handleDrop = (targetType, targetId) => {
    if (!isAdmin || !draggedItem) return
    if (String(targetId) === String(draggedItem.id)) return

    let newServices = JSON.parse(JSON.stringify(orgData.services))

    const findItem = (services, type, id) => {
      for (let s of services) {
        if (type === 'service' && String(s.id) === String(id)) return s
        if (s.members) {
          for (let m of s.members) {
            if (type === 'member' && String(m.id) === String(id)) return m
          }
        }
        if (s.subServices) {
          const found = findItem(s.subServices, type, id)
          if (found) return found
        }
      }
      return null
    }

    const removeItem = (services, type, id) => {
      if (type === 'service') {
        const filtered = (services || []).filter((s) => String(s.id) !== String(id))
        return filtered.map((s) => ({
          ...s,
          subServices: removeItem(s.subServices || [], type, id),
        }))
      }
      return (services || []).map((s) => ({
        ...s,
        members: (s.members || []).filter((m) =>
          type === 'member' ? String(m.id) !== String(id) : true,
        ),
        subServices: s.subServices ? removeItem(s.subServices, type, id) : [],
      }))
    }

    const itemToMove = findItem(newServices, draggedItem.type, draggedItem.id)
    if (!itemToMove) return setDraggedItem(null)

    newServices = removeItem(newServices, draggedItem.type, draggedItem.id)

    if (draggedItem.type === 'member' && targetType === 'service') {
      newServices = findAndModify(newServices, targetId, (s) => ({
        ...s,
        members: [...(s.members || []), itemToMove],
      }))
    } else if (draggedItem.type === 'service' && targetType === 'service') {
      newServices = findAndModify(newServices, targetId, (s) => ({
        ...s,
        subServices: [...(s.subServices || []), itemToMove],
      }))
    }

    setOrgData({ ...orgData, services: newServices })
    setDraggedItem(null)
  }

  if (!orgData?.services) return null

  return (
    <div className="scrollbar-premium w-full overflow-x-auto overscroll-x-contain px-3 pb-28 sm:px-4 sm:pb-32 md:px-12">
      <div className="flex flex-col items-center">
        {orgData.services.map((service) => (
          <ServiceNode
            key={service.id}
            service={service}
            isRoot={true}
            level={0}
            isAdmin={isAdmin}
            editingItem={editingItem}
            setEditingItem={setEditingItem}
            draggedItem={draggedItem}
            handleDragStart={handleDragStart}
            handleDragEnd={handleDragEnd}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
            updateItem={updateItem}
            addService={addService}
            deleteItem={deleteItem}
            addMember={addMember}
          />
        ))}
      </div>

      <style>{`
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in {
          animation: scale-in 0.15s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

export default OrgChartView
