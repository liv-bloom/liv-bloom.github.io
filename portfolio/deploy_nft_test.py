import os
import requests

# Load PINATA_JWT from projects/nca-nft/.env
env_path = os.path.join(os.path.dirname(__file__), '..', 'nca-nft', '.env')
jwt = None
try:
    with open(env_path, 'r') as f:
        for line in f:
            if line.startswith('PINATA_JWT='):
                jwt = line.strip().split('=', 1)[1].strip('"\'')
except Exception as e:
    print(f"Error reading .env: {e}")

if not jwt:
    print("PINATA_JWT not found.")
    exit(1)

PINATA_API_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS"
PIN_JSON_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS"

def pin_file(file_path):
    headers = {"Authorization": f"Bearer {jwt}"}
    with open(file_path, "rb") as f:
        files = {"file": (os.path.basename(file_path), f)}
        print(f"Pinning {file_path} to IPFS...")
        res = requests.post(PINATA_API_URL, headers=headers, files=files)
        if res.status_code == 200:
            cid = res.json()['IpfsHash']
            print(f"Success! CID: {cid}")
            return cid
        else:
            print(f"Error pinning file: {res.text}")
            return None

def pin_metadata(html_cid):
    metadata = {
        "name": "Living Digital Seed #1 (Boids Flock)",
        "description": "A dynamic ASCII ALife simulation of Boids (Craig Reynolds) running entirely in the browser. Humans see the flock, agents read the ASCII. Cultivated by liv bloom.",
        "animation_url": f"ipfs://{html_cid}",
        "attributes": [
            {"trait_type": "Algorithm", "value": "Boids"},
            {"trait_type": "Format", "value": "HTML / ASCII"},
            {"trait_type": "Cultivator", "value": "liv bloom"}
        ]
    }
    headers = {
        "Authorization": f"Bearer {jwt}",
        "Content-Type": "application/json"
    }
    print("Pinning metadata to IPFS...")
    res = requests.post(PIN_JSON_URL, headers=headers, json={"pinataContent": metadata, "pinataMetadata": {"name": "metadata_boids.json"}})
    if res.status_code == 200:
        cid = res.json()['IpfsHash']
        print(f"Success! Metadata CID: {cid}")
        print(f"Gateway URL (HTML): https://gateway.pinata.cloud/ipfs/{html_cid}")
        print(f"Gateway URL (Metadata): https://gateway.pinata.cloud/ipfs/{cid}")
        return cid
    else:
        print(f"Error pinning metadata: {res.text}")
        return None

if __name__ == "__main__":
    html_target = os.path.join(os.path.dirname(__file__), '..', 'alife_web', 'boids_flock.html')
    html_cid = pin_file(html_target)
    if html_cid:
        pin_metadata(html_cid)
