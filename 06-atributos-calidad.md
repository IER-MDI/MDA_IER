# Atributos de calidad (ISO 25010)

## Priorización de los 9 atributos de primer nivel
1. **Usabilidad (Usability):** Prioridad crítica para que la carga/traducción del Excel, la grilla interactiva y la malla gráfica sean intuitivas sin requerir capacitación.
2. **Mantenibilidad / Tolerancia a Variabilidad (Maintainability):** Crucial para que el algoritmo procesador de Excel pueda adaptarse fácilmente a cambios en el formato o nombres de columnas que la universidad introduzca en futuros semestres.
3. **Eficiencia de desempeño (Performance Efficiency):** Vital para mantener tiempos de respuesta inmediatos ante interacciones en el simulador y procesar el archivo Excel rápidamente en el navegador o servidor comunitario.
4. **Fiabilidad (Reliability):** Garantizar que el parseo de datos no pierda secciones ni corrompa los módulos horarios de la oferta traducida.
5. **Seguridad / Privacidad (Security):** Garantizar el anonimato estricto en el módulo de opiniones docentes y la protección de datos personales.
6. **Compatibilidad (Compatibility):** Operar adecuadamente en navegadores web de escritorio y dispositivos móviles.
7. **Flexibilidad (Flexibility):** Permitir la persistencia local de datos (*LocalStorage/IndexedDB*) para uso individual privado o sincronización comunitaria.
8. **Portabilidad (Portability):** Posibilidad de desplegar la plataforma independiente en servicios en la nube de acceso público.
9. **Adecuación funcional (Functional Suitability):** Cumplimiento estricto de las reglas lógicas de cálculo de créditos y detección de topes horarios.

## Métricas de los 3 atributos más importantes

### Usabilidad (Usability)
- **Métrica:** *Tiempo de traducción y configuración de oferta desde Excel.*
- **Descripción:** Se medirá el tiempo transcurrido desde que el usuario sube el archivo Excel hasta que visualiza la oferta cargada en el simulador. El objetivo establece que el **90% de los usuarios logre importar y validar la oferta en menos de 2 minutos** en su primer intento.

### Mantenibilidad / Tolerancia a Variabilidad (Maintainability)
- **Métrica:** *Tasa de éxito en la traducción de archivos Excel con esquemas heterogéneos.*
- **Descripción:** El módulo de mapeo y parseo debe interpretar correctamente al menos el **95% de los registros de asignaturas y módulos horarios** de planillas Excel de distintos semestres sin requerir modificaciones en el código fuente.

### Eficiencia de desempeño (Performance Efficiency)
- **Métrica:** *Tiempo de renderizado y recalculo en la grilla interactiva.*
- **Descripción:** Al interactuar con el simulador (agregar/quitar secciones extraídas del Excel), el tiempo de actualización visual del horario y el cálculo de créditos **no debe superar los 500 milisegundos**.
