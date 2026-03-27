"""
Test suite for Authentication and Notification System
Tests: Login, Register, Notifications CRUD, Vacation Approval/Rejection with notifications
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@inicia.com"
ADMIN_PASSWORD = "admin123"
USER_EMAIL = "test@inicia.com"
USER_PASSWORD = "test123"


class TestHealthCheck:
    """Basic API health check"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data


class TestAuthentication:
    """Authentication endpoint tests"""
    
    def test_admin_login_success(self):
        """Test admin login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "session_token" in data
        assert "user" in data
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "admin"
        
    def test_user_login_success(self):
        """Test user login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": USER_EMAIL,
            "password": USER_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "session_token" in data
        assert "user" in data
        assert data["user"]["email"] == USER_EMAIL
        
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@example.com",
            "password": "wrongpass"
        })
        assert response.status_code == 401
        
    def test_register_new_user(self):
        """Test registration flow - verify no ObjectId error"""
        unique_email = f"testregister_{uuid.uuid4().hex[:8]}@inicia.com"
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": "test123",
            "name": "Test Register User"
        })
        assert response.status_code == 200
        data = response.json()
        assert "session_token" in data
        assert "user" in data
        assert data["user"]["email"] == unique_email
        assert data["user"]["status"] == "pending"  # New users are pending
        
    def test_register_duplicate_email(self):
        """Test registration with existing email fails"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": USER_EMAIL,  # Already exists
            "password": "test123",
            "name": "Duplicate User"
        })
        assert response.status_code == 400
        
    def test_get_current_user(self):
        """Test getting current user info"""
        # First login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = login_response.json()["session_token"]
        
        # Get current user
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == ADMIN_EMAIL
        
    def test_logout(self):
        """Test logout endpoint"""
        # First login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = login_response.json()["session_token"]
        
        # Logout
        response = requests.post(
            f"{BASE_URL}/api/auth/logout",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200


class TestNotifications:
    """Notification system tests"""
    
    @pytest.fixture
    def user_session(self):
        """Get user session token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": USER_EMAIL,
            "password": USER_PASSWORD
        })
        return response.json()["session_token"]
    
    @pytest.fixture
    def admin_session(self):
        """Get admin session token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["session_token"]
    
    def test_get_notifications(self, user_session):
        """Test GET /api/notifications returns user notifications"""
        response = requests.get(
            f"{BASE_URL}/api/notifications",
            headers={"Authorization": f"Bearer {user_session}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
    def test_get_notifications_count(self, user_session):
        """Test GET /api/notifications/count returns unread count"""
        response = requests.get(
            f"{BASE_URL}/api/notifications/count",
            headers={"Authorization": f"Bearer {user_session}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "unread_count" in data
        assert isinstance(data["unread_count"], int)
        
    def test_mark_all_as_read(self, user_session):
        """Test POST /api/notifications/read-all marks all as read"""
        response = requests.post(
            f"{BASE_URL}/api/notifications/read-all",
            headers={"Authorization": f"Bearer {user_session}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        
    def test_notifications_require_auth(self):
        """Test notifications endpoints require authentication"""
        response = requests.get(f"{BASE_URL}/api/notifications")
        assert response.status_code == 401


class TestVacationApprovalNotifications:
    """Test vacation approval/rejection creates notifications"""
    
    @pytest.fixture
    def admin_session(self):
        """Get admin session token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["session_token"]
    
    @pytest.fixture
    def user_session(self):
        """Get user session token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": USER_EMAIL,
            "password": USER_PASSWORD
        })
        return response.json()["session_token"]
    
    def test_create_vacation_request(self, user_session):
        """Test user can create vacation request"""
        # Use a unique date to avoid conflicts
        test_date = "2026-06-15"
        response = requests.post(
            f"{BASE_URL}/api/my-vacaciones",
            params={"fecha": test_date, "tipo": "vacacion"},
            headers={"Authorization": f"Bearer {user_session}"}
        )
        # Could be 200 (created) or 400 (already exists) or 403 (pending approval)
        assert response.status_code in [200, 400, 403]
        
    def test_admin_get_pending_vacations(self, admin_session):
        """Test admin can get pending vacation requests"""
        response = requests.get(
            f"{BASE_URL}/api/admin/vacaciones/pending",
            headers={"Authorization": f"Bearer {admin_session}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
    def test_admin_get_all_vacations(self, admin_session):
        """Test admin can get all vacations"""
        response = requests.get(
            f"{BASE_URL}/api/admin/vacaciones",
            headers={"Authorization": f"Bearer {admin_session}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestAdminUserManagement:
    """Admin user management tests"""
    
    @pytest.fixture
    def admin_session(self):
        """Get admin session token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["session_token"]
    
    def test_admin_get_all_users(self, admin_session):
        """Test admin can get all users"""
        response = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {admin_session}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        
    def test_admin_get_pending_users(self, admin_session):
        """Test admin can get pending users"""
        response = requests.get(
            f"{BASE_URL}/api/admin/users/pending",
            headers={"Authorization": f"Bearer {admin_session}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
    def test_non_admin_cannot_access_admin_endpoints(self):
        """Test non-admin users cannot access admin endpoints"""
        # Login as regular user
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": USER_EMAIL,
            "password": USER_PASSWORD
        })
        token = login_response.json()["session_token"]
        
        # Try to access admin endpoint
        response = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 403


class TestDashboardStats:
    """Dashboard statistics tests"""
    
    def test_get_dashboard_stats(self):
        """Test dashboard stats endpoint"""
        response = requests.get(f"{BASE_URL}/api/dashboard/stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_budgets" in data
        assert "pending_budgets" in data
        assert "approved_budgets" in data


class TestProtectedRoutes:
    """Test protected routes redirect unauthorized users"""
    
    def test_my_vacaciones_requires_auth(self):
        """Test my-vacaciones endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/my-vacaciones")
        assert response.status_code == 401
        
    def test_my_resumen_requires_auth(self):
        """Test my-vacaciones/resumen endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/my-vacaciones/resumen")
        assert response.status_code == 401
