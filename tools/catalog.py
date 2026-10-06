#!/usr/bin/env python3
"""Каталог картинок Lookaboo.

    python3 tools/catalog.py

1. Берёт новые картинки из img/_new/ (webp, png, jpg), проверяет название,
   переводит png/jpg в webp и кладёт в папку по виду вещи.
2. Проверяет все картинки в img/ (название, пустые и битые файлы, повторы).
3. Определяет основной цвет каждой вещи (по ним приложение подбирает сочетания)
   и где на картинке сама вещь без прозрачных полей (по этому строится раскладка).
4. Пишет js/catalog.js — список, по которому приложение выбирает картинки.

Название файла:  вид__пол__возраст__подпись.webp
    вид      — один или несколько через «+»: slip, bodyL+fancy, hat+panama
    пол      — g (девочка), b (мальчик), n (нейтральное)
    возраст  — месяцы «от-до»: 0-1, 0-6, 6-12, 0-12, 12-24
    подпись  — по желанию, любая латиница/цифры: cream_dots, 07
Подробно — в IMAGES.md.  --report — показать, сколько картинок на пол и возраст.
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, 'img')
NEW = os.path.join(IMG, '_new')
OUT_JS = os.path.join(ROOT, 'js', 'catalog.js')

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
    'suit':      ('mid',      'спортивный костюм (кофта + штаны)'),
    'pants':     ('mid',      'штанишки'),
    'shorts':    ('mid',      'шорты'),
    'dungarees': ('mid',      'полукомбинезон'),
    'romper':    ('mid',      'песочник'),
    'dress':     ('mid',      'платье / боди-платье'),
    'ovFleece':  ('mid',      'флисовый комбинезон'),
    # верхний слой
    'ovDemi':    ('outer',    'демисезонный комбинезон'),
    'ovWinter':  ('outer',    'зимний комбинезон'),
    'envelope':  ('outer',    'конверт (для новорождённых)'),
    'jacket':    ('outer',    'куртка'),
    'vest':      ('outer',    'жилет'),
    # аксессуары
    'hat':       ('acc',      'тонкая шапочка / чепчик'),
    'hatWarm':   ('acc',      'тёплая шапка'),
    'panama':    ('acc',      'панамка'),
    'socks':     ('acc',      'носки / пинетки'),
    'mittens':   ('acc',      'варежки'),
    'headband':  ('acc',      'повязка, бантик'),
    'spf':       ('acc',      'крем от солнца (с 6 мес)'),
    'umbrella':  ('acc',      'зонт'),
    # в коляску
    'muslin':    ('stroller', 'муслин'),
    'blanket':   ('stroller', 'плед'),
    'raincover': ('stroller', 'дождевик на коляску'),
    'sleepbag':  ('sleep',    'спальник (TOG — в подписи не нужно)'),
    # игрушки
    'toy':       ('toys',     'игрушка / грызунок'),
    # фотосессии по месяцам и праздничные костюмы — только для «Плана», в образы по погоде не попадают
    'photo':     ('photo',    'фотосессия по месяцам'),
    'halloween': ('costume',  'костюм на Хэллоуин'),
    'newyear':   ('costume',  'костюм на Новый год'),
    # особые: определяют папку, если стоят в названии
    'fancy':     ('fancy',    'нарядное (праздники, фотосессии)'),
    'costume':   ('costume',  'карнавальный костюм'),
}
SPECIAL = ('costume', 'fancy')           # перебивают папку основного вида
GENDERS = {'g': 'девочка', 'b': 'мальчик', 'n': 'нейтральное'}
AGES = [(0, 1, '0–1 мес'), (1, 6, '1–6 мес'), (6, 12, '6–12 мес')]
NAME_RE = re.compile(r'^([A-Za-z+]+)__([gbn])__(\d{1,2})-(\d{1,2})(?:__([A-Za-z0-9_-]+))?$')


def parse(stem):
    """'slip__n__0-12__cream' → dict или текст ошибки. id картинки — всё название целиком."""
    m = NAME_RE.match(stem)
    if not m:
        return 'название не по схеме вид__пол__возраст__подпись'
    kinds, g, a0, a1 = m.group(1).split('+'), m.group(2), int(m.group(3)), int(m.group(4))
    bad = [k for k in kinds if k not in KINDS]
    if bad:
        return 'неизвестный вид: ' + ', '.join(bad)
    if not a0 < a1 <= 48:
        return 'возраст «от-до» в месяцах, от меньшего к большему (до 48)'
    folder = next((k for k in SPECIAL if k in kinds), None) or KINDS[kinds[0]][0]
    return {'id': stem, 'kinds': kinds, 'g': g, 'a': [a0, a1], 'folder': folder}


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


def main_colors(path):
    """Основной цвет вещи и, если заметен, второй (принт, отделка) — по непрозрачным пикселям."""
    try:
        from PIL import Image
    except ImportError:
        return None
    with Image.open(path) as im:
        im = im.convert('RGBA')
        im.thumbnail((96, 96))
        data = im.get_flattened_data() if hasattr(im, "get_flattened_data") else im.getdata()
        px = [p[:3] for p in data if p[3] > 200]
    if len(px) < 20:
        return None
    flat = Image.new('RGB', (len(px), 1)); flat.putdata(px)
    q = flat.quantize(colors=5, method=Image.Quantize.MEDIANCUT)
    pal, counts = q.getpalette(), sorted(q.getcolors(), reverse=True)
    rgb = lambda i: tuple(pal[i * 3:i * 3 + 3])
    hexc = lambda c: '#%02x%02x%02x' % c
    c1 = rgb(counts[0][1]); out = [hexc(c1)]
    for n, i in counts[1:]:
        c = rgb(i)
        if n / len(px) >= 0.15 and sum((a - b) ** 2 for a, b in zip(c, c1)) ** .5 > 70:
            out.append(hexc(c)); break
    return out


def content_box(path):
    """Где на картинке сама вещь (без прозрачных полей): доли кадра [x0,y0,x1,y1] и пропорция кадра."""
    try:
        from PIL import Image
    except ImportError:
        return None
    with Image.open(path) as im:
        if im.mode != 'RGBA':
            return None
        W, H = im.size
        bb = im.getchannel('A').point(lambda a: 255 if a > 40 else 0).getbbox()
    if not bb:
        return None
    return [round(bb[0] / W, 3), round(bb[1] / H, 3), round(bb[2] / W, 3), round(bb[3] / H, 3)], round(W / H, 3)


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
            it = {'id': info['id'], 'file': 'img/' + rel, 'kinds': info['kinds'], 'g': info['g'], 'a': info['a']}
            box = content_box(os.path.join(d, fn))
            if box:
                it['b'], it['r'] = box
            col = main_colors(os.path.join(d, fn))
            if col:
                it['c'] = col
            items.append(it)
    return items


def write_js(items):
    rows = ',\n'.join('  ' + json.dumps(it, ensure_ascii=False, separators=(',', ':')) for it in items)
    with open(OUT_JS, 'w', encoding='utf-8') as f:
        f.write('/* каталог картинок — СОБИРАЕТСЯ АВТОМАТИЧЕСКИ: python3 tools/catalog.py\n'
                '   руками не править; как добавлять картинки — IMAGES.md */\n'
                'const CATALOG=[\n' + rows + '\n];\n'
                '/* подписи для страницы проверки каталога (catalog.html) */\n'
                'const KIND_RU=' + json.dumps({k: [f, t] for k, (f, t) in KINDS.items()}, ensure_ascii=False) + ';\n'
                'const GENDER_RU=' + json.dumps(GENDERS, ensure_ascii=False) + ';\n')


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


def main():
    problems = []
    moved = take_new(problems)
    items = scan(problems)
    write_js(items)
    print(f'Каталог: {len(items)} картинок' + (f', из _new разложено {moved}' if moved else ''))
    for p in problems:
        print('  ! ' + p)
    if '--report' in sys.argv:
        print(coverage(items))


if __name__ == '__main__':
    main()
