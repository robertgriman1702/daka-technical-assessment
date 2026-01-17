Decisiones técnicas

Separación por módulos (backend)
Dividí el backend en módulos (auth, pokemon, config) para mantener responsabilidades claras y evitar mezclar lógica. Esto facilita mantener y extender el proyecto sin que todo quede en un solo archivo.

Configuración de base de datos separada
La configuración de TypeORM se movió a un archivo dedicado para poder reutilizarla entre entornos y validar mejor las variables de entorno, especialmente al usar Docker.

Uso de WebSockets para los sprites
La generación y manejo de sprites se hizo con WebSockets en lugar de REST para manejar mejor eventos en tiempo real y no acoplar esta lógica a los controladores HTTP.

Docker por entorno
Se separaron los archivos docker-compose para desarrollo y pruebas, ya que el flujo en dev (hot reload) es distinto al de un build más cercano a producción.

Frontend por capas
En el frontend se separó el manejo de estado, vistas y llamadas HTTP para mantener el código más ordenado y evitar lógica duplicada entre componentes.

Código un poco más explícito a propósito
Algunas cosas podrían haberse simplificado más, pero preferí dejar la estructura clara y explícita para que se entienda fácilmente cómo funciona y cómo escalarlo.