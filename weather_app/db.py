import sqlite3
import os

class DBHelper:
    def __init__(self, dbfile='weather.db'):
        self.dbfile = dbfile
        new = not os.path.exists(dbfile)
        self.conn = sqlite3.connect(dbfile, check_same_thread=False)
        if new:
            self._create()

    def _create(self):
        c = self.conn.cursor()
        c.execute('''CREATE TABLE favorites (name TEXT, lat TEXT, lon TEXT)''')
        self.conn.commit()

    def add_favorite(self, name, lat, lon):
        c = self.conn.cursor()
        c.execute('INSERT INTO favorites VALUES (?,?,?)', (name, lat, lon))
        self.conn.commit()

    def remove_favorite(self, lat, lon):
        c = self.conn.cursor()
        c.execute('DELETE FROM favorites WHERE lat=? AND lon=?', (lat, lon))
        self.conn.commit()

    def get_favorites(self):
        c = self.conn.cursor()
        c.execute('SELECT name, lat, lon FROM favorites')
        return [{'name':r[0],'lat':r[1],'lon':r[2]} for r in c.fetchall()]
