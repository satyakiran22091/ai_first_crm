import urllib.request
import urllib.error
import json

def test_ai():
    base_url = "http://127.0.0.1:8000"
    
    # 1. Add High Priority Lead
    import time
    ts = int(time.time())
    lead_data = {
        "name": f"Satya Nadella {ts}",
        "company": "Microsoft",
        "email": f"satya_{ts}@microsoft.com",
        "status": "New"
    }
    
    req = urllib.request.Request(
        f"{base_url}/add-lead",
        data=json.dumps(lead_data).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    
    with urllib.request.urlopen(req) as res:
        lead = json.loads(res.read().decode("utf-8"))
        lead_id = lead["id"]
        print(f"Added lead ID: {lead_id}")

    # 2. Analyze Lead
    try:
        with urllib.request.urlopen(f"{base_url}/analyze/{lead_id}") as res:
            analysis = json.loads(res.read().decode("utf-8"))
            print(json.dumps(analysis, indent=2))
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.read().decode()}")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_ai()
