import bsdiff4
import bz2
import zlib
import gzip
import lzma
import lz4.frame
from pathlib import Path
import os


class Proposed:
    ZLIB = 1
    BZ2 = 2
    GZIP = 3
    LZMA = 4
    LZ4 = 5

    def __init__(self, source, dst, method=BZ2, rename = ''):

        method = int(method)
        self.base = os.path.join(dst, os.path.basename(source))
        if rename == '':
            rename = self.base
        if method == self.BZ2:
            self.method = bz2
        elif method == self.ZLIB:
            self.method = zlib
        elif method == self.LZMA:
            self.method = lzma
        elif method == self.LZ4:
            self.method = lz4.frame
        elif method == self.GZIP:
            self.method = gzip

        if not Path(dst).is_dir():
            os.mkdir(dst)
        self.scan()
        if not Path(self.base).is_file():
            f = self.pack(open(source, 'rb').read())
            x = open(rename, 'wb')
            x.write(f)
            x.close()
            for i in self.patches:
                os.remove(os.path.join(dst, i))

    def pack(self, z):
        return self.method.compress(z)

    def unpack(self, z):
        return self.method.decompress(z)

    def scan(self):
        self.patches = [i for i in os.listdir(os.path.dirname(self.base)) if os.path.basename(self.base) + '.' in i]

    def update(self, data):
        print('--start--')
        f = self.unpack(open(self.base, 'rb').read())
        f2 = open(data, 'rb').read()
        patch = open('%s.%d' % (self.base, len(self.patches) + 1), 'wb')
        self.scan()
        p = bsdiff4.diff(f2, f)
        patch.write(p)
        patch.close()
        f = open(self.base, 'wb')
        f.write(self.pack(f2))
        f.close()
        print('--done--')

    def decompress(self, rev, filename=None):
        rev = int(rev)
        if rev == 0:
            f2 = self.unpack(open(self.base, 'rb').read())
            if filename is None:
                return f2
            else:
                x = open(filename, 'wb')
                x.write(f2)
                x.close()
            return
        if rev < 0 or rev > len(self.patches):
            return False
        now = len(self.patches)
        f = self.unpack(open(self.base, 'rb').read())
        while now >= rev:
            pt = self.patches[now - 1]
            f2 = open(os.path.join(os.path.dirname(self.base), pt), 'rb').read()
            p = bsdiff4.patch(f, f2)
            f = p
            now -= 1
        if filename is None:
            return f
        fx = open(filename, 'wb')
        fx.write(f)
        fx.close()
source = input('source:')
source2 = input('source1:')
source3 = input('source2:')
source4 = input('source3:')
a = Proposed(source,source2,source3,source4)
print('done input')
menu = 1
while menu != '0':
    print('running')
    menu = input()
    if menu == '1':
        print('update')
        up = input()
        a.update(up)
    elif menu == '2':
        print('--start--')
        rev = '0%s' % input()
        filename = input()
        a.decompress(rev,filename)
        print('--done--')

'''
files = ['What is Lorem Ipsum.pdf', 'What is Lorem Ipsum2.pdf', 'What is Lorem Ipsum3.pdf'];

source = os.path.join(os.path.dirname(__file__), 'first', 'What is Lorem Ipsum.pdf')
source2 = os.path.join(os.path.dirname(__file__), 'first', 'What is Lorem Ipsum2.pdf')
source3 = os.path.join(os.path.dirname(__file__), 'first', 'What is Lorem Ipsum3.pdf')
for i in ['1', '2', '3', '4', '5']:
    a = Proposed(source, os.path.join(os.path.dirname(__file__), i), int(i))
    # a.update(source2)
    # a.update(source3)
    # a.decompress(1, os.path.join(os.path.dirname(__file__), i, 'dec.pdf'))
    allin = [os.path.getsize(os.path.join(os.path.dirname(__file__), i, j)) for j in os.listdir(os.path.join(os.path.dirname(__file__), i)) if 'dec' not in j]

    print(sum(allin))
original = [os.path.getsize(j) for j in [source,source2,source3]]
print(sum(original))
'''

