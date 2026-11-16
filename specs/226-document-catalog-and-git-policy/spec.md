# Spec 226: Catálogo Documental, Gobierno de Artefactos y Política Git

**ID:** Spec 226  
**Tipo:** Organización Documental y Gobernanza de Repositorio  
**Hallazgos Abordados:** ORG-06, ORG-11 (y complemento de ORG-09)  
**Estado:** CERRADA Y RATIFICADA (100% PASS)  

## 1. Resumen Ejecutivo
Establecer una clasificación unívoca y rigurosa de los archivos del repositorio, distinguiendo formalmente entre lo vigente, lo histórico inmutable, lo derivado, lo local/efímero y los paquetes entregables. Resolver la contradicción de `README.md` respecto a `.agents` y `.specify` (que hoy contienen archivos versionados necesarios para un clon limpio), depurar `.gitignore` de forma selectiva para excluir basuras temporales (`scratch/`, logs y perfiles CDP) y catalogar las referencias y URIs dependientes de máquina (`file:///`) sin mover rutas en masa ni romper la arquitectura actual.
