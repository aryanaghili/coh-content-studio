import re

with open('src/lib/operatingCore.ts', 'r') as f:
    content = f.read()

# Fix literal \n in proofLadder
content = content.replace("COP30 = proof of attention and legitimacy.\\nLondon = proof of delivery, capture, and productization.\\nPost-London = proof of adoption and repeatability.", "COP30 = proof of attention and legitimacy.\\nLondon = proof of delivery, capture, and productization.\\nPost-London = proof of adoption and repeatability.")

with open('src/lib/operatingCore.ts', 'w') as f:
    f.write(content)

print("Newlines patched.")
