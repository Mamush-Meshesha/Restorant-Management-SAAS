import os
import re

def fix_grid(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    def replacer(match):
        attrs = match.group(1)
        sizes = []
        other_attrs = []
        for attr_match in re.finditer(r'([a-zA-Z0-9_]+)={([^}]+)}', attrs):
            key = attr_match.group(1)
            val = attr_match.group(2)
            if key in ['xs', 'sm', 'md', 'lg', 'xl']:
                sizes.append(f"{key}: {val}")
            else:
                other_attrs.append(f"{key}={{{val}}}")
        
        for attr_match in re.finditer(r'([a-zA-Z0-9_]+)="([^"]+)"', attrs):
            key = attr_match.group(1)
            val = attr_match.group(2)
            if key in ['xs', 'sm', 'md', 'lg', 'xl']:
                sizes.append(f"{key}: {val}")
            else:
                other_attrs.append(f'{key}="{val}"')

        # check for naked sizes like xs={12} that the regex missed due to spaces? No, regex is fine.
        
        sizes_str = "{" + ", ".join(sizes) + "}" if sizes else ""
        other_str = " ".join(other_attrs)
        
        res = "<Grid"
        if sizes_str:
            res += f" size={{{sizes_str}}}"
        if other_str:
            res += f" {other_str}"
        res += ">"
        return res

    new_content = re.sub(r'<Grid\s+item\s+([^>]+)>', replacer, content)
    new_content = re.sub(r'<Grid\s+item>', r'<Grid>', new_content)

    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Fixed {filepath}")

for root, dirs, files in os.walk('src/views'):
    for file in files:
        if file.endswith('.tsx'):
            fix_grid(os.path.join(root, file))
