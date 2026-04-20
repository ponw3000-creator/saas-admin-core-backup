import re

with open('/Users/mac/Desktop/saas-admin-workbench/src/views/Setting/Team.vue', 'r') as f:
    content = f.read()

start = content.find('<template>')
end = content.find('</template>', start) + len('</template>')
template = content[start:end]

stack = []
line_num = 1
errors = []

i = 0
while i < len(template):
    if template[i] == '\n':
        line_num += 1
    if template[i] == '<' and template[i:i+4] != '<!--':
        tag_end = template.find('>', i)
        if tag_end == -1:
            break
        tag = template[i+1:tag_end].strip()

        if tag.startswith('!'):
            i = tag_end + 1
            continue

        is_closing = tag.startswith('/')
        is_self_closing = tag.endswith('/')

        if is_closing:
            parts = tag[1:].strip().split()
            tag_name = parts[0] if parts else ''
            if stack and stack[-1] == tag_name:
                stack.pop()
            else:
                errors.append(f'Line {line_num}: mismatched </{tag_name}>')
        elif is_self_closing:
            pass
        else:
            parts = tag.split()
            tag_name = parts[0] if parts else ''
            if tag_name not in ['template', 'slot', 'component', 'el-dropdown-menu', 'el-tooltip']:
                stack.append(tag_name)

        i = tag_end + 1
    else:
        i += 1

if stack:
    for t in stack:
        errors.append(f'Unclosed tag: {t}')

print(f'Total errors: {len(errors)}')
for e in errors[:10]:
    print(e)
if not errors:
    print('Template structure is VALID!')
