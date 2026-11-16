# Quickstart: Runtime Schema Check

1. Construir backend y frontend con comandos finitos.
2. Consultar `__type(name: "Mutation")` sobre `/graphql` y comprobar el campo `confirmStudentCareer` con argumento `careerId`.
3. Con una sesión Estudiante, confirmar una carrera y comprobar que `me.userCareers` contiene exactamente una asociación.
4. Si el campo no existe, identificar el PID que escucha el puerto, comprobar su ruta y reiniciar únicamente ese proceso con los binarios actuales.
5. Ante una API deliberadamente incompatible, comprobar que la UI ofrece reintento/cierre de sesión y no muestra nombres de tipos o campos GraphQL.
