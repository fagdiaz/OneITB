import React from 'react';
import { Project } from '../../types/resume';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';

interface ProjectsFormProps {
  projects: Project[];
  onChangeProjects: (projects: Project[]) => void;
}

export const ProjectsForm: React.FC<ProjectsFormProps> = ({
  projects,
  onChangeProjects
}) => {
  const handleAddItem = () => {
    const newItem: Project = {
      id: `proj-${Date.now()}`,
      name: '',
      role: '',
      startDate: '',
      endDate: '',
      url: '',
      description: '',
      hidden: false
    };
    onChangeProjects([...projects, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    onChangeProjects(projects.filter((item) => item.id !== id));
  };

  const handleToggleHide = (id: string) => {
    const updated = projects.map((item) => {
      if (item.id === id) {
        return { ...item, hidden: !item.hidden };
      }
      return item;
    });
    onChangeProjects(updated);
  };

  const handleChangeItem = (id: string, field: keyof Project, value: any) => {
    const updated = projects.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onChangeProjects(updated);
  };

  return (
    <div className="bg-white p-5 border border-slate-200 rounded-lg space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
          Proyectos Destacados
        </h3>
        <Button type="button" variant="secondary" size="sm" onClick={handleAddItem}>
          + Agregar
        </Button>
      </div>

      {projects.length === 0 ? (
        <p className="text-xs text-slate-400 italic py-2">
          No se ha agregado ningún proyecto.
        </p>
      ) : (
        <div className="space-y-6">
          {projects.map((item, index) => (
            <div key={item.id} className={`relative border-b border-slate-100 pb-6 last:border-b-0 last:pb-0 transition-opacity duration-200 ${item.hidden ? 'opacity-65' : ''}`}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-slate-400">
                  Proyecto #{index + 1} {item.hidden && <span className="text-amber-600 font-bold ml-1.5">(Oculto en PDF)</span>}
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={item.hidden ? 'ghost' : 'secondary'}
                    size="sm"
                    onClick={() => handleToggleHide(item.id)}
                    className={item.hidden ? '!bg-amber-50 !text-amber-700 !border-amber-100 hover:!bg-amber-100' : ''}
                  >
                    {item.hidden ? 'Mostrar' : 'Ocultar'}
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre del Proyecto"
                  id={`proj-name-${item.id}`}
                  value={item.name}
                  onChange={(e) => handleChangeItem(item.id, 'name', e.target.value)}
                  placeholder="Ej. E-commerce API"
                />
                <Input
                  label="Rol en el Proyecto"
                  id={`proj-role-${item.id}`}
                  value={item.role}
                  onChange={(e) => handleChangeItem(item.id, 'role', e.target.value)}
                  placeholder="Ej. Desarrollador backend único"
                />
                <Input
                  label="Fecha de Inicio"
                  id={`proj-start-${item.id}`}
                  value={item.startDate}
                  onChange={(e) => handleChangeItem(item.id, 'startDate', e.target.value)}
                  placeholder="Ej. AAAA-MM"
                />
                <Input
                  label="Fecha de Fin"
                  id={`proj-end-${item.id}`}
                  value={item.endDate}
                  onChange={(e) => handleChangeItem(item.id, 'endDate', e.target.value)}
                  placeholder="Ej. AAAA-MM o Presente"
                />
                <div className="md:col-span-2">
                  <Input
                    label="URL del Proyecto / Repositorio (Opcional)"
                    id={`proj-url-${item.id}`}
                    value={item.url}
                    onChange={(e) => handleChangeItem(item.id, 'url', e.target.value)}
                    placeholder="github.com/usuario/proyecto"
                  />
                </div>
                <div className="md:col-span-2">
                  <Textarea
                    label="Descripción del Proyecto / Tecnologías usadas"
                    id={`proj-desc-${item.id}`}
                    value={item.description}
                    onChange={(e) => handleChangeItem(item.id, 'description', e.target.value)}
                    placeholder="Detalla el impacto del proyecto, tecnologías clave y qué resolviste..."
                    rows={2}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
