import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Find all <button ...> tags and ensure they have cursor-pointer (unless disabled)
    def patch_button(match):
        button_tag = match.group(0)
        
        # If the button is disabled, ensure cursor-not-allowed
        if "disabled" in button_tag or "disabled=" in button_tag:
            if "cursor-not-allowed" not in button_tag:
                if 'className="' in button_tag:
                    button_tag = button_tag.replace('className="', 'className="cursor-not-allowed opacity-50 ')
                else:
                    # Very simple fallback
                    pass
        else:
            if "cursor-pointer" not in button_tag:
                if 'className="' in button_tag:
                    button_tag = button_tag.replace('className="', 'className="cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all ')
                elif "className={" in button_tag:
                    # It's a dynamic classname string like className={`...`}
                    # We inject it after the opening backtick
                    button_tag = button_tag.replace('className={`', 'className={`cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all ')

        return button_tag

    # Match opening <button ...> tag until the >
    content = re.sub(r'<button\b[^>]*>', patch_button, content)
    
    # Match <div ... onClick=...> tags
    def patch_div(match):
        div_tag = match.group(0)
        if "cursor-pointer" not in div_tag:
            if 'className="' in div_tag:
                div_tag = div_tag.replace('className="', 'className="cursor-pointer hover:bg-black/5 transition-colors ')
            elif "className={" in div_tag:
                div_tag = div_tag.replace('className={`', 'className={`cursor-pointer hover:bg-black/5 transition-colors ')
        return div_tag
        
    content = re.sub(r'<div\b[^>]*onClick=[^>]*>', patch_div, content)

    # Match <span ... onClick=...>
    def patch_span(match):
        span_tag = match.group(0)
        if "cursor-pointer" not in span_tag:
            if 'className="' in span_tag:
                span_tag = span_tag.replace('className="', 'className="cursor-pointer hover:text-coh-gold transition-colors ')
            elif "className={" in span_tag:
                span_tag = span_tag.replace('className={`', 'className={`cursor-pointer hover:text-coh-gold transition-colors ')
        return span_tag
        
    content = re.sub(r'<span\b[^>]*onClick=[^>]*>', patch_span, content)

    with open(filepath, 'w') as f:
        f.write(content)

process_file('src/App.tsx')
process_file('src/components/OperatingCoreAdmin.tsx')

print("Clickables patched globally")
