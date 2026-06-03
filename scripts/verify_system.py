import httpx
import sys
import json

BASE_URL = "https://fluxpay-backend.onrender.com/api"

def check_health():
    print("Checking system health...")
    try:
        response = httpx.get(f"{BASE_URL.replace('/api', '')}/health")
        if response.status_code == 200:
            print("✅ Backend is LIVE")
            return True
        else:
            print(f"❌ Backend returned status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def check_data_structures():
    """
    Simulates a plan fetch to verify JSON structure.
    Note: This will return 401 but we can check if it's a 'clean' 401 or a 500 crash.
    """
    print("Verifying data contract (Plans)...")
    try:
        response = httpx.get(f"{BASE_URL}/plans/")
        if response.status_code == 401:
            print("✅ API is correctly enforcing authentication (Clean 401)")
            return True
        elif response.status_code == 500:
            print("❌ API CRASHED with 500. Likely a Pydantic Serialization Error.")
            return False
        elif response.status_code == 404:
            print("❌ API returned 404. Router is not registered correctly.")
            return False
        else:
            print(f"⚠️ Unexpected status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False

if __name__ == "__main__":
    h = check_health()
    d = check_data_structures()
    
    if h and d:
        print("\n✨ SMOKE TEST PASSED: Backend is stable and correctly routed.")
        sys.exit(0)
    else:
        print("\n🚨 SMOKE TEST FAILED: See errors above.")
        sys.exit(1)
