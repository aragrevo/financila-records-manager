# Plan de Implementación: Gastos

## Objetivo

Crear un módulo nuevo de gastos, independiente de `history`, con una interfaz
similar a una hoja de cálculo financiera y notificaciones automáticas por correo.

El diseño debe permitir añadir WhatsApp, Telegram o SMS más adelante sin cambiar
la lógica principal de gastos.

## Alcance funcional

### Módulo

- Nueva ruta: `/expenses`.
- No reutilizar ni modificar el flujo funcional de `/history`.
- Persistir gastos en Redis como entidad separada de `Transaction`.
- Mostrar gastos ordenados por fecha descendente.

### Datos de cada gasto

- Fecha.
- Mes derivado de la fecha para agrupaciones.
- Importe.
- Moneda configurable.
- Tienda o comercio.
- Descripción.
- Categoría.
- Estado del registro.
- Fechas de creación y actualización.

### Operaciones

- Crear gasto.
- Editar gasto.
- Eliminar gasto.
- Validar datos en servidor antes de persistir.
- Confirmar visualmente cada operación.
- Mostrar errores sin perder información introducida cuando sea posible.

## Interfaz

### Tabla principal

Diseño inspirado en la imagen de referencia:

- Fecha.
- Mes.
- Importe.
- Tienda.
- Descripción.
- Categoría.
- Acciones de editar y eliminar.
- Formato monetario configurable.
- Importe negativo para gastos.
- Diseño responsive con scroll horizontal en pantallas pequeñas.

### Resumen mensual

Añadir tabla tipo tabla dinámica:

- Filas agrupadas por tienda.
- Columnas agrupadas por mes.
- Total por tienda.
- Total por mes.
- Total general.
- Selector de año o rango de fechas.
- Filtros por tienda, categoría y moneda si aplica.

### Formulario

- Fecha.
- Importe.
- Moneda.
- Tienda.
- Descripción.
- Categoría.
- Botón guardar.
- Reutilizar formulario para crear y editar.
- No pedir mes manualmente: derivarlo automáticamente desde la fecha.

## Modelo y persistencia

Crear un tipo separado, por ejemplo `Expense`, sin extender `Transaction`.

Redis debe incluir:

- Hash individual: `expense:{id}`.
- Índice general: `expenses:index`.
- Índice por fecha.
- Índice por tienda.
- Índice por categoría.

Crear servicio dedicado:

- `src/services/expenses.service.ts`.

Crear endpoints dedicados:

- `GET /api/expenses`.
- `POST /api/expenses`.
- `GET /api/expenses/[id]`.
- `PUT /api/expenses/[id]`.
- `DELETE /api/expenses/[id]`.

Crear servicio para agregaciones:

- `src/services/expense-summary.service.ts`.

Este servicio calculará agrupaciones mensuales y totales sin duplicar datos en
Redis.

## Notificaciones

### Canal inicial

Implementar únicamente correo electrónico.

Proveedor recomendado: Resend, por integración sencilla con Astro/Vercel y plan
gratuito limitado.

Variables de entorno previstas:

```text
RESEND_API_KEY=
NOTIFICATION_FROM_EMAIL=
```

### Eventos

Enviar correo automáticamente después de completar correctamente:

- Creación de gasto.
- Edición de gasto.
- Eliminación de gasto.

El correo debe incluir:

- Acción realizada.
- Fecha.
- Importe y moneda.
- Tienda.
- Descripción.
- Categoría.
- Identificador del gasto cuando sea útil.

Para eliminaciones, construir el mensaje usando una copia del gasto antes de
borrarlo.

### Comportamiento ante errores

- Un fallo de correo no debe revertir un gasto guardado.
- Registrar error de envío en logs y en historial de notificaciones.
- Devolver al frontend que el gasto se guardó, indicando si la notificación falló.
- Evitar reintentos automáticos duplicados en la primera versión.

### Arquitectura extensible

Crear una abstracción de canal, por ejemplo:

```ts
interface NotificationChannel {
  send(message: NotificationMessage): Promise<NotificationResult>;
}
```

Implementar inicialmente:

- `EmailNotificationChannel`.

Dejar preparado el registro futuro de:

- `WhatsAppNotificationChannel`.
- `TelegramNotificationChannel`.
- `SmsNotificationChannel`.

La lógica de gastos solo debe llamar a un `notificationService`, no a Resend
directamente.

## Configuración

Crear una sección de configuración, por ejemplo `/settings`, con:

- Moneda predeterminada.
- Correo destinatario.
- Activar o desactivar notificaciones.
- Activar aviso al crear.
- Activar aviso al editar.
- Activar aviso al eliminar.

Guardar preferencias no secretas en Redis. Mantener claves de proveedores
externos exclusivamente en variables de entorno.

Configuración inicial sugerida:

```text
DEFAULT_CURRENCY=EUR
NOTIFICATIONS_ENABLED=true
NOTIFY_ON_EXPENSE_CREATE=true
NOTIFY_ON_EXPENSE_UPDATE=true
NOTIFY_ON_EXPENSE_DELETE=true
```

El correo destinatario debe poder modificarse desde la aplicación y validarse
antes de guardar.

## Componentes previstos

- `src/pages/expenses.astro`.
- `src/components/expenses/ExpensesTable.astro`.
- `src/components/expenses/ExpenseSummaryTable.astro`.
- `src/components/expenses/ExpenseForm.astro`.
- `src/components/expenses/ExpenseFilters.astro`.
- `src/services/expenses.service.ts`.
- `src/services/expense-summary.service.ts`.
- `src/services/notifications.service.ts`.
- `src/services/notification-channels/email.channel.ts`.
- Endpoints bajo `src/pages/api/expenses/`.
- Tipos y claves Redis en `src/lib/types.ts` y `src/lib/db.ts` o archivos de
  constantes correspondientes.

Los nombres son orientativos y deben ajustarse a los patrones existentes del
proyecto.

## Seguridad y consistencia

- Mantener protección mediante middleware de sesión.
- No exponer `RESEND_API_KEY` al navegador.
- Validar importes finitos y fechas válidas en API.
- Escapar contenido incluido en correos HTML.
- Mantener operaciones Redis e índices consistentes.
- Al editar, actualizar correctamente índices si cambia fecha, tienda o
  categoría.
- Al eliminar, borrar hash e índices relacionados.

## Fases de implementación

1. Definir tipos, claves Redis y servicio de gastos.
2. Crear endpoints CRUD protegidos.
3. Crear página y formulario de gastos.
4. Crear tabla responsive y acciones CRUD.
5. Crear resumen mensual y filtros.
6. Crear configuración de moneda y notificaciones.
7. Integrar canal de correo mediante Resend.
8. Añadir historial de notificaciones y estados de error.
9. Añadir navegación hacia `/expenses` y `/settings`.
10. Ejecutar `pnpm build` y verificar manualmente los flujos principales.

## Criterios de aceptación

- Crear gasto lo guarda y lo muestra en `/expenses`.
- Editar gasto actualiza tabla y resumen.
- Eliminar gasto lo quita de tabla, resumen e índices Redis.
- Mes se calcula correctamente desde la fecha.
- Totales mensuales coinciden con los gastos filtrados.
- Crear, editar y eliminar generan correo según configuración.
- Un error de correo no elimina ni bloquea el gasto.
- Moneda y destinatario se pueden modificar sin editar código.
- No hay cambios funcionales en `/history`.
- La arquitectura permite añadir otro canal sin reescribir CRUD de gastos.
