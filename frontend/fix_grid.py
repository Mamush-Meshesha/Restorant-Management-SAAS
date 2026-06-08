"""
MUI Grid v5 → v7 migration script.

Converts deprecated Grid props to the new unified API:
  Old: <Grid item xs={12} sm={6} md={4}>
  New: <Grid size={{ xs: 12, sm: 6, md: 4 }}>

Also removes the standalone `item` prop:
  Old: <Grid item>
  New: <Grid>

Handles:
  - <Grid item xs={...} sm={...}>
  - <Grid xs={...} md={...}>  (item prop already absent)
  - Quoted values like xs="12"
  - Preserves all other props (spacing, sx, etc.)
  - Removes 'item' keyword prop
  - Does NOT touch <Grid container> spacing props
"""

import os
import re


BREAKPOINTS = {'xs', 'sm', 'md', 'lg', 'xl'}


def replacer(match):
    """Convert a single <Grid ...> tag."""
    tag_content = match.group(1)

    # Parse all props — handle both {expr} and "string" values
    all_props = re.findall(
        r'(\w+)=\{([^}]*)\}|(\w+)="([^"]*)"|(\bitem\b)',
        tag_content
    )

    sizes = {}
    other_attrs = []

    # Rebuild props from regex groups
    raw_attrs = tag_content.strip()

    # Remove 'item' keyword
    raw_attrs = re.sub(r'\bitem\b', '', raw_attrs)

    # Extract breakpoint props
    def extract_bp(text):
        result = {}
        kept = text
        for bp in BREAKPOINTS:
            # Numeric / expression: xs={12}
            m = re.search(rf'\b{bp}=\{{([^}}]*)\}}', kept)
            if m:
                result[bp] = m.group(1).strip()
                kept = kept.replace(m.group(0), '', 1)
                continue
            # Quoted: xs="12"
            m = re.search(rf'\b{bp}="([^"]*)"', kept)
            if m:
                result[bp] = m.group(1).strip()
                kept = kept.replace(m.group(0), '', 1)
        return result, kept.strip()

    sizes, remaining = extract_bp(raw_attrs)

    # Clean up extra whitespace
    remaining = re.sub(r'\s{2,}', ' ', remaining).strip()

    # Build the new tag
    parts = ['<Grid']
    if sizes:
        size_str = ', '.join(f'{k}: {v}' for k, v in sorted(sizes.items()))
        parts.append(f'size={{{{ {size_str} }}}}')
    if remaining:
        parts.append(remaining)
    parts.append('>')

    return ' '.join(parts).replace(' >', '>')


def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Match any <Grid ...> tag that has at least one breakpoint or 'item' prop
    # Uses a non-greedy match that stops at the first >
    pattern = re.compile(
        r'<Grid\s+((?:[^>](?!/>))*?(?:\bitem\b|'
        + '|'.join(BREAKPOINTS)
        + r')[^>]*?)>',
        re.DOTALL
    )

    new_content = pattern.sub(replacer, content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'  ✔ Fixed: {filepath}')
        return True
    return False


def main():
    search_roots = ['src/views', 'src/layouts', 'src/components']
    fixed = 0
    for root_dir in search_roots:
        if not os.path.isdir(root_dir):
            continue
        for dirpath, _, files in os.walk(root_dir):
            for fname in files:
                if fname.endswith('.tsx') or fname.endswith('.jsx'):
                    path = os.path.join(dirpath, fname)
                    if fix_file(path):
                        fixed += 1

    print(f'\nDone — {fixed} file(s) updated.')


if __name__ == '__main__':
    main()
