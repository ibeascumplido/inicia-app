"""
Test suite for Vacaciones and Días Libres functionality
Tests the calendar module for managing operator vacations and free days
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestOperariosEndpoints:
    """Test operarios CRUD operations"""
    
    def test_get_operarios(self):
        """Test GET /api/operarios returns list of operarios"""
        response = requests.get(f"{BASE_URL}/api/operarios")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Should have Daniel and Vanesa
        assert len(data) >= 2
        
    def test_operario_has_dias_libres_field(self):
        """Test that operarios have dias_libres field"""
        response = requests.get(f"{BASE_URL}/api/operarios")
        assert response.status_code == 200
        data = response.json()
        for op in data:
            assert "dias_libres" in op, f"Operario {op['nombre']} missing dias_libres field"
            assert "dias_vacaciones" in op, f"Operario {op['nombre']} missing dias_vacaciones field"
            assert isinstance(op["dias_libres"], int)
            assert isinstance(op["dias_vacaciones"], int)

    def test_create_operario_with_dias_libres(self):
        """Test creating operario with dias_libres field"""
        test_operario = {
            "nombre": f"TEST_Operario_{uuid.uuid4().hex[:6]}",
            "abreviatura": "TST",
            "color": "#FF0000",
            "dias_vacaciones": 25,
            "dias_libres": 8
        }
        response = requests.post(f"{BASE_URL}/api/operarios", json=test_operario)
        assert response.status_code == 200
        data = response.json()
        assert data["nombre"] == test_operario["nombre"]
        assert data["dias_vacaciones"] == 25
        assert data["dias_libres"] == 8
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/operarios/{data['id']}")
        
    def test_update_operario_dias_vacaciones(self):
        """Test updating operario dias_vacaciones"""
        # Get first operario
        response = requests.get(f"{BASE_URL}/api/operarios")
        operarios = response.json()
        if len(operarios) == 0:
            pytest.skip("No operarios to test")
        
        operario = operarios[0]
        original_dias = operario.get("dias_vacaciones", 22)
        
        # Update dias_vacaciones
        new_dias = original_dias + 5
        response = requests.put(f"{BASE_URL}/api/operarios/{operario['id']}", 
                               json={"dias_vacaciones": new_dias})
        assert response.status_code == 200
        data = response.json()
        assert data["dias_vacaciones"] == new_dias
        
        # Verify with GET
        response = requests.get(f"{BASE_URL}/api/operarios")
        updated = next(op for op in response.json() if op["id"] == operario["id"])
        assert updated["dias_vacaciones"] == new_dias
        
        # Restore original
        requests.put(f"{BASE_URL}/api/operarios/{operario['id']}", 
                    json={"dias_vacaciones": original_dias})
        
    def test_update_operario_dias_libres(self):
        """Test updating operario dias_libres"""
        # Get first operario
        response = requests.get(f"{BASE_URL}/api/operarios")
        operarios = response.json()
        if len(operarios) == 0:
            pytest.skip("No operarios to test")
        
        operario = operarios[0]
        original_dias = operario.get("dias_libres", 6)
        
        # Update dias_libres
        new_dias = original_dias + 3
        response = requests.put(f"{BASE_URL}/api/operarios/{operario['id']}", 
                               json={"dias_libres": new_dias})
        assert response.status_code == 200
        data = response.json()
        assert data["dias_libres"] == new_dias
        
        # Verify with GET
        response = requests.get(f"{BASE_URL}/api/operarios")
        updated = next(op for op in response.json() if op["id"] == operario["id"])
        assert updated["dias_libres"] == new_dias
        
        # Restore original
        requests.put(f"{BASE_URL}/api/operarios/{operario['id']}", 
                    json={"dias_libres": original_dias})


class TestVacacionesResumen:
    """Test vacaciones resumen endpoint with dias libres"""
    
    def test_resumen_returns_all_fields(self):
        """Test GET /api/vacaciones/resumen returns all required fields"""
        response = requests.get(f"{BASE_URL}/api/vacaciones/resumen", params={"year": 2025})
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        for item in data:
            # Vacaciones fields
            assert "dias_disponibles" in item, "Missing dias_disponibles"
            assert "dias_disfrutados" in item, "Missing dias_disfrutados"
            assert "dias_restantes" in item, "Missing dias_restantes"
            # Dias libres fields
            assert "dias_libres_disponibles" in item, "Missing dias_libres_disponibles"
            assert "dias_libres_disfrutados" in item, "Missing dias_libres_disfrutados"
            assert "dias_libres_restantes" in item, "Missing dias_libres_restantes"
            # Operario info
            assert "operario_id" in item
            assert "nombre" in item
            assert "abreviatura" in item
            assert "color" in item
            
    def test_resumen_calculates_restantes_correctly(self):
        """Test that restantes = disponibles - disfrutados"""
        response = requests.get(f"{BASE_URL}/api/vacaciones/resumen", params={"year": 2025})
        assert response.status_code == 200
        data = response.json()
        
        for item in data:
            # Vacaciones calculation
            expected_restantes = item["dias_disponibles"] - item["dias_disfrutados"]
            assert item["dias_restantes"] == expected_restantes, \
                f"Vacaciones restantes mismatch for {item['nombre']}: expected {expected_restantes}, got {item['dias_restantes']}"
            
            # Dias libres calculation
            expected_libres_restantes = item["dias_libres_disponibles"] - item["dias_libres_disfrutados"]
            assert item["dias_libres_restantes"] == expected_libres_restantes, \
                f"Dias libres restantes mismatch for {item['nombre']}: expected {expected_libres_restantes}, got {item['dias_libres_restantes']}"


class TestVacacionesCRUD:
    """Test vacaciones CRUD with tipo field"""
    
    def test_create_vacacion_tipo_vacacion(self):
        """Test creating a vacation with tipo='vacacion'"""
        # Get first operario
        response = requests.get(f"{BASE_URL}/api/operarios")
        operarios = response.json()
        if len(operarios) == 0:
            pytest.skip("No operarios to test")
        
        operario = operarios[0]
        test_fecha = "2025-12-25"
        
        # Create vacacion
        vacacion_data = {
            "operario_id": operario["id"],
            "fecha": test_fecha,
            "tipo": "vacacion"
        }
        response = requests.post(f"{BASE_URL}/api/vacaciones", json=vacacion_data)
        
        # May already exist, so accept 200 or 400
        if response.status_code == 200:
            data = response.json()
            assert data["tipo"] == "vacacion"
            assert data["operario_id"] == operario["id"]
            assert data["fecha"] == test_fecha
            
            # Cleanup
            requests.delete(f"{BASE_URL}/api/vacaciones/{operario['id']}/{test_fecha}")
        elif response.status_code == 400:
            # Already exists, clean up and retry
            requests.delete(f"{BASE_URL}/api/vacaciones/{operario['id']}/{test_fecha}")
            response = requests.post(f"{BASE_URL}/api/vacaciones", json=vacacion_data)
            assert response.status_code == 200
            requests.delete(f"{BASE_URL}/api/vacaciones/{operario['id']}/{test_fecha}")
            
    def test_create_vacacion_tipo_libre(self):
        """Test creating a vacation with tipo='libre'"""
        # Get first operario
        response = requests.get(f"{BASE_URL}/api/operarios")
        operarios = response.json()
        if len(operarios) == 0:
            pytest.skip("No operarios to test")
        
        operario = operarios[0]
        test_fecha = "2025-12-26"
        
        # Cleanup first
        requests.delete(f"{BASE_URL}/api/vacaciones/{operario['id']}/{test_fecha}")
        
        # Create dia libre
        vacacion_data = {
            "operario_id": operario["id"],
            "fecha": test_fecha,
            "tipo": "libre"
        }
        response = requests.post(f"{BASE_URL}/api/vacaciones", json=vacacion_data)
        assert response.status_code == 200
        data = response.json()
        assert data["tipo"] == "libre"
        assert data["operario_id"] == operario["id"]
        assert data["fecha"] == test_fecha
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/vacaciones/{operario['id']}/{test_fecha}")
        
    def test_vacacion_increments_disfrutados(self):
        """Test that creating a vacacion increments dias_disfrutados"""
        # Get first operario
        response = requests.get(f"{BASE_URL}/api/operarios")
        operarios = response.json()
        if len(operarios) == 0:
            pytest.skip("No operarios to test")
        
        operario = operarios[0]
        test_fecha = "2025-12-27"
        
        # Get initial resumen
        response = requests.get(f"{BASE_URL}/api/vacaciones/resumen", params={"year": 2025})
        initial_resumen = next(r for r in response.json() if r["operario_id"] == operario["id"])
        initial_disfrutados = initial_resumen["dias_disfrutados"]
        
        # Cleanup first
        requests.delete(f"{BASE_URL}/api/vacaciones/{operario['id']}/{test_fecha}")
        
        # Create vacacion
        vacacion_data = {
            "operario_id": operario["id"],
            "fecha": test_fecha,
            "tipo": "vacacion"
        }
        response = requests.post(f"{BASE_URL}/api/vacaciones", json=vacacion_data)
        assert response.status_code == 200
        
        # Check resumen updated
        response = requests.get(f"{BASE_URL}/api/vacaciones/resumen", params={"year": 2025})
        new_resumen = next(r for r in response.json() if r["operario_id"] == operario["id"])
        assert new_resumen["dias_disfrutados"] == initial_disfrutados + 1
        assert new_resumen["dias_restantes"] == new_resumen["dias_disponibles"] - new_resumen["dias_disfrutados"]
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/vacaciones/{operario['id']}/{test_fecha}")
        
    def test_libre_increments_dias_libres_disfrutados(self):
        """Test that creating a dia libre increments dias_libres_disfrutados"""
        # Get first operario
        response = requests.get(f"{BASE_URL}/api/operarios")
        operarios = response.json()
        if len(operarios) == 0:
            pytest.skip("No operarios to test")
        
        operario = operarios[0]
        test_fecha = "2025-12-28"
        
        # Get initial resumen
        response = requests.get(f"{BASE_URL}/api/vacaciones/resumen", params={"year": 2025})
        initial_resumen = next(r for r in response.json() if r["operario_id"] == operario["id"])
        initial_libres_disfrutados = initial_resumen["dias_libres_disfrutados"]
        
        # Cleanup first
        requests.delete(f"{BASE_URL}/api/vacaciones/{operario['id']}/{test_fecha}")
        
        # Create dia libre
        vacacion_data = {
            "operario_id": operario["id"],
            "fecha": test_fecha,
            "tipo": "libre"
        }
        response = requests.post(f"{BASE_URL}/api/vacaciones", json=vacacion_data)
        assert response.status_code == 200
        
        # Check resumen updated
        response = requests.get(f"{BASE_URL}/api/vacaciones/resumen", params={"year": 2025})
        new_resumen = next(r for r in response.json() if r["operario_id"] == operario["id"])
        assert new_resumen["dias_libres_disfrutados"] == initial_libres_disfrutados + 1
        assert new_resumen["dias_libres_restantes"] == new_resumen["dias_libres_disponibles"] - new_resumen["dias_libres_disfrutados"]
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/vacaciones/{operario['id']}/{test_fecha}")
        
    def test_delete_vacacion_decrements_disfrutados(self):
        """Test that deleting a vacacion decrements dias_disfrutados"""
        # Get first operario
        response = requests.get(f"{BASE_URL}/api/operarios")
        operarios = response.json()
        if len(operarios) == 0:
            pytest.skip("No operarios to test")
        
        operario = operarios[0]
        test_fecha = "2025-12-29"
        
        # Cleanup first
        requests.delete(f"{BASE_URL}/api/vacaciones/{operario['id']}/{test_fecha}")
        
        # Create vacacion
        vacacion_data = {
            "operario_id": operario["id"],
            "fecha": test_fecha,
            "tipo": "vacacion"
        }
        requests.post(f"{BASE_URL}/api/vacaciones", json=vacacion_data)
        
        # Get resumen after creation
        response = requests.get(f"{BASE_URL}/api/vacaciones/resumen", params={"year": 2025})
        after_create = next(r for r in response.json() if r["operario_id"] == operario["id"])
        
        # Delete vacacion
        response = requests.delete(f"{BASE_URL}/api/vacaciones/{operario['id']}/{test_fecha}")
        assert response.status_code == 200
        
        # Check resumen updated
        response = requests.get(f"{BASE_URL}/api/vacaciones/resumen", params={"year": 2025})
        after_delete = next(r for r in response.json() if r["operario_id"] == operario["id"])
        assert after_delete["dias_disfrutados"] == after_create["dias_disfrutados"] - 1


class TestVacacionesFiltering:
    """Test vacaciones filtering by month"""
    
    def test_get_vacaciones_by_month(self):
        """Test GET /api/vacaciones with month filter"""
        response = requests.get(f"{BASE_URL}/api/vacaciones", params={"month": "2025-12"})
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # All returned vacaciones should be in December 2025
        for v in data:
            assert v["fecha"].startswith("2025-12")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
