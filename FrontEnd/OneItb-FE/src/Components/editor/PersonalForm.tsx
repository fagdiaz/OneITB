import React, { useRef } from 'react';
import { PersonalInfo } from '../../types/resume';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';

interface PersonalFormProps {
  personalInfo: PersonalInfo;
  summary: string;
  onChangePersonalInfo: (info: PersonalInfo) => void;
  onChangeSummary: (summary: string) => void;
}

export const PersonalForm: React.FC<PersonalFormProps> = ({
  personalInfo,
  summary,
  onChangePersonalInfo,
  onChangeSummary
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof PersonalInfo, value: string) => {
    onChangePersonalInfo({
      ...personalInfo,
      [field]: value
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate image size (< 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen es demasiado grande. Elige una de menos de 2MB.');
      return;
    }

    // 1. Manage local preview using URL.createObjectURL()
    const objectUrl = URL.createObjectURL(file);
    onChangePersonalInfo({
      ...personalInfo,
      profileImage: objectUrl
    });

    // 2. Convert to Base64 in background for permanent localStorage persistence
    const reader = new FileReader();
    reader.onload = () => {
      onChangePersonalInfo({
        ...personalInfo,
        profileImage: reader.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    onChangePersonalInfo({
      ...personalInfo,
      profileImage: undefined
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-white p-5 border border-slate-200 rounded-lg space-y-5">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
        Datos Personales y Perfil
      </h3>
      
      {/* Profile Image Uploader */}
      <div className="flex items-center gap-4 py-2 border-b border-slate-50">
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="relative w-[80px] h-[80px] rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-slate-100 transition-colors group"
          title="Subir foto de perfil"
        >
          {personalInfo.profileImage ? (
            <img 
              src={personalInfo.profileImage} 
              alt="Perfil" 
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-slate-400 text-xs font-semibold select-none group-hover:text-slate-600">FOTO</span>
          )}
        </div>
        <div className="space-y-1.5">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
          />
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="secondary" 
              size="sm" 
              onClick={() => fileInputRef.current?.click()}
            >
              Subir Foto
            </Button>
            {personalInfo.profileImage && (
              <Button 
                type="button" 
                variant="danger" 
                size="sm" 
                onClick={handleRemoveImage}
              >
                Eliminar
              </Button>
            )}
          </div>
          <p className="text-[10px] text-slate-400 italic">Soporta PNG, JPG. Tamaño de preview local optimizado.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nombre Completo"
          id="name"
          value={personalInfo.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Ej. Juan Pérez"
        />
        <Input
          label="Título Profesional"
          id="title"
          value={personalInfo.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Ej. Desarrollador Frontend"
        />
        <Input
          label="Email"
          id="email"
          type="email"
          value={personalInfo.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="Ej. juan.perez@email.com"
        />
        <Input
          label="Teléfono"
          id="phone"
          value={personalInfo.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder="Ej. +34 600 123 456"
        />
        <Input
          label="Ubicación"
          id="location"
          value={personalInfo.location}
          onChange={(e) => handleChange('location', e.target.value)}
          placeholder="Ej. Madrid, España"
        />
        <Input
          label="LinkedIn"
          id="linkedin"
          value={personalInfo.linkedin}
          onChange={(e) => handleChange('linkedin', e.target.value)}
          placeholder="linkedin.com/in/usuario"
        />
        <Input
          label="GitHub"
          id="github"
          value={personalInfo.github}
          onChange={(e) => handleChange('github', e.target.value)}
          placeholder="github.com/usuario"
        />
        <div className="md:col-span-2">
          <Input
            label="Sitio Web / Portfolio"
            id="website"
            value={personalInfo.website || ''}
            onChange={(e) => handleChange('website', e.target.value)}
            placeholder="Ej. alejandrosilva.dev"
          />
        </div>
      </div>

      <div className="pt-2">
        <Textarea
          label="Perfil Profesional / Resumen"
          id="summary"
          value={summary}
          onChange={(e) => onChangeSummary(e.target.value)}
          placeholder="Escribe una breve introducción sobre tu experiencia y habilidades principales..."
          rows={4}
        />
      </div>
    </div>
  );
};
