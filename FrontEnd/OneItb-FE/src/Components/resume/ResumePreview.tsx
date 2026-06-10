import React, { useState, useRef, useEffect } from 'react';
import { CVData } from '../../types/resume';

interface ResumePreviewProps {
  data: CVData;
  activeTheme: 'graphite' | 'deepTeal' | 'navyInk' | 'mutedOlive';
}

// Configurable, highly desaturated, editorial-grade corporate themes
const ACCENT_THEMES = {
  graphite: {
    name: 'Gris Grafito',
    accentBar: 'bg-slate-500',
    titleText: 'text-slate-800',
    titleLine: 'bg-slate-200',
    secondaryText: 'text-slate-500'
  },
  deepTeal: {
    name: 'Teal Profundo',
    accentBar: 'bg-teal-700',
    titleText: 'text-teal-900',
    titleLine: 'bg-teal-900/20',
    secondaryText: 'text-teal-850/70'
  },
  navyInk: {
    name: 'Navy Ink',
    accentBar: 'bg-indigo-900',
    titleText: 'text-indigo-900',
    titleLine: 'bg-indigo-900/20',
    secondaryText: 'text-indigo-950/60'
  },
  mutedOlive: {
    name: 'Verde Sage',
    accentBar: 'bg-emerald-800',
    titleText: 'text-emerald-900',
    titleLine: 'bg-emerald-900/20',
    secondaryText: 'text-emerald-950/60'
  }
};

export const ResumePreview = React.forwardRef<HTMLDivElement, ResumePreviewProps>(
  ({ data, activeTheme }, ref) => {
    const { personalInfo, summary, experience, education, projects, skills, languages } = data;

    // Filter visible items that are not explicitly hidden
    const visibleExperience = experience ? experience.filter(item => !item.hidden) : [];
    const visibleEducation = education ? education.filter(item => !item.hidden) : [];
    const visibleProjects = projects ? projects.filter(item => !item.hidden) : [];
    const visibleSkills = skills ? skills.filter(item => !item.hidden) : [];
    const visibleLanguages = languages ? languages.filter(item => !item.hidden) : [];

    // Scale starts strictly at 1.0 (100% real scale) to maintain layout fidelity and editorial UX
    const [scale, setScale] = useState(1.0);

    const handleZoom = (amount: number) => {
      setScale((prev) => Math.min(1.2, Math.max(0.4, parseFloat((prev + amount).toFixed(2)))));
    };

    const handleResetZoom = () => {
      if (typeof window !== 'undefined') {
        const containerHeight = window.innerHeight - 180;
        // 1122px is approximately 297mm height in standard 96dpi screen pixels
        const autoScale = Math.min(1.0, Math.max(0.5, parseFloat((containerHeight / 1122).toFixed(2))));
        setScale(autoScale);
      }
    };

    // Build active contact items dynamically to avoid leading/trailing bullet points and prevent hanging separators
    const activeContacts = [
      { key: 'email', value: personalInfo.email, render: () => <span className="hover:text-slate-800 transition-colors">{personalInfo.email}</span> },
      { key: 'phone', value: personalInfo.phone, render: () => <span>{personalInfo.phone}</span> },
      { key: 'location', value: personalInfo.location, render: () => <span>{personalInfo.location}</span> },
      { key: 'linkedin', value: personalInfo.linkedin, render: () => <span className="font-medium text-slate-600 hover:text-slate-800 transition-colors">{personalInfo.linkedin}</span> },
      { key: 'github', value: personalInfo.github, render: () => <span className="font-medium text-slate-600 hover:text-slate-800 transition-colors">{personalInfo.github}</span> },
      { key: 'website', value: personalInfo.website, render: () => <span className="font-medium text-slate-600 hover:text-slate-800 transition-colors">{personalInfo.website}</span> }
    ].filter(item => !!item.value);

    // Refs and states for multi-page computation
    const contentRef = useRef<HTMLDivElement>(null);
    const [pageCount, setPageCount] = useState(1);

    // Dynamic page count computation by measuring unscaled DOM scroll height against A4 height limit (986px)
    useEffect(() => {
      let rAFId: number;
      const checkOverflow = () => {
        rAFId = requestAnimationFrame(() => {
          const el = contentRef.current;
          if (!el) return;
          const scrollHeight = el.scrollHeight;
          const pageHeight = 986; // 261mm in standard 96dpi screen pixels
          const neededPages = Math.ceil(scrollHeight / pageHeight);
          setPageCount(Math.max(1, neededPages));
        });
      };

      checkOverflow();
      window.addEventListener('resize', checkOverflow);
      const t = setTimeout(checkOverflow, 250);
      return () => {
        window.removeEventListener('resize', checkOverflow);
        clearTimeout(t);
        cancelAnimationFrame(rAFId);
      };
    }, [data, visibleExperience, visibleEducation, visibleProjects, visibleSkills, visibleLanguages]);

    const theme = ACCENT_THEMES[activeTheme];

    return (
      <div className="w-full flex flex-col items-center bg-slate-100 h-full overflow-hidden">
        {/* Floating/Sticky Display Controls Bar - Minimalist, Premium & Clean Look (no-print) */}
        <div className="w-full bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between no-print shadow-xs z-10 select-none">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500">Visualización:</span>
              <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200/80 px-1.5 py-0.5 rounded shadow-2xs">
                {Math.round(scale * 100)}%
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Zoom Out Button */}
            <button
              onClick={() => handleZoom(-0.05)}
              className="p-1 rounded bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 hover:border-slate-300 active:bg-slate-200 active:border-slate-300 transition-all cursor-pointer shadow-2xs"
              title="Reducir Zoom"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
              </svg>
            </button>
            
            {/* Slider */}
            <input
              type="range"
              min="0.4"
              max="1.2"
              step="0.05"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-24 md:w-36 accent-slate-700 cursor-pointer h-1 bg-slate-200 rounded-lg appearance-none"
            />
            
            {/* Zoom In Button */}
            <button
              onClick={() => handleZoom(0.05)}
              className="p-1 rounded bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 hover:border-slate-300 active:bg-slate-200 active:border-slate-300 transition-all cursor-pointer shadow-2xs"
              title="Aumentar Zoom"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
            
            <div className="h-4 w-px bg-slate-200" />
            
            {/* Auto-fit "Ajustar" Button */}
            <button
              onClick={handleResetZoom}
              className="text-[11px] font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 px-2.5 py-1 rounded transition-all cursor-pointer shadow-2xs"
            >
              Ajustar
            </button>
          </div>
        </div>

        {/* Scrollable Area for Preview */}
        <div className="w-full flex-1 overflow-y-auto custom-scrollbar flex justify-center py-8 px-4 bg-slate-100">
          {/* Boundary box container to prevent massive empty whitespace and ensure smooth layout flow */}
          <div
            style={{
              width: `${210 * scale}mm`,
              height: `${(297 * pageCount + 8 * (pageCount - 1)) * scale}mm`, // Dynamic boundary height including page gaps
              flexShrink: 0,
            }}
            className="flex justify-center items-start overflow-hidden"
          >
            {/* visual-wrapper (scaled for screen) - Applied transform scale EXCLUSIVELY here */}
            <div
              className="overflow-hidden flex flex-col justify-start items-center flex-shrink-0"
              style={{
                width: '210mm',
                transform: `scale(${scale})`,
                transformOrigin: 'top center',
              }}
            >
              {/* resume-print-target-container (physically fixed parent) - SINGLE SOURCE OF TRUTH FOR PRINT */}
              <div
                ref={ref}
                className="w-full flex flex-col justify-start items-center bg-transparent"
                style={{
                  width: '210mm',
                  boxSizing: 'border-box',
                }}
              >
                {Array.from({ length: pageCount }).map((_, p) => (
                  <React.Fragment key={p}>
                    {/* resume-print-target (physically A4) */}
                    <div
                      className="resume-print-target bg-white shadow-lg border border-slate-200 p-[18mm] text-slate-800 text-left font-sans flex flex-col justify-between overflow-hidden relative"
                      style={{
                        width: '210mm',
                        height: '297mm',
                        boxSizing: 'border-box',
                        breakAfter: 'page',
                        pageBreakAfter: 'always',
                      }}
                    >
                      {/* Left Accent Line - Refined 2px Vertical Editorial Brand Signature */}
                      <span className={`absolute left-[10mm] top-[10mm] bottom-[10mm] w-[4px] pointer-events-none ${theme.accentBar}`}></span>

                      {/* Internal bounded content */}
                      <div className="h-full overflow-hidden flex flex-col justify-between">
                        <div 
                          style={{
                            height: '261mm', // 986px
                            overflow: 'hidden',
                            position: 'relative'
                          }}
                        >
                          <div 
                            ref={p === 0 ? contentRef : undefined}
                            style={{
                              transform: `translateY(${p * -986.4}px)`,
                              transformOrigin: 'top center'
                            }}
                            className="space-y-[4.5mm]"
                          >
                            
                            {/* Header / Personal Info */}
                            {personalInfo.profileImage ? (
                              <div className="flex flex-row items-start justify-between pb-2.5 border-b border-slate-100 gap-4">
                                {/* Text on Left */}
                                <div className="text-left flex-1">
                                  <h1 className="text-[26px] font-sans font-bold text-slate-900 tracking-tight mb-0.5">
                                    {personalInfo.name || 'Tu Nombre Completo'}
                                  </h1>
                                  <p className="text-[11px] font-sans font-semibold uppercase tracking-widest text-slate-500 mb-2">
                                    {personalInfo.title || 'Tu Título Profesional'}
                                  </p>
                                  
                                  {/* Contact Bar - Pure CSS negative-margin wrap alignment to prevent separator layout shifts */}
                                  <div className="flex flex-wrap justify-start items-center overflow-hidden -ml-3 text-[11px] text-slate-500 tracking-wide font-sans">
                                    {activeContacts.map((contact, index) => (
                                      <div key={contact.key} className="inline-flex items-center ml-3 relative pl-3 shrink-0">
                                        {index > 0 && (
                                          <span className="absolute left-[-6px] text-slate-300 select-none">•</span>
                                        )}
                                        {contact.render()}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                
                                {/* Photo on Right */}
                                <img 
                                  src={personalInfo.profileImage} 
                                  alt="Foto de perfil" 
                                  className="w-20 h-20 rounded-full object-cover border border-slate-100 flex-shrink-0"
                                />
                              </div>
                            ) : (
                              <div className="text-center pb-2.5 border-b border-slate-100">
                                <h1 className="text-[26px] font-sans font-bold text-slate-900 tracking-tight mb-0.5">
                                  {personalInfo.name || 'Tu Nombre Completo'}
                                </h1>
                                <p className="text-[11px] font-sans font-semibold uppercase tracking-widest text-slate-500 mb-2.5">
                                  {personalInfo.title || 'Tu Título Profesional'}
                                </p>
                                
                                {/* Contact Bar (Centered) - Pure CSS negative-margin wrap alignment to prevent separator layout shifts */}
                                <div className="w-full flex justify-center">
                                  <div className="flex flex-wrap justify-start items-center overflow-hidden -ml-3 text-[11px] text-slate-500 tracking-wide font-sans">
                                    {activeContacts.map((contact, index) => (
                                      <div key={contact.key} className="inline-flex items-center ml-3 relative pl-3 shrink-0">
                                        {index > 0 && (
                                          <span className="absolute left-[-6px] text-slate-300 select-none">•</span>
                                        )}
                                        {contact.render()}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Summary / Profile Section */}
                            {summary && (
                              <div className="print-avoid-break">
                                <h2 className={`text-[11px] font-sans font-bold uppercase tracking-widest ${theme.titleText} mb-0.5`}>
                                  Perfil Profesional
                                </h2>
                                <div className={`h-[1px] ${theme.titleLine} w-full mb-2`} />
                                <p className="text-[13px] text-slate-600 leading-normal text-justify whitespace-pre-line">
                                  {summary}
                                </p>
                              </div>
                            )}

                            {/* Experience Section */}
                            {visibleExperience.length > 0 && (
                              <div>
                                <h2 className={`text-[11px] font-sans font-bold uppercase tracking-widest ${theme.titleText} mb-0.5`}>
                                  Experiencia Laboral
                                </h2>
                                <div className={`h-[1px] ${theme.titleLine} w-full mb-2`} />
                                
                                <div className="space-y-2.5">
                                  {visibleExperience.map((item) => (
                                    <div key={item.id} className="print-avoid-break">
                                      {/* Job Header Row 1 */}
                                      <div className="flex justify-between items-baseline mb-0.5">
                                        <span className={`text-[13px] font-bold ${theme.titleText} font-sans`}>
                                          {item.role || 'Puesto / Rol'}
                                        </span>
                                        <span className={`text-xs ${theme.secondaryText} font-medium font-sans whitespace-nowrap ml-2`}>
                                          {(item.startDate || item.endDate) ? `${item.startDate} — ${item.endDate}` : ''}
                                        </span>
                                      </div>
                                      
                                      {/* Job Header Row 2 */}
                                      <div className="flex justify-between items-baseline mb-1">
                                        <span className="text-[13px] font-medium text-slate-600 font-sans">
                                          {item.company || 'Empresa'}
                                        </span>
                                        {item.location && (
                                          <span className={`text-xs ${theme.secondaryText} italic font-sans`}>
                                            {item.location}
                                          </span>
                                        )}
                                      </div>
                                      
                                      {/* Job Description */}
                                      {item.description && (
                                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line text-justify pl-0.5">
                                          {item.description}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Education Section */}
                            {visibleEducation.length > 0 && (
                              <div>
                                <h2 className={`text-[11px] font-sans font-bold uppercase tracking-widest ${theme.titleText} mb-0.5`}>
                                  Formación Académica
                                </h2>
                                <div className={`h-[1px] ${theme.titleLine} w-full mb-2`} />
                                
                                <div className="space-y-2.5">
                                  {visibleEducation.map((item) => (
                                    <div key={item.id} className="print-avoid-break">
                                      {/* Edu Header Row 1 */}
                                      <div className="flex justify-between items-baseline mb-0.5">
                                        <span className={`text-[13px] font-bold ${theme.titleText} font-sans`}>
                                          {item.degree || 'Título o Certificación'}
                                        </span>
                                        <span className={`text-xs ${theme.secondaryText} font-medium font-sans whitespace-nowrap ml-2`}>
                                          {(item.startDate || item.endDate) ? `${item.startDate} — ${item.endDate}` : ''}
                                        </span>
                                      </div>
                                      
                                      {/* Edu Header Row 2 */}
                                      <div className="flex justify-between items-baseline mb-1">
                                        <span className="text-[13px] font-medium text-slate-600 font-sans">
                                          {item.institution || 'Institución'}
                                        </span>
                                        {item.location && (
                                          <span className={`text-xs ${theme.secondaryText} italic font-sans`}>
                                            {item.location}
                                          </span>
                                        )}
                                      </div>
                                      
                                      {/* Edu Description */}
                                      {item.description && (
                                        <p className="text-xs text-slate-600 leading-relaxed pl-0.5 whitespace-pre-line text-justify">
                                          {item.description}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Projects Section */}
                            {visibleProjects.length > 0 && (
                              <div>
                                <h2 className={`text-[11px] font-sans font-bold uppercase tracking-widest ${theme.titleText} mb-0.5`}>
                                  Proyectos Destacados
                                </h2>
                                <div className={`h-[1px] ${theme.titleLine} w-full mb-2`} />
                                
                                <div className="space-y-2.5">
                                  {visibleProjects.map((item) => (
                                    <div key={item.id} className="print-avoid-break">
                                      {/* Project Header Row 1 */}
                                      <div className="flex justify-between items-baseline mb-0.5">
                                        <span className={`text-[13px] font-bold ${theme.titleText} font-sans`}>
                                          {item.name || 'Nombre del Proyecto'}
                                        </span>
                                        <span className={`text-xs ${theme.secondaryText} font-medium font-sans whitespace-nowrap ml-2`}>
                                          {(item.startDate || item.endDate) ? `${item.startDate} — ${item.endDate}` : ''}
                                        </span>
                                      </div>
                                      
                                      {/* Project Header Row 2 */}
                                      <div className="flex justify-between items-baseline mb-1">
                                        <span className="text-[13px] font-medium text-slate-600 font-sans">
                                          {item.role || 'Rol'}
                                        </span>
                                        {item.url && (
                                          <a
                                            href={`https://${item.url}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`text-xs ${theme.secondaryText} hover:text-slate-700 hover:underline font-sans transition-colors`}
                                          >
                                            {item.url}
                                          </a>
                                        )}
                                      </div>
                                      
                                      {/* Project Description */}
                                      {item.description && (
                                        <p className="text-xs text-slate-600 leading-relaxed pl-0.5 whitespace-pre-line text-justify">
                                          {item.description}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Skills & Languages Row */}
                            <div className="grid grid-cols-2 gap-4 pt-1 print-avoid-break">
                              {/* Skills */}
                              {visibleSkills.length > 0 && (
                                <div>
                                  <h2 className={`text-[11px] font-sans font-bold uppercase tracking-widest ${theme.titleText} mb-0.5`}>
                                    Habilidades
                                  </h2>
                                  <div className={`h-[1px] ${theme.titleLine} w-full mb-2`} />
                                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                                    {visibleSkills.map(s => s.name).join('   •   ')}
                                  </p>
                                </div>
                              )}

                              {/* Languages */}
                              {visibleLanguages.length > 0 && (
                                <div>
                                  <h2 className={`text-[11px] font-sans font-bold uppercase tracking-widest ${theme.titleText} mb-0.5`}>
                                    Idiomas
                                  </h2>
                                  <div className={`h-[1px] ${theme.titleLine} w-full mb-2`} />
                                  <div className="text-xs text-slate-600 leading-relaxed font-sans">
                                    {visibleLanguages.map((l, index) => (
                                      <span key={l.id}>
                                        <span className={`font-semibold ${theme.titleText}`}>{l.name}</span>
                                        {l.level && <span className={theme.secondaryText}> ({l.level})</span>}
                                        {index < visibleLanguages.length - 1 ? '   •   ' : ''}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Page Gap - Google Docs style visual separation */}
                    {p < pageCount - 1 && (
                      <div className="h-6 w-[210mm] bg-slate-200/80 border-y border-slate-300/40 no-print flex items-center justify-center select-none shrink-0 my-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          Página {p + 1} • Salto de Hoja
                        </span>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ResumePreview.displayName = 'ResumePreview';
