#!/usr/bin/env python3
"""Каталог картинок Lookaboo.

    python3 tools/catalog.py

1. Берёт новые картинки из img/_new/ (webp, png, jpg), проверяет название,
   переводит png/jpg в webp и кладёт в папку по виду вещи.
2. Проверяет все картинки в img/ (название, пустые и битые файлы, повторы).
3. Пишет js/catalog.js — список, по которому приложение выбирает картинки.
4. Обновляет таблицу «сколько картинок есть» в IMAGES.md.

Название файла:  вид__пол__возраст__имя.webp
    вид      — один или несколько через «+»: slip, bodyL+fancy, hat+panama
    пол      — g (девочка), b (мальчик), n (нейтральное)
    возраст  — месяцы «от-до»: 0-1, 0-6, 6-12, 0-12, 12-24
    имя      — латиница, цифры, «_»; уникальное на весь каталог
Подробно — в IMAGES.md.
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, 'img')
NEW = os.path.join(IMG, '_new')
OUT_JS = os.path.join(ROOT, 'js', 'catalog.js')
DOC = os.path.join(ROOT, 'IMAGES.md')

# вид вещи → папка и подпись. Порядок задаёт порядок в таблице покрытия.
KINDS = {
    # первый слой
    'bodyL':     ('base',     'боди с длинным рукавом'),
    'bodyS':     ('base',     'боди с коротким рукавом'),
    'bodyT':     ('base',     'боди-майка'),
    'wrap':      ('base',     'распашонка'),
    'wrapbody':  ('base',     'боди-распашонка (кимоно)'),
    'slip':      ('base',     'слип'),
    'slipKnit':  ('base',     'вязаный слип'),
    'footpants': ('base',     'ползунки'),
    'tank':      ('base',     'майка'),
    # второй слой
    'cardigan':  ('mid',      'кофта на пуговицах'),
    'sweater':   ('mid',      'свитер'),
    'pants':     ('mid',      'штанишки'),
    'shorts':    ('mid',      'шорты'),
    'dungarees': ('mid',      'полукомбинезон'),
    'romper':    ('mid',      'песочник'),
    'dress':     ('mid',      'платье / боди-платье'),
    'ovFleece':  ('mid',      'флисовый комбинезон'),
    # верхний слой
    'ovDemi':    ('outer',    'демисезонный комбинезон'),
    'ovWinter':  ('outer',    'зимний комбинезон'),
    'jacket':    ('outer',    'куртка'),
    'vest':      ('outer',    'жилет'),
    # аксессуары
    'hat':       ('acc',      'тонкая шапочка / чепчик'),
    'hatWarm':   ('acc',      'тёплая шапка'),
    'panama':    ('acc',      'панамка'),
    'socks':     ('acc',      'носки / пинетки'),
    'mittens':   ('acc',      'варежки'),
    # в коляску
    'muslin':    ('stroller', 'муслин'),
    'blanket':   ('stroller', 'плед'),
    # игрушки
    'toy':       ('toys',     'игрушка / грызунок'),
    # особые: определяют папку, если стоят в названии
    'fancy':     ('fancy',    'нарядное (праздники, фотосессии)'),
    'costume':   ('costume',  'карнавальный костюм'),
}
SPECIAL = ('costume', 'fancy')           # перебивают папку основного вида
GENDERS = {'g': 'девочка', 'b': 'мальчик', 'n': 'нейтральное'}
AGES = [(0, 1, '0–1 мес'), (1, 6, '1–6 мес'), (6, 12, '6–12 мес')]
NAME_RE = re.compile(r'^([A-Za-z+]+)__([gbn])__(\d{1,2})-(\d{1,2})__([a-z0-9_]+)$')


def parse(stem):
    """'slip__n__0-12__slip_cream' → dict или текст ошибки."""
    m = NAME_RE.match(stem)
    if not m:
        return 'название не по схеме вид__пол__возраст__имя'
    kinds, g, a0, a1, name = m.group(1).split('+'), m.group(2), int(m.group(3)), int(m.group(4)), m.group(5)
    bad = [k for k in kinds if k not in KINDS]
    if bad:
        return 'неизвестный вид: ' + ', '.join(bad)
    if not a0 < a1 <= 48:
        return 'возраст «от-до» в месяцах, от меньшего к большему (до 48)'
    folder = next((k for k in SPECIAL if k in kinds), None) or KINDS[kinds[0]][0]
    return {'id': name, 'kinds': kinds, 'g': g, 'a': [a0, a1], 'folder': folder}


def image_ok(path):
    if os.path.getsize(path) == 0:
        return 'пустой файл'
    try:
        from PIL import Image
    except ImportError:
        return None                       # без Pillow проверяем только размер
    try:
        with Image.open(path) as im:
            im.verify()
    except Exception:
        return 'файл не открывается как картинка'
    return None


def take_new(problems):
    """img/_new → проверить, при нужде перевести в webp, положить в свою папку."""
    if not os.path.isdir(NEW):
        return 0
    moved = 0
    for fn in sorted(os.listdir(NEW)):
        stem, ext = os.path.splitext(fn)
        ext = ext.lower()
        if fn.startswith('.') or ext not in ('.webp', '.png', '.jpg', '.jpeg'):
            continue
        src = os.path.join(NEW, fn)
        info = parse(stem)
        if isinstance(info, str):
            problems.append(f'_new/{fn}: {info} — оставлен в _new')
            continue
        err = image_ok(src)
        if err:
            problems.append(f'_new/{fn}: {err} — оставлен в _new')
            continue
        dst_dir = os.path.join(IMG, info['folder'])
        os.makedirs(dst_dir, exist_ok=True)
        dst = os.path.join(dst_dir, stem + '.webp')
        if os.path.exists(dst):
            problems.append(f'_new/{fn}: такой файл уже есть в {info["folder"]}/ — оставлен в _new')
            continue
        if ext == '.webp':
            os.replace(src, dst)
        else:
            from PIL import Image
            with Image.open(src) as im:
                im = im.convert('RGBA')
                if max(im.size) > 800:          # как остальные картинки: до ~520px, с запасом
                    im.thumbnail((800, 800))
                im.save(dst, 'WEBP', quality=86, method=6)
            os.remove(src)
        moved += 1
    return moved


def scan(problems):
    items, seen = [], {}
    for folder in sorted(os.listdir(IMG)):
        d = os.path.join(IMG, folder)
        if not os.path.isdir(d) or folder.startswith('_') or folder.startswith('.'):
            continue
        for fn in sorted(os.listdir(d)):
            stem, ext = os.path.splitext(fn)
            if fn.startswith('.') or ext.lower() != '.webp':
                continue
            rel = f'{folder}/{fn}'
            info = parse(stem)
            if isinstance(info, str):
                problems.append(f'{rel}: {info} — пропущен')
                continue
            if info['folder'] != folder:
                problems.append(f'{rel}: по виду должен лежать в {info["folder"]}/ (работает и так)')
            err = image_ok(os.path.join(d, fn))
            if err:
                problems.append(f'{rel}: {err} — пропущен')
                continue
            if info['id'] in seen:
                problems.append(f'{rel}: имя «{info["id"]}» уже занято ({seen[info["id"]]}) — пропущен')
                continue
            seen[info['id']] = rel
            items.append({'id': info['id'], 'file': 'img/' + rel, 'kinds': info['kinds'],
                          'g': info['g'], 'a': info['a']})
    return items


def write_js(items):
    rows = ',\n'.join('  ' + json.dumps(it, ensure_ascii=False, separators=(',', ':')) for it in items)
    with open(OUT_JS, 'w', encoding='utf-8') as f:
        f.write('/* каталог картинок — СОБИРАЕТСЯ АВТОМАТИЧЕСКИ: python3 tools/catalog.py\n'
                '   руками не править; как добавлять картинки — IMAGES.md */\n'
                'const CATALOG=[\n' + rows + '\n];\n')


def coverage(items):
    """Сколько картинок увидит малыш данного пола и возраста (нейтральные — всем)."""
    head = '| Вид | ' + ' | '.join(f'{lab}: дев / мал / ?' for _, _, lab in AGES) + ' |'
    lines = [head, '|' + '---|' * (len(AGES) + 1)]
    for k, (_, title) in KINDS.items():
        cells = []
        for a0, a1, _ in AGES:
            fit = [it for it in items if k in it['kinds'] and it['a'][0] < a1 and it['a'][1] > a0]
            girl = sum(it['g'] in 'gn' for it in fit)
            boy = sum(it['g'] in 'bn' for it in fit)
            neu = sum(it['g'] == 'n' for it in fit)
            mark = lambda v: f'**{v}**' if v < 2 else str(v)
            cells.append(f'{mark(girl)} / {mark(boy)} / {mark(neu)}')
        lines.append(f'| {title} (`{k}`) | ' + ' | '.join(cells) + ' |')
    return '\n'.join(lines)


def write_doc(items):
    if not os.path.exists(DOC):
        return
    with open(DOC, encoding='utf-8') as f:
        doc = f.read()
    a, b = '<!-- ПОКРЫТИЕ:НАЧАЛО -->', '<!-- ПОКРЫТИЕ:КОНЕЦ -->'
    if a not in doc or b not in doc:
        return
    body = (f'\nВсего картинок: {len(items)}. Жирным — меньше двух: для этого пола и возраста '
            f'вещь будет повторяться.\n\n' + coverage(items) + '\n')
    doc = doc[:doc.index(a) + len(a)] + body + doc[doc.index(b):]
    with open(DOC, 'w', encoding='utf-8') as f:
        f.write(doc)


def main():
    problems = []
    moved = take_new(problems)
    items = scan(problems)
    write_js(items)
    write_doc(items)
    print(f'Каталог: {len(items)} картинок' + (f', из _new разложено {moved}' if moved else ''))
    for p in problems:
        print('  ! ' + p)
    if '--report' in sys.argv:
        print(coverage(items))


if __name__ == '__main__':
    main()
