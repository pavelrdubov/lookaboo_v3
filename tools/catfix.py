#!/usr/bin/env python3
"""Правки из каталога (catalog.html → «Скопировать правки») → переименовать файлы картинок.

    python3 tools/catfix.py правки.txt      (или текст через stdin)
    python3 tools/catalog.py                 потом — пересобрать js/catalog.js

Берёт последнюю строку-JSON вида {"slip__g__0-12__9001": {"g": "n", "a": [0, 6], "kinds": ["slip"]}}.
Подпись (всё после возраста) сохраняется; файл переезжает в папку нового вида.
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from catalog import IMG, parse

txt = open(sys.argv[1], encoding='utf-8').read() if len(sys.argv) > 1 else sys.stdin.read()
fix = json.loads(txt[txt.index('{'):txt.rindex('}') + 1])
files = {os.path.splitext(f)[0]: os.path.join(d, f) for d, _, fs in os.walk(IMG) if '/_' not in d for f in fs}
for old, f in fix.items():
    src = files.get(old)
    if not src:
        print('нет файла:', old); continue
    info = parse(old)
    kinds, g, a = f.get('kinds', info['kinds']), f.get('g', info['g']), f.get('a', info['a'])
    cap = old.split('__', 3)[3] if old.count('__') >= 3 else ''
    new = f"{'+'.join(kinds)}__{g}__{a[0]}-{a[1]}" + (f'__{cap}' if cap else '')
    ni = parse(new)
    if isinstance(ni, str):
        print(f'{old}: {ni}'); continue
    dst = os.path.join(IMG, ni['folder'], new + '.webp')
    if os.path.exists(dst):
        print('уже есть:', new); continue
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    os.rename(src, dst)
    print(f'{old} → {new}')
