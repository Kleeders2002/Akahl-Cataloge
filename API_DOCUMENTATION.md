# 🧵 API Documentation - CATÁLOGO (AKAHL Atelier)

Documentación completa de endpoints para el equipo de Frontend.

---

## 🔐 Autenticación

**Importante:** Todos los endpoints marcados como **Admin** requieren:
- Header: `Authorization: Bearer <token_jwt>`
- El token se obtiene al hacer login con PIN o email/contraseña

**Endpoints Públicos** requieren:
- Header: `Authorization: Bearer <token_jwt>` (puede ser token de PIN)

---

## 🏷️ MARCAS

### 1. Obtener todas las marcas

```
GET /api/catalogo/marcas
```

**Autenticación:** Pública (con token de PIN)

**Response Exitoso:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id_marca": 1,
      "nombre": "Holland & Sherry",
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z",
      "_count": {
        "colecciones": 5
      }
    },
    {
      "id_marca": 2,
      "nombre": "Dormeuil",
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z",
      "_count": {
        "colecciones": 3
      }
    }
  ]
}
```

---

### 2. Obtener una marca por ID

```
GET /api/catalogo/marcas/:id
```

**Autenticación:** Pública (con token de PIN)

**Ejemplo:** `GET /api/catalogo/marcas/1`

**Response Exitoso:**
```json
{
  "success": true,
  "data": {
    "id_marca": 1,
    "nombre": "Holland & Sherry",
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z",
    "colecciones": [
      {
        "id_coleccion": 1,
        "nombre": "SUPERNOVA",
        "descuento_default": 0.35,
        "_count": {
          "telas": 15
        }
      }
    ]
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Marca not found"
}
```

---

### 3. Crear nueva marca

```
POST /api/catalogo/marcas
```

**Autenticación:** Admin ✅

**Body:**
```json
{
  "nombre": "Scabal"
}
```

**Response Exitoso (201):**
```json
{
  "success": true,
  "data": {
    "id_marca": 3,
    "nombre": "Scabal",
    "createdAt": "2025-08-10T15:30:00.000Z",
    "updatedAt": "2025-08-10T15:30:00.000Z"
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "A marca with this name already exists"
}
```

---

### 4. Actualizar marca

```
PUT /api/catalogo/marcas/:id
```

**Autenticación:** Admin ✅

**Ejemplo:** `PUT /api/catalogo/marcas/3`

**Body:**
```json
{
  "nombre": "Scabal Limited"
}
```

**Response Exitoso:**
```json
{
  "success": true,
  "data": {
    "id_marca": 3,
    "nombre": "Scabal Limited",
    "updatedAt": "2025-08-10T15:35:00.000Z"
  }
}
```

---

### 5. Eliminar marca

```
DELETE /api/catalogo/marcas/:id
```

**Autenticación:** Admin ✅

**Ejemplo:** `DELETE /api/catalogo/marcas/3`

**Response Exitoso:**
```json
{
  "success": true,
  "message": "Marca deleted successfully"
}
```

**Response Error (tiene colecciones):**
```json
{
  "success": false,
  "message": "Cannot delete marca with existing colecciones"
}
```

---

## 📚 COLECCIONES

### 1. Obtener todas las colecciones

```
GET /api/catalogo/colecciones
```

**Autenticación:** Pública (con token de PIN)

**Response Exitoso:**
```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "id_coleccion": 1,
      "id_marca": 1,
      "nombre": "SUPERNOVA",
      "descuento_default": 0.35,
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z",
      "marca": {
        "id_marca": 1,
        "nombre": "Holland & Sherry"
      },
      "_count": {
        "telas": 15
      }
    }
  ]
}
```

---

### 2. Obtener colecciones de una marca

```
GET /api/catalogo/colecciones/marcas/:marcaId/colecciones
```

**Autenticación:** Pública (con token de PIN)

**Ejemplo:** `GET /api/catalogo/colecciones/marcas/1/colecciones`

**Response Exitoso:**
```json
{
  "success": true,
  "marca": "Holland & Sherry",
  "count": 5,
  "data": [
    {
      "id_coleccion": 1,
      "nombre": "SUPERNOVA",
      "descuento_default": 0.35,
      "_count": {
        "telas": 15
      }
    },
    {
      "id_coleccion": 2,
      "nombre": "DRAGONFLY",
      "descuento_default": 0.30,
      "_count": {
        "telas": 12
      }
    }
  ]
}
```

---

### 3. Obtener una colección por ID

```
GET /api/catalogo/colecciones/:id
```

**Autenticación:** Pública (con token de PIN)

**Ejemplo:** `GET /api/catalogo/colecciones/1`

**Response Exitoso:**
```json
{
  "success": true,
  "data": {
    "id_coleccion": 1,
    "id_marca": 1,
    "nombre": "SUPERNOVA",
    "descuento_default": 0.35,
    "marca": {
      "id_marca": 1,
      "nombre": "Holland & Sherry"
    },
    "telas": [
      {
        "id_tela": 1,
        "codigo": "1425000",
        "precio_por_yarda": 150.00
      }
    ]
  }
}
```

---

### 4. Crear colección

```
POST /api/catalogo/colecciones/marcas/:marcaId/colecciones
```

**Autenticación:** Admin ✅

**Ejemplo:** `POST /api/catalogo/colecciones/marcas/1/colecciones`

**Body:**
```json
{
  "nombre": "NEW COLLECTION",
  "descuento_default": 0.35
}
```

**Response Exitoso (201):**
```json
{
  "success": true,
  "data": {
    "id_coleccion": 9,
    "id_marca": 1,
    "nombre": "NEW COLLECTION",
    "descuento_default": 0.35,
    "createdAt": "2025-08-10T16:00:00.000Z",
    "updatedAt": "2025-08-10T16:00:00.000Z",
    "marca": {
      "id_marca": 1,
      "nombre": "Holland & Sherry"
    }
  }
}
```

---

### 5. Actualizar colección

```
PUT /api/catalogo/colecciones/:id
```

**Autenticación:** Admin ✅

**Body:**
```json
{
  "nombre": "NEW COLLECTION 2025",
  "descuento_default": 0.40
}
```

---

### 6. Eliminar colección

```
DELETE /api/catalogo/colecciones/:id
```

**Autenticación:** Admin ✅

**Response Exitoso:**
```json
{
  "success": true,
  "message": "Coleccion deleted successfully"
}
```

**Response Error (tiene telas):**
```json
{
  "success": false,
  "message": "Cannot delete coleccion with existing telas"
}
```

---

## 🧵 TELAS (FABRICS)

### 1. Obtener todas las telas

```
GET /api/catalogo/fabrics
```

**Autenticación:** Pública (con token de PIN)

**Response Exitoso:**
```json
{
  "success": true,
  "count": 150,
  "data": [
    {
      "id_tela": 1,
      "id_coleccion": 1,
      "codigo": "1425000",
      "precio_por_yarda": 150.00,
      "descuento": 0.35,
      "precio_neto": 97.50,
      "coleccion": {
        "nombre": "SUPERNOVA",
        "marca": {
          "nombre": "Holland & Sherry"
        }
      }
    }
  ]
}
```

---

### 2. Buscar tela por código

```
GET /api/catalogo/fabrics/code/:code
```

**Autenticación:** Pública (con token de PIN)

**Ejemplo:** `GET /api/catalogo/fabrics/code/1425000`

---

### 3. Buscar telas por texto

```
GET /api/catalogo/fabrics/search?q=query
```

**Autenticación:** Pública (con token de PIN)

---

### 4. Crear UNA tela (individual)

```
POST /api/catalogo/fabrics
```

**Autenticación:** Admin ✅

**Body:**
```json
{
  "id_coleccion": 1,
  "codigo": "1420001",
  "precio_por_yarda": 150,
  "descuento": 0.35
}
```

---

### 5. 🆕 Crear MÚLTIPLES telas (BATCH) ⭐

```
POST /api/catalogo/fabrics/batch
```

**Autenticación:** Admin ✅

**Body:**
```json
{
  "id_coleccion": 1,
  "codigos": ["1425000", "1425001", "1425002", "1425003", "1425004"],
  "precio_por_yarda": 150,
  "descuento": 0.35
}
```

**Response Exitoso (201):**
```json
{
  "success": true,
  "created": 5,
  "total": 5,
  "data": [
    {
      "id_tela": 152,
      "codigo": "1425000",
      "precio_por_yarda": 150.00,
      "precio_neto": 97.50
    }
  ],
  "errors": []
}
```

**Response Parcial:**
```json
{
  "success": true,
  "created": 3,
  "total": 5,
  "data": [/* 3 telas creadas */],
  "errors": [
    {
      "codigo": "1425004",
      "message": "Ya existe una tela con este código"
    }
  ]
}
```

---

### 6. 🆕 Actualizar MÚLTIPLES telas (BATCH) ⭐

```
PUT /api/catalogo/fabrics/batch
```

**Autenticación:** Admin ✅

**Body:**
```json
{
  "ids": [152, 153, 154],
  "precio_por_yarda": 160,
  "descuento": 0.30
}
```

**Response:**
```json
{
  "success": true,
  "updated": 3,
  "total": 3,
  "data": [/* telas actualizadas */],
  "errors": []
}
```

---

### 7. 🆕 Eliminar MÚLTIPLES telas (BATCH) ⭐

```
DELETE /api/catalogo/fabrics/batch
```

**Autenticación:** Admin ✅

**Body:**
```json
{
  "ids": [152, 153, 154]
}
```

**Response:**
```json
{
  "success": true,
  "deleted": 3,
  "total": 3,
  "data": [
    {"id": 152, "codigo": "1425000"},
    {"id": 153, "codigo": "1425001"}
  ],
  "errors": []
}
```

---

### 8. Actualizar UNA tela (individual)

```
PUT /api/catalogo/fabrics/:id
```

**Autenticación:** Admin ✅

---

### 9. Eliminar UNA tela (individual)

```
DELETE /api/catalogo/fabrics/:id
```

**Autenticación:** Admin ✅

---

## ✖️ MULTIPLICADORES (Tipos de Prenda)

### 1. Obtener todos los multiplicadores

```
GET /api/catalogo/multiplicadores
```

**Autenticación:** Pública (con token de PIN)

**Response Exitoso:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "nombre": "JACKET",
      "yardas_requeridas": 2.5,
      "costo_manufactura": 150,
      "costo_envio": 150,
      "costo_forro": 0,
      "markup": 3
    },
    {
      "id": 2,
      "nombre": "2 PIECES",
      "yardas_requeridas": 4,
      "costo_manufactura": 200,
      "costo_envio": 150,
      "costo_forro": 0,
      "markup": 3
    },
    {
      "id": 3,
      "nombre": "3 PIECES",
      "yardas_requeridas": 5,
      "costo_manufactura": 250,
      "costo_envio": 150,
      "costo_forro": 0,
      "markup": 3
    },
    {
      "id": 4,
      "nombre": "TROUSERS",
      "yardas_requeridas": 2,
      "costo_manufactura": 100,
      "costo_envio": 100,
      "costo_forro": 0,
      "markup": 3
    },
    {
      "id": 5,
      "nombre": "VEST",
      "yardas_requeridas": 1.75,
      "costo_manufactura": 100,
      "costo_envio": 75,
      "costo_forro": 0,
      "markup": 3
    }
  ]
}
```

**Notas:**
- ✅ SIN `codigo`
- ✅ SIN `createdAt`
- ✅ SIN `updatedAt`

---

### 2. Actualizar multiplicadores

```
POST /api/catalogo/multiplicadores
```

**Autenticación:** Admin ✅

**Body:**
```json
{
  "multiplicadores": [
    {
      "id_tipo_prenda": 1,
      "yardas_requeridas": 2.5,
      "costo_manufactura": 160,
      "costo_envio": 150,
      "costo_forro": 0,
      "markup": 3
    },
    {
      "id_tipo_prenda": 2,
      "costo_manufactura": 210
    }
  ]
}
```

**Response Exitoso:**
```json
{
  "success": true,
  "updated": 2,
  "total": 2,
  "data": [
    {
      "id": 1,
      "nombre": "JACKET",
      "yardas_requeridas": 2.5,
      "costo_manufactura": 160,
      "costo_envio": 150,
      "costo_forro": 0,
      "markup": 3
    },
    {
      "id": 2,
      "nombre": "2 PIECES",
      "yardas_requeridas": 4,
      "costo_manufactura": 210,
      "costo_envio": 150,
      "costo_forro": 0,
      "markup": 3
    }
  ],
  "errors": []
}
```

**Solo actualiza campos enviados** - Los campos no incluidos se mantienen igual.

---

## 💰 PRECIOS (PRICING)

### 1. Obtener configuración de precios

```
GET /api/catalogo/pricing/config
```

**Autenticación:** Pública (con token de PIN)

**Response:**
```json
{
  "success": true,
  "data": {
    "tipos_prenda": [
      {
        "id": 1,
        "nombre": "JACKET",
        "codigo": "jacket",
        "yardas_requeridas": 2.5,
        "costo_manufactura": 150,
        "costo_envio": 150,
        "costo_forro": 0,
        "markup": 3
      }
    ]
  }
}
```

---

### 2. Calcular precio

```
POST /api/catalogo/pricing/calculate
```

**Autenticación:** Pública (con token de PIN)

**Body:**
```json
{
  "tipo_prenda_codigo": "jacket",
  "codigo_tela": "1425000"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "precio_final": 607.50,
    "tela": {
      "codigo": "1425000",
      "codigo_completo": "Holland & Sherry SUPERNOVA 1425000",
      "precio_neto": 97.50
    },
    "tipo_prenda": {
      "id": 1,
      "nombre": "JACKET"
    },
    "desglose": {
      "costo_tela": 243.75,
      "gastos_fijos": 300,
      "costo_total": 543.75,
      "markup": 3,
      "yardas_requeridas": 2.5
    }
  }
}
```

---

### 3. Calcular todos los precios

```
POST /api/catalogo/pricing/calculate-all
```

**Autenticación:** Pública (con token de PIN)

**Body:**
```json
{
  "codigo_tela": "1425000"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tela": {
      "codigo": "1425000",
      "codigo_completo": "Holland & Sherry SUPERNOVA 1425000",
      "precio_neto": 97.50
    },
    "precios": [
      {
        "tipo_prenda": "JACKET",
        "codigo": "jacket",
        "precio_final": 607.50,
        "desglose": { /* ... */ }
      },
      {
        "tipo_prenda": "2 PIECES",
        "precio_final": 810,
        "desglose": { /* ... */ }
      }
    ]
  }
}
```

---

## 🔐 AUTENTICACIÓN

### Verificar PIN

```
POST /api/catalogo/auth/verify-pin
```

**Body:**
```json
{
  "pin": "1234"
}
```

**Response:**
```json
{
  "success": true,
  "message": "PIN verificado exitosamente",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "name": "Admin",
    "role": "ADMIN",
    "permissions": ["read", "write", "delete"]
  }
}
```

---

## 📊 Estructura de Datos

### Marca
```typescript
interface Marca {
  id_marca: number;
  nombre: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    colecciones: number;
  };
}
```

### Coleccion
```typescript
interface Coleccion {
  id_coleccion: number;
  id_marca: number;
  nombre: string;
  descuento_default: number;
  createdAt: string;
  updatedAt: string;
  marca?: Marca;
  _count?: {
    telas: number;
  };
}
```

### Tela
```typescript
interface Tela {
  id_tela: number;
  id_coleccion: number;
  codigo: string;
  precio_por_yarda: number;
  descuento: number;
  precio_neto: number;
  createdAt: string;
  updatedAt: string;
  coleccion?: {
    nombre: string;
    marca?: { nombre: string };
  };
}
```

### Multiplicador (TipoPrenda simplificado)
```typescript
interface Multiplicador {
  id: number;
  nombre: string;
  yardas_requeridas: number;
  costo_manufactura: number;
  costo_envio: number;
  costo_forro: number;
  markup: number;
}
```

---

## ⚠️ Códigos de Error Comunes

| Código | Significado |
|--------|-------------|
| 200 | OK |
| 201 | Creado exitosamente |
| 207 | Multi-status (parcialmente exitoso) |
| 400 | Bad Request (datos inválidos) |
| 401 | No autorizado (token inválido) |
| 403 | Forbidden (permisos insuficientes) |
| 404 | Not found (recurso no existe) |
| 500 | Error del servidor |

---

## 💡 Tips para Frontend

1. **Para operaciones batch:** Siempre revisar el array `errors` aunque `success` sea `true`
2. **Códigos de tela:** Se guardan en mayúsculas automáticamente
3. **Descuentos:** Usar formato decimal (0.35 = 35%, no 35)
4. **Eliminación en cascada:** Marca → Colección → Tela
5. **Multiplicadores GET:** No incluye `codigo`, `createdAt`, `updatedAt`
6. **Multiplicadores POST:** Solo actualiza campos enviados

---

**Versión:** 1.0 - Actualizado a agosto 2026
**Base Path:** `/api/catalogo`
