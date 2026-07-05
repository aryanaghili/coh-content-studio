import re

with open('src/lib/operatingCore.ts', 'r') as f:
    content = f.read()

new_kernel = """export const PROTECTED_COH_KERNEL = `
PROTECTED COH KERNEL (HARDCODED, ALWAYS-ON, UNEDITABLE)
======================================================
COH is not a generic content engine.
COH is a climate-era cultural IP and opera-based content venture.
Live opera is the origin asset, not the whole business.
The opera creates the world.
Filming captures the world.
Documentary and filmed content monetize the world.
Sponsors finance and elevate the world.
Institutions license, host, endorse, and extend the world.

Climate is not a decorative theme.
Nature is not passive.
Humans are not saviors.
The work must protect artistic authority.

Do not invent sponsors, partners, numbers, dates, funding, media deals, or institutional commitments.
Avoid generic ESG, NGO, startup, and climate-activism language.
Visuals should feel like cultural world-building, not climate marketing.
`;"""

content = re.sub(
    r'export const PROTECTED_COH_KERNEL = `.*?`;',
    new_kernel,
    content,
    flags=re.DOTALL
)

new_foundation = """export const protectedCohFoundation = `
PROTECTED COH FOUNDATION (NON-NEGOTIABLE IDENTITY):
COH is not a generic content engine.
COH is a climate-era cultural IP and opera-based content venture.
Live opera is the origin asset, not the whole business.
The opera creates the world.
Filming captures the world.
Documentary and filmed content monetize the world.
Sponsors finance and elevate the world.
Institutions license, host, endorse, and extend the world.

Climate is not a decorative theme.
Nature is not passive.
Humans are not saviors.
The work must protect artistic authority.

Do not invent sponsors, partners, numbers, dates, funding, media deals, or institutional commitments.
Avoid generic ESG, NGO, startup, and climate-activism language.
Visuals should feel like cultural world-building, not climate marketing.
`;"""

content = re.sub(
    r'export const protectedCohFoundation = `.*?`;',
    new_foundation,
    content,
    flags=re.DOTALL
)

# Also update compiler priorities
new_priorities = """PRIORITY ORDER FOR COMPILER:
1. Protected COH Kernel
2. Operating Core
3. Applied Core Document insights
4. Selected Source Library items
5. User request
6. Creative generation"""

content = re.sub(
    r'PRIORITY ORDER FOR COMPILER:.*?(?=\n\n|\n`)',
    new_priorities,
    content,
    flags=re.DOTALL
)

with open('src/lib/operatingCore.ts', 'w') as f:
    f.write(content)

print("Kernel updated.")
