import React, { useState, useRef } from 'react';
import { Users, UserPlus, FolderPlus, Trash2, Edit2, ChevronRight, Briefcase, Plus, PlusCircle, Save, X, GripVertical, User, Camera, Palette } from 'lucide-react';

const MemberCard = ({ member, serviceId, isAdmin, serviceColor, editingItem, setEditingItem, deleteItem, handleDragStart, updateItem }) => {
  const fileInputRef = useRef(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateItem('member', member.id, serviceId, { avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  if (editingItem && String(editingItem.id) === String(member.id) && editingItem.type === 'member') {
    return (
      <div className="flex flex-col gap-2 bg-black/90 border border-white/20 p-3 rounded-xl backdrop-blur-xl z-30 shadow-2xl animate-scale-in min-w-[180px]">
        <input 
          autoFocus
          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-bold text-white outline-none w-full"
          defaultValue={member.name}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.stopPropagation();
              updateItem('member', member.id, serviceId, { name: e.target.value });
            }
            if (e.key === 'Escape') {
              e.stopPropagation();
              setEditingItem(null);
            }
          }}
          onClick={(e) => e.stopPropagation()}
        />
        <input 
          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[9px] text-white/60 outline-none w-full italic"
          defaultValue={member.role}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.stopPropagation();
              const nameInput = e.currentTarget.parentElement.querySelector('input');
              updateItem('member', member.id, serviceId, { name: nameInput.value, role: e.target.value });
            }
          }}
          onClick={(e) => e.stopPropagation()}
        />
        <div className="flex justify-between items-center px-1">
          <button onClick={(e) => { e.stopPropagation(); setEditingItem(null); }} className="text-[8px] uppercase font-bold text-white/40 hover:text-white">Annuler</button>
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              const inputs = e.currentTarget.parentElement.parentElement.querySelectorAll('input');
              updateItem('member', member.id, serviceId, { name: inputs[0].value, role: inputs[1].value });
            }} 
            className="text-[8px] uppercase font-bold text-ted-red hover:text-white"
          >
            Enregistrer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative p-2 rounded-lg border transition-all group/card bg-white/5 border-white/5 hover:border-white/20 shadow-sm"
      style={{ borderLeftColor: member.isLeader ? '#FF0000' : (serviceColor || '#ffffff20'), borderLeftWidth: '3px' }}
      draggable={isAdmin}
      onDragStart={(e) => { e.stopPropagation(); handleDragStart('member', member.id, serviceId); }}
    >
      <div className="flex items-center gap-2">
        <div className="relative group/avatar shrink-0">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/10 shadow-inner">
            {member.avatar ? (
              <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
            ) : (
              <User size={14} className="text-white/30" />
            )}
          </div>
          {isAdmin && (
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}
              className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center rounded-full transition-opacity"
            >
              <Camera size={10} className="text-white" />
            </button>
          )}
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-white truncate leading-tight uppercase tracking-wide">{member.name}</p>
          <p className="text-[9px] text-white/80 italic truncate uppercase tracking-widest font-black">{member.role}</p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover/card:opacity-100 transition-opacity">
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); setEditingItem({ id: String(member.id), type: 'member', serviceId: String(serviceId) }); }}
              className="p-1 text-ted-muted hover:text-white"
            >
              <Edit2 size={10}/>
            </button>
            <button 
              type="button" 
              onClick={(e) => { e.stopPropagation(); deleteItem('member', member.id, serviceId); }} 
              className="p-1 text-ted-muted hover:text-ted-red"
            >
              <Trash2 size={10}/>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ServiceNode = ({ service, isRoot = false, level = 0, isAdmin, editingItem, setEditingItem, draggedItem, handleDragStart, handleDragEnd, handleDragOver, handleDrop, updateItem, addService, deleteItem, addMember }) => {
  const fileInputRef = useRef(null);
  const serviceColor = service.color || (isRoot ? '#002B5B' : '#ffffff20');

  const handleManagerPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateItem('service', service.id, null, { managerAvatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const colors = ['#002B5B', '#00A8E8', '#FF0000', '#FF9F00', '#4CAF50', '#9C27B0', '#333333'];

  return (
    <div className={`flex flex-col items-center animate-premium-entry relative ${!isRoot ? 'mt-8' : ''}`}>
      {!isRoot && (
        <div 
          className="absolute top-[-32px] left-1/2 w-px h-8 bg-white/20"
          style={{ backgroundColor: serviceColor + '40' }}
        ></div>
      )}

      <div 
        className={`relative group/service-header mb-8 flex flex-col items-center transition-all duration-300 ${draggedItem && draggedItem.id === String(service.id) ? 'opacity-20 scale-95 grayscale' : 'opacity-100 scale-100'}`}
        onDragOver={handleDragOver}
        onDrop={(e) => { e.stopPropagation(); handleDrop('service', service.id); }}
      >
        {editingItem && String(editingItem.id) === String(service.id) && editingItem.type === 'service' ? (
          <div className="flex flex-col gap-3 bg-black/95 border border-white/20 p-4 rounded-xl backdrop-blur-3xl z-50 shadow-2xl animate-scale-in min-w-[220px]">
            <p className="text-[9px] uppercase font-bold text-ted-muted tracking-widest text-center">Titre du Service</p>
            <input 
              autoFocus
              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs font-bold text-white text-center outline-none w-full"
              defaultValue={service.name}
              onKeyDown={(e) => e.key === 'Enter' && updateItem('service', service.id, null, { name: e.target.value })}
            />
            
            <p className="text-[9px] uppercase font-bold text-ted-muted tracking-widest text-center mt-2">Responsable</p>
            <input 
              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-white text-center outline-none w-full"
              placeholder="Nom Prénom"
              defaultValue={service.managerName}
              onChange={(e) => updateItem('service', service.id, null, { managerName: e.target.value })}
            />
            <input 
              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[9px] text-white/60 text-center outline-none w-full italic"
              placeholder="Rôle / Titre"
              defaultValue={service.managerRole}
              onChange={(e) => updateItem('service', service.id, null, { managerRole: e.target.value })}
            />
            
            <p className="text-[9px] uppercase font-bold text-ted-muted tracking-widest text-center mt-2">Couleur du Pôle</p>
            <div className="flex justify-center gap-1">
              {colors.map(c => (
                <button 
                  key={c}
                  onClick={(e) => { e.stopPropagation(); updateItem('service', service.id, null, { color: c }); }}
                  className={`w-4 h-4 rounded-full border transition-all ${serviceColor === c ? 'border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            
            <div className="flex justify-center mt-2">
               <button 
                onClick={(e) => { e.stopPropagation(); setEditingItem(null); }}
                className="text-[9px] uppercase font-bold text-white/40 hover:text-white"
              >
                Fermer
              </button>
            </div>
          </div>
        ) : (
          <div 
            className="flex flex-col items-center gap-2 relative group/handle"
            draggable={isAdmin && !isRoot}
            onDragStart={(e) => { e.stopPropagation(); handleDragStart('service', service.id); }}
            onDragEnd={handleDragEnd}
          >
            <div 
              className={`flex flex-col items-center p-4 rounded-3xl border shadow-lg relative transition-all duration-300 hover:translate-y-[-2px] ${isRoot ? 'min-w-[280px] bg-ted-red/10 border-ted-red/30' : 'min-w-[200px]'}`}
              style={{ backgroundColor: !isRoot ? (serviceColor || 'rgba(255,255,255,0.05)') : undefined, borderColor: isRoot ? undefined : 'rgba(255,255,255,0.08)' }}
            >
              {isAdmin && !isRoot && (
                <div className="absolute top-2 left-2 text-white/10 group-hover/handle:text-white/40 cursor-grab active:cursor-grabbing">
                  <GripVertical size={14} />
                </div>
              )}
              
              <div className="w-full flex flex-col items-center gap-3">
                <h3 className={`font-bebas tracking-[2px] text-white uppercase text-center border-b border-white/10 pb-2 w-full ${isRoot ? 'text-xl opacity-100 mb-1' : 'text-sm opacity-70'}`}>
                  {service.name}
                </h3>

                {/* Manager Section */}
                <div className={`flex flex-col items-center gap-2 w-full p-2 rounded-2xl bg-white/5 border border-white/5 shadow-inner ${isRoot ? 'py-4 bg-white/10' : ''}`}>
                  <div className="relative group/manager-avatar shrink-0">
                    <div className={`rounded-full bg-white/10 flex items-center justify-center border-2 border-white/20 overflow-hidden shadow-lg text-white ${isRoot ? 'w-16 h-16' : 'w-12 h-12'}`}>
                      {service.managerAvatar ? (
                        <img src={service.managerAvatar} alt={service.managerName} className="w-full h-full object-cover" />
                      ) : (
                        <User size={isRoot ? 32 : 24} />
                      )}
                    </div>
                    {isAdmin && (
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover/manager-avatar:opacity-100 flex items-center justify-center rounded-full transition-opacity z-10"
                      >
                        <Camera size={isRoot ? 14 : 12} className="text-white" />
                      </button>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleManagerPhotoUpload} />
                  </div>
                  <div className="text-center">
                    <p className={`font-black text-white uppercase tracking-wider ${isRoot ? 'text-[13px]' : 'text-[11px]'}`}>{service.managerName || 'NOM PRÉNOM'}</p>
                    <p className={`uppercase font-bold tracking-tighter italic ${isRoot ? 'text-[10px] text-white/60' : 'text-[9px] text-ted-red'}`}>{service.managerRole || 'RESPONSABLE'}</p>
                  </div>
                </div>
                
                {/* Members List */}
                <div className="mt-1 space-y-1.5 w-full">
                  {service.members?.map(member => (
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
                      onClick={(e) => { e.stopPropagation(); addMember(service.id); }}
                      className="w-full py-1.5 border border-dashed border-white/5 rounded-lg text-[8px] uppercase font-bold text-white/20 hover:border-white/20 hover:text-white/40 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Plus size={10} /> Nouveau
                    </button>
                  )}
                </div>
              </div>
            </div>
            </div>
            
            {isAdmin && (
              <div className="flex gap-1 opacity-0 group-hover/service-header:opacity-100 transition-opacity bg-black/60 p-1 rounded-lg border border-white/10 backdrop-blur-md z-20 shadow-sm">
                <button type="button" onClick={(e) => { e.stopPropagation(); setEditingItem({ id: String(service.id), type: 'service' }); }} className="p-1 hover:text-white"><Edit2 size={10}/></button>
                <button type="button" onClick={(e) => { e.stopPropagation(); addService(service.id); }} className="p-1 hover:text-ted-red"><Plus size={10}/></button>
                {!isRoot && (
                  <button type="button" onClick={(e) => { e.stopPropagation(); deleteItem('service', service.id); }} className="p-1 hover:text-ted-red"><Trash2 size={10}/></button>
                )}
              </div>
            )}
          </div>
        )}
        
        {service.subServices?.length > 0 && (
          <div className="absolute bottom-[-32px] w-px h-8 bg-white/10"></div>
        )}
      </div>

      {service.subServices?.length > 0 && (
        <div className="flex flex-wrap justify-center items-start gap-8 min-w-max px-8">
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
  );
};

const OrgChartView = ({ orgData, setOrgData, isAdmin }) => {
  const [editingItem, setEditingItem] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);

  React.useEffect(() => {
    if (!orgData?.services || orgData.services.length === 0) {
      const rootService = { 
        id: 'root-service', 
        name: 'DIRECTION GÉNÉRALE', 
        color: '#002B5B',
        members: [], 
        subServices: [] 
      };
      setOrgData({ ...orgData, services: [rootService] });
    }
  }, []);

  const findAndModify = (services, id, task) => {
    if (!services) return [];
    return services.map(s => {
      if (String(s.id) === String(id)) return task(s);
      if (s.subServices && s.subServices.length > 0) {
        return { ...s, subServices: findAndModify(s.subServices, id, task) };
      }
      return s;
    });
  };

  const addService = (parentId) => {
    const newService = { 
      id: Date.now().toString(), 
      name: 'Nouveau Service', 
      managerName: '',
      managerRole: 'RESPONSABLE',
      managerAvatar: null,
      color: '#00A8E8',
      members: [], 
      subServices: [] 
    };
    const newServices = findAndModify(orgData.services, parentId, (s) => ({ ...s, subServices: [...(s.subServices || []), newService] }));
    setOrgData({ ...orgData, services: newServices });
  };

  const addMember = (serviceId) => {
    const newMember = { id: Date.now().toString(), name: 'COLLABORATEUR', role: 'MISSION', avatar: null };
    const newServices = findAndModify(orgData.services, serviceId, (s) => ({
      ...s,
      members: [...(s.members || []), newMember]
    }));
    setOrgData({ ...orgData, services: newServices });
  };

  const updateItem = (type, id, serviceId, newData) => {
    let newServices;
    if (type === 'service') {
      newServices = findAndModify(orgData.services, id, (s) => ({ ...s, ...newData }));
    } else if (type === 'member') {
      newServices = findAndModify(orgData.services, serviceId, (s) => ({
        ...s,
        members: (s.members || []).map(m => String(m.id) === String(id) ? { ...m, ...newData } : m)
      }));
    }
    setOrgData({ ...orgData, services: newServices });
  };

  const deleteItem = (type, id, serviceId) => {
    if (!window.confirm('Supprimer cet élément ?')) return;
    let newServices;
    if (type === 'service') {
      if (String(id) === 'root-service') return alert('Action impossible.');
      const recursiveDelete = (services) => {
        if (!services) return [];
        return services
          .filter(s => String(s.id) !== String(id))
          .map(s => ({
            ...s,
            subServices: s.subServices ? recursiveDelete(s.subServices) : []
          }));
      };
      newServices = recursiveDelete(orgData.services);
    } else if (type === 'member') {
      newServices = findAndModify(orgData.services, serviceId, (s) => ({
        ...s,
        members: (s.members || []).filter(m => String(m.id) !== String(id))
      }));
    }
    setOrgData({ ...orgData, services: newServices });
    setEditingItem(null);
  };

  const handleDragStart = (type, id, sourceServiceId) => {
    if (!isAdmin) return;
    setDraggedItem({ type, id, sourceServiceId });
  };

  const handleDragEnd = () => setDraggedItem(null);
  const handleDragOver = (e) => isAdmin && e.preventDefault();

  const handleDrop = (targetType, targetId) => {
    if (!isAdmin || !draggedItem) return;
    if (String(targetId) === String(draggedItem.id)) return;

    let newServices = JSON.parse(JSON.stringify(orgData.services));

    const findItem = (services, type, id) => {
      for (let s of services) {
        if (type === 'service' && String(s.id) === String(id)) return s;
        if (s.members) {
          for (let m of s.members) {
            if (type === 'member' && String(m.id) === String(id)) return m;
          }
        }
        if (s.subServices) {
          const found = findItem(s.subServices, type, id);
          if (found) return found;
        }
      }
      return null;
    };

    const removeItem = (services, type, id) => {
      if (type === 'service') {
        const filtered = (services || []).filter(s => String(s.id) !== String(id));
        return filtered.map(s => ({ ...s, subServices: removeItem(s.subServices || [], type, id) }));
      }
      return (services || []).map(s => ({
        ...s,
        members: (s.members || []).filter(m => type === 'member' ? String(m.id) !== String(id) : true),
        subServices: s.subServices ? removeItem(s.subServices, type, id) : []
      }));
    };

    const itemToMove = findItem(newServices, draggedItem.type, draggedItem.id);
    if (!itemToMove) return setDraggedItem(null);

    newServices = removeItem(newServices, draggedItem.type, draggedItem.id);

    if (draggedItem.type === 'member' && targetType === 'service') {
      newServices = findAndModify(newServices, targetId, (s) => ({
        ...s,
        members: [...(s.members || []), itemToMove]
      }));
    } else if (draggedItem.type === 'service' && targetType === 'service') {
      newServices = findAndModify(newServices, targetId, (s) => ({
        ...s,
        subServices: [...(s.subServices || []), itemToMove]
      }));
    }

    setOrgData({ ...orgData, services: newServices });
    setDraggedItem(null);
  };

  if (!orgData?.services) return null;

  return (
    <div className="pb-32 w-full overflow-x-auto scrollbar-premium px-12">
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
  );
};

export default OrgChartView;
