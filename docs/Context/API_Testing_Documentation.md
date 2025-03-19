# API Testing Documentation

## 1. Animals
### 1.1 POST Operations
- [x] POST /api/v1/animals/ - Create Animal ✅
- [ ] POST /api/v1/imports/preview - Preview Import
- [ ] POST /api/v1/imports/import/csv - Import CSV

### 1.2 GET Operations
- [ ] GET /api/v1/animals/ - List Animals
- [ ] GET /api/v1/animals/{id} - Get Animal
- [ ] GET /api/v1/animals/search - Search Animals
- [ ] GET /api/v1/animals/explotacio - Get Explotacion List

### 1.3 PUT Operations
- [ ] PUT /api/v1/animals/{id} - Update Animal

### 1.4 DELETE Operations
- [ ] DELETE /api/v1/animals/{id} - Delete Animal

## 2. Partos
### 2.1 POST Operations
- [ ] POST /api/v1/partos/partos - Create Parto

### 2.2 GET Operations
- [ ] GET /api/v1/partos/animals/{animal_id}/partos - Get Animal Partos

## 3. Dashboard
### 3.1 GET Operations
- [ ] GET /api/v1/dashboard/stats - Get Stats
- [ ] GET /api/v1/dashboard/resumen - Get Summary
- [ ] GET /api/v1/dashboard/recientes - Get Recent Activity

## 4. Explotacions
### 4.1 GET Operations
- [ ] GET /api/v1/explotacions/explotacions/{id}/stats - Get Explotacion Stats

## 5. Auth
### 5.1 POST Operations
- [ ] POST /api/v1/auth/auth/login - Login
- [ ] POST /api/v1/auth/auth/register - Register User

### 5.2 GET Operations
- [ ] GET /api/v1/auth/auth/me - Get Current User Info
- [ ] GET /api/v1/auth/auth/users - Get Users

## 6. Default
### 6.1 GET Operations
- [ ] GET / - Root
- [ ] GET /health - Health Check

## Tests por Ejecutar

### 1. Create Animal
**Endpoint:** POST /api/v1/animals/
**Request Body Schema:**
```json
{
  "nom": "string",
  "explotacio": "string",
  "genere": "M|F",
  "estado": "OK|DEF",
  "alletar": "boolean",
  "dob": "date",
  "pare": "string?",
  "mare": "string?",
  "quadra": "string?",
  "cod": "string?",
  "num_serie": "string?"
}
```

## Request Body Formats

### Create Animal (POST /api/v1/animals/)
```json
{
  "explotacio": "string",      // Requerido
  "nom": "string",             // Requerido
  "genere": "string",          // Requerido (M/F)
  "estado": "OK",              // Requerido (OK/DEF)
  "alletar": false,            // Opcional
  "pare": "string",            // Opcional
  "mare": "string",            // Opcional
  "quadra": "string",          // Opcional
  "cod": "string",             // Opcional
  "num_serie": "string",       // Opcional (formato ES+números)
  "dob": "2025-02-24T17:36:05.630Z"  // Opcional (ISO 8601)
}
```

## Examples

### Create Animal Example
```json
{
  "explotacio": "Gurans",
  "nom": "Test Vaca 1",
  "genere": "F",
  "estado": "OK",
  "alletar": false,
  "pare": "Toro 123",
  "mare": "Vaca 456",
  "quadra": "Q1",
  "cod": "V001",
  "num_serie": "ES123456789",
  "dob": "2024-02-24T17:36:05.630Z"
}
```

**Expected Response (201 Created)**:
```json
{
  "message": "Animal creado correctamente",
  "type": "success",
  "data": {
    "animal": {
      "id": 1,
      "explotacio": "Gurans",
      "nom": "Test Vaca 1",
      "genere": "F",
      "estado": "OK",
      "alletar": false,
      "pare": "Toro 123",
      "mare": "Vaca 456",
      "quadra": "Q1",
      "cod": "V001",
      "num_serie": "ES123456789",
      "dob": "2024-02-24T17:36:05.630Z"
    }
  }
}
```

**Notes**:
- All dates must be in ISO 8601 format
- `num_serie` must start with "ES" followed by numbers
- `genere` must be either "M" or "F"
- `estado` must be either "OK" or "DEF"
- Required fields cannot be null

## Test Results

### 1. Create Animal ✅
**Test Date**: 24/02/2025
**Status**: PASSED

#### Test Details:
```json
// Request
POST /api/v1/animals/
{
  "explotacio": "Gurans",
  "nom": "Test Vaca 1",
  "genere": "F",
  "estado": "OK",
  "alletar": false,
  "pare": "Toro 123",
  "mare": "Vaca 456",
  "quadra": "Q1",
  "cod": "V001",
  "num_serie": "ES123456789",
  "dob": "2024-02-24T17:36:05.630Z"
}

// Response (201 Created)
{
  "message": "Animal creado correctamente",
  "type": "success",
  "data": {
    "animal": {
      "nom": "Test Vaca 1",
      "explotacio": "Gurans",
      "genere": "F",
      "estado": "OK",
      "alletar": false,
      "dob": "24/02/2024",
      "pare": "Toro 123",
      "mare": "Vaca 456",
      "quadra": "Q1",
      "cod": "V001",
      "num_serie": "ES123456789"
    }
  },
  "status_code": 200
}
```

### 2. Preview Import ✅
**Test Date**: 24/02/2025
**Status**: IN PROGRESS

#### Test Details:
```json
// Request
POST /api/v1/imports/preview
Content-Type: multipart/form-data
{
    "file": "Binary CSV content"
}

// Expected Response (200 OK)
{
    "message": "Preview generado correctamente",
    "type": "success",
    "data": {
        "headers": ["Alletar", "explotació", "NOM", ...],
        "preview": [
            {
                "Alletar": "si",
                "explotació": "Gurans",
                "NOM": "Test Vaca 1",
                ...
            }
        ],
        "total_rows": 3,
        "valid_rows": 3,
        "errors": []
    }
}
```

### Next Test: Preview Import
**Endpoint:** POST /api/v1/imports/preview
**Description:** Preview CSV import before actual import

**Request:**
```json
{
  "file": "Binary file content (CSV)",
  "delimiter": ",",
  "encoding": "utf-8"
}
```

**Expected Response:**
```json
{
  "message": "Preview generado correctamente",
  "type": "success",
  "data": {
    "headers": ["explotacio", "nom", "genere", ...],
    "preview": [
      {
        "explotacio": "string",
        "nom": "string",
        "genere": "M|F",
        "estado": "OK|DEF",
        ...
      }
    ],
    "total_rows": 0,
    "valid_rows": 0,
    "errors": []
  }
}
```

## Test Cases: Import Preview

### Middleware Tests
- ✅ `test_animal_endpoint_not_affected`: Verifica que endpoints no-imports mantienen su formato original
- ✅ `test_imports_endpoint_transformed`: Verifica la transformación correcta de respuestas de imports

### Puntos Clave Verificados
1. Detección correcta de rutas de imports
2. Transformación del formato de respuesta
3. Preservación de datos originales
4. Manejo de diferentes tipos de respuesta
5. Gestión de errores y logging

### Ejemplo de Test
```python
def test_imports_endpoint_transformed():
    """Test that import endpoints get transformed response"""
    response = client.post(
        "/api/v1/imports/preview",
        files={"file": ("test.csv", test_file, "text/csv")}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert all(key in data for key in ["message", "type", "data"])
