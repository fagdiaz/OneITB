import React, { useState } from 'react';
import { Skill, Language } from '../../types/resume';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface SkillsLanguagesFormProps {
  skills: Skill[];
  onChangeSkills: (skills: Skill[]) => void;
  languages: Language[];
  onChangeLanguages: (languages: Language[]) => void;
}

export const SkillsLanguagesForm: React.FC<SkillsLanguagesFormProps> = ({
  skills,
  onChangeSkills,
  languages,
  onChangeLanguages
}) => {
  const [newSkillText, setNewSkillText] = useState('');

  // Skills Handlers
  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newSkillText.trim();
    if (!trimmed) return;
    
    // Check for duplicates
    if (skills.some(s => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setNewSkillText('');
      return;
    }

    const newSkill: Skill = {
      id: `sk-${Date.now()}`,
      name: trimmed,
      hidden: false
    };
    onChangeSkills([...skills, newSkill]);
    setNewSkillText('');
  };

  const handleRemoveSkill = (id: string) => {
    onChangeSkills(skills.filter(s => s.id !== id));
  };

  const handleToggleSkillHide = (id: string) => {
    const updated = skills.map((s) => {
      if (s.id === id) {
        return { ...s, hidden: !s.hidden };
      }
      return s;
    });
    onChangeSkills(updated);
  };

  // Languages Handlers
  const handleAddLanguage = () => {
    const newLang: Language = {
      id: `lang-${Date.now()}`,
      name: '',
      level: '',
      hidden: false
    };
    onChangeLanguages([...languages, newLang]);
  };

  const handleRemoveLanguage = (id: string) => {
    onChangeLanguages(languages.filter(l => l.id !== id));
  };

  const handleToggleLanguageHide = (id: string) => {
    const updated = languages.map((l) => {
      if (l.id === id) {
        return { ...l, hidden: !l.hidden };
      }
      return l;
    });
    onChangeLanguages(updated);
  };

  const handleChangeLanguage = (id: string, field: keyof Language, value: any) => {
    const updated = languages.map((lang) => {
      if (lang.id === id) {
        return { ...lang, [field]: value };
      }
      return lang;
    });
    onChangeLanguages(updated);
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Skills Section */}
      <div className="bg-white p-5 border border-slate-200 rounded-lg space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
          Habilidades / Conocimientos
        </h3>
        
        <form onSubmit={handleAddSkill} className="flex gap-2">
          <Input
            id="new-skill-input"
            value={newSkillText}
            onChange={(e) => setNewSkillText(e.target.value)}
            placeholder="Ej. React, TypeScript, Inglés C1..."
            className="flex-1"
          />
          <Button type="submit" variant="secondary" className="whitespace-nowrap">
            Añadir
          </Button>
        </form>

        {skills.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">
            No se han agregado habilidades. Escribe una arriba y haz clic en "Añadir".
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 pt-2">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded border transition-all duration-200 select-none ${
                  skill.hidden 
                    ? 'bg-amber-50 text-amber-700 border-amber-200/60 opacity-65' 
                    : 'bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                {skill.name} {skill.hidden && <span className="text-[10px] text-amber-600 font-bold">(Oculto)</span>}
                <button
                  type="button"
                  onClick={() => handleToggleSkillHide(skill.id)}
                  className="text-slate-400 hover:text-amber-700 focus:outline-none transition-colors ml-0.5"
                  title={skill.hidden ? "Mostrar en PDF" : "Ocultar en PDF"}
                >
                  {skill.hidden ? '👁️' : '👁️‍🗨️'}
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill.id)}
                  className="text-slate-400 hover:text-red-500 font-bold ml-0.5 focus:outline-none transition-colors"
                  title={`Eliminar ${skill.name}`}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Languages Section */}
      <div className="bg-white p-5 border border-slate-200 rounded-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Idiomas
          </h3>
          <Button type="button" variant="secondary" size="sm" onClick={handleAddLanguage}>
            + Agregar
          </Button>
        </div>

        {languages.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">
            No se ha agregado ningún idioma.
          </p>
        ) : (
          <div className="space-y-4">
            {languages.map((lang, index) => (
              <div key={lang.id} className={`flex gap-3 items-end border-b border-slate-50 pb-4 last:border-b-0 last:pb-0 transition-opacity duration-200 ${lang.hidden ? 'opacity-65' : ''}`}>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    label={index === 0 ? "Idioma" : undefined}
                    id={`lang-name-${lang.id}`}
                    value={lang.name}
                    onChange={(e) => handleChangeLanguage(lang.id, 'name', e.target.value)}
                    placeholder="Ej. Español"
                    className="h-9"
                  />
                  <Input
                    label={index === 0 ? "Nivel" : undefined}
                    id={`lang-lvl-${lang.id}`}
                    value={lang.level}
                    onChange={(e) => handleChangeLanguage(lang.id, 'level', e.target.value)}
                    placeholder="Ej. Nativo, B2, Avanzado"
                    className="h-9"
                  />
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    type="button"
                    variant={lang.hidden ? 'ghost' : 'secondary'}
                    size="sm"
                    className={`h-9 px-2.5 ${lang.hidden ? '!bg-amber-50 !text-amber-700 !border-amber-100 hover:!bg-amber-100' : ''}`}
                    onClick={() => handleToggleLanguageHide(lang.id)}
                  >
                    {lang.hidden ? 'Mostrar' : 'Ocultar'}
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    className="h-9 px-3"
                    onClick={() => handleRemoveLanguage(lang.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
