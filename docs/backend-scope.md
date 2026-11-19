# MediFind — alcance funcional del backend

> Documento de alcance inicial. Describe las decisiones acordadas y no implica que todas las funcionalidades estén implementadas.

## Roles y acceso

- **ADMIN**: administrador global de la plataforma. Gestiona farmacias, usuarios, catálogos, turnos y pedidos.
- **PHARMACIST**: usuario asociado a una farmacia. Solo gestiona recursos y pedidos de su farmacia.
- **CUSTOMER**: cliente que busca medicamentos, consulta farmacias, guarda favoritas y realiza pedidos. No existe un rol especial de médico: usa las mismas funcionalidades de cliente.

El registro público debe crear exclusivamente clientes. La vinculación de farmacéuticos a farmacias requiere autorización administrativa.

## Pedidos y retiro

Los pedidos se retiran y pagan presencialmente en la farmacia. No se contempla envío a domicilio ni pago online en la primera versión.

Estados previstos:

1. `PENDING`: el cliente creó el pedido; la farmacia decide aceptarlo o cancelarlo.
2. `PREPARING`: el farmacéutico aceptó el pedido y comenzó a prepararlo.
3. `READY`: está listo para retirar.
4. `DELIVERED`: fue entregado en mostrador.
5. `CANCELLED`: fue cancelado; debe registrarse un motivo visible para el cliente.

Transiciones normales: `PENDING -> PREPARING -> READY -> DELIVERED`. La cancelación debe estar sujeta a reglas de negocio y nunca permitir cancelar pedidos ya entregados.

Cada pedido debe identificar explícitamente la farmacia de retiro. El backend calcula el total y valida cantidades y disponibilidad; el manejo de reservas y liberación de stock se definirá antes de implementar pedidos.

## Notificaciones

- Cliente: pedido creado, aceptado, listo, entregado o cancelado.
- En cancelaciones, incluir el motivo proporcionado por la farmacia.
- Farmacéutico: aviso cuando ingresa un pedido nuevo a su farmacia.
- Primera versión: notificaciones internas persistentes con indicador de lectura. Tiempo real y correo electrónico quedan como mejoras posteriores.

## Orden de implementación

1. Revisar esquema y relaciones, migraciones y seguridad.
2. Completar autenticación, perfiles y autorización por rol/propiedad.
3. Catálogo de medicamentos, stock, farmacias y turnos.
4. Pedidos y transiciones con validación transaccional.
5. Notificaciones.
6. Favoritos, reportes, integración frontend y pruebas.

## Convenciones de trabajo

- Cambios pequeños, revisables y agrupados por responsabilidad.
- Commits siguiendo el estilo existente: `feat: ...`, `fix: ...`, `docs: ...`, `refactor: ...`, `test: ...`.
- Documentar endpoints, reglas de negocio y decisiones relevantes a medida que se implementen.
- Validar compilación, pruebas y migraciones antes de integrar cada cambio cuando el entorno lo permita.
