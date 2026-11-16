# Quickstart: Spec 215

1. Confirmar backend actual con Spec 213.
2. Confirmar `FileStorage:Provider=Local` en Development. Para Cloudinary, establecer
   `FileStorage:Provider=Cloudinary` y `CloudinarySettings:Url` solo mediante secretos.
3. Probar imagen válida, inválida, cancelación, save y refresh.
4. Ejecutar Cloudinary solo con credenciales reales y registrar gate separado. No se
   permite fallback automático a disco tras seleccionar el provider remoto.
