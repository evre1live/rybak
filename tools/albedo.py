#!/usr/bin/env python3
# Средний цвет камня у моделей — по тому, как текстура легла на модель (по площади треугольников), в линейном цвете.
# Нужен, чтобы все скалы и камни локации привести к одному тону (client/stone.js).
#   python3 tools/albedo.py env-cliff1 env-cliff2 …   → печатает строки таблицы ALBEDO
import json, struct, io, sys
import numpy as np
from PIL import Image

ROOT = __file__.rsplit('/tools/', 1)[0]
spec = {m['id']: m for m in json.load(open(ROOT + '/art/models.json'))['models']}
CT = {5120: np.int8, 5121: np.uint8, 5122: np.int16, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}
NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}

def glb(path):
    b = open(path, 'rb').read()
    L = struct.unpack('<I', b[12:16])[0]
    j = json.loads(b[20:20 + L])
    off = 20 + L
    BL = struct.unpack('<I', b[off:off + 4])[0]
    return j, b[off + 8:off + 8 + BL]

def acc(j, binb, i):
    a = j['accessors'][i]
    bv = j['bufferViews'][a['bufferView']]
    n = NC[a['type']]
    dt = np.dtype(CT[a['componentType']])
    start = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    stride = bv.get('byteStride', 0) or dt.itemsize * n
    raw = np.frombuffer(binb, dtype=np.uint8, count=stride * (a['count'] - 1) + dt.itemsize * n, offset=start)
    out = np.lib.stride_tricks.as_strided(raw, shape=(a['count'], dt.itemsize * n), strides=(stride, 1)).copy().view(dt).reshape(a['count'], n)
    return out.astype(np.float64)

def lin(c):
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)

def albedo(mid):
    j, binb = glb(f'{ROOT}/art/tripo/raw/{mid}.glb')
    prim = j['meshes'][0]['primitives'][0]
    P = acc(j, binb, prim['attributes']['POSITION'])
    UV = acc(j, binb, prim['attributes']['TEXCOORD_0'])
    I = acc(j, binb, prim['indices']).astype(np.int64).reshape(-1, 3)
    mat = j['materials'][prim.get('material', 0)]
    ti = mat['pbrMetallicRoughness']['baseColorTexture']['index']
    bv = j['bufferViews'][j['images'][j['textures'][ti]['source']]['bufferView']]
    im = Image.open(io.BytesIO(binb[bv.get('byteOffset', 0):bv.get('byteOffset', 0) + bv['byteLength']])).convert('RGB')
    im = im.resize((1024, 1024))
    T = np.asarray(im).astype(np.float64) / 255
    g = spec.get(mid, {}).get('gamma')
    if g: T = T ** g
    T = lin(T)
    a, b, c = P[I[:, 0]], P[I[:, 1]], P[I[:, 2]]
    area = np.linalg.norm(np.cross(b - a, c - a), axis=1) / 2
    # несколько точек на треугольник: центр и середины к вершинам
    tot = np.zeros(3)
    for w in ([1/3, 1/3, 1/3], [2/3, 1/6, 1/6], [1/6, 2/3, 1/6], [1/6, 1/6, 2/3]):
        uv = UV[I[:, 0]] * w[0] + UV[I[:, 1]] * w[1] + UV[I[:, 2]] * w[2]
        x = np.clip((uv[:, 0] % 1) * 1023, 0, 1023).astype(int)
        y = np.clip((uv[:, 1] % 1) * 1023, 0, 1023).astype(int)
        tot += (T[y, x] * area[:, None]).sum(0)
    m = tot / (area.sum() * 4)
    return m

for mid in sys.argv[1:]:
    m = albedo(mid)
    print(f"  '{mid}': [{m[0]:.4f}, {m[1]:.4f}, {m[2]:.4f}],")
