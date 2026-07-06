with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
in_return = False
for line in lines:
    if "return `You are the COH Content Marketing Mastermind for Climate Opera Haus." in line and not in_return:
        in_return = True
        
        # We also need to get the context right before returning
        # We need to call compileOperatingCoreContext
        
        injection = """
    const operatingCoreContext = compileOperatingCoreContext(operatingCore, {
      workspace: creationMode === 'simple' ? 'Simple Mode' : (creationMode === 'quick' ? 'Quick Create' : 'Advanced Brief'),
      channel: channel,
      audience: aud
    });

    return `${operatingCoreContext}

You are the COH Content Marketing Mastermind for Climate Opera Haus.

ROLE: Create professional, source-grounded content for Climate Opera Haus.

SELECTED USER SOURCES:
${sourceContext || '(No user sources selected.)'}

CONTENT BRIEF:
"""
        new_lines.append(injection)
        continue
    
    if in_return:
        if "CONTENT BRIEF:" in line:
            in_return = False # resume normally after this line is skipped since we injected it
            continue
        continue # skip lines until we hit CONTENT BRIEF:
        
    new_lines.append(line)

with open('src/App.tsx', 'w') as f:
    f.writelines(new_lines)
