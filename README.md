# Ecommerce BackendII - Segunda Entrega

Proyecto backend de ecommerce realizado para Coderhouse con arquitectura, patrones de diseño y sistema de autorización.

## Características 

### 1. Patrón Repository
- Separación entre lógica y acceso a datos
- Repositorio para User, Product, Cart y Ticket

### 2. DTOs (Data Transfer Objects)
- `UserDTO`: Elimina información sensible 
- `ProductDTO`: Estructura para respuestas

### 3. Sistema de Recuperación de Contraseña
- Envío de email con link de recuperación
- Token con expiración de 1 hora
- Validación de contraseña nueva

### 4. Passport con 3 Estrategias
- **local-register**: Registro de usuarios
- **local-login**: Autenticación de usuarios
- **jwt-current**: Validación de token JWT desde cookies

### 5. Middleware de Autorización
- `requireAdmin`: Solo administradores
- `requireUser`: Solo usuarios regulares
- `requireUserOrAdmin`: Ambos roles

### 6. Modelo Ticket y Lógica de Compra
- Verificación de stock antes de comprar
- Generación de tickets con código único
- Actualización automática de stock
- Manejo de productos sin stock disponible
- Email de confirmación de compra

## Variables de Entorno Necesarias

```env
PORT=8080
APP_URL=http://localhost:8080
MONGO_URI=tu_mongo_uri
JWT_SECRET=tu_jwt_secret
MAIL_SERVICE=gmail
MAIL_USER=tu_email@gmail.com
MAIL_PASS=tu_app_password
```

## Endpoints Principales

### Sesiones
- `POST /api/sessions/register` - Registro (strategy: register)
- `POST /api/sessions/login` - Login (strategy: login)
- `GET /api/sessions/current` - Usuario actual (strategy: current) → **Retorna DTO**
- `POST /api/sessions/forgot-password` - Solicitar recuperación
- `POST /api/sessions/reset-password/:token` - Restablecer contraseña

### Productos 
- `GET /api/products` 
- `GET /api/products/:pid`
- `POST /api/products` 
- `PUT /api/products/:pid`
- `DELETE /api/products/:pid` 

### Carrito 
- `GET /api/carts/:cid` 
- `POST /api/carts/:cid/product/:pid`
- `POST /api/carts/:cid/purchase` 
- `DELETE /api/carts/:cid/product/:pid`
- `DELETE /api/carts/:cid` 
## Ejecución

```bash
npm install
npm start
# o para desarrollo:
npm run dev
```

## Roles

- **admin**: administrador
- **user**: Cualquier otro usuario registrado

## Autor
Cristina

## 2025