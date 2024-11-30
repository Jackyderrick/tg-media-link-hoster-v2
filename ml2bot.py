import asyncio
import datetime,re,random,time,hashlib,uuid
from sys import stderr, stdout

from pyrogram import Client
from pyrogram.enums import MessageMediaType,ChatType,ParseMode
from pyrogram.errors import FileReferenceExpired,FloodWait,AuthBytesInvalid
from pyrogram.client import Cache
from pyrogram import filters
import mysql.connector
import uvloop

asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())
uvloop.install()

api_id = 00000000
api_hash = "00000000000000000000000000000"

app = Client("mlk2auto", api_id=api_id, api_hash=api_hash, max_concurrent_transmissions = 1, sleep_threshold = 60)

app.message_cache = Cache(1000000)
dl_types = [MessageMediaType.PHOTO, MessageMediaType.VIDEO, MessageMediaType.AUDIO, MessageMediaType.DOCUMENT]
groups = [-1001234567890, -100234567890, {}]
use_record = {}
database = {"host": "127.0.0.1", "user" : "mlkauto", "password": "0000000000", "dbname": "mlbot"}

processed_media_groups = {}
expiration_time = 1800
decode_users = {}

def read_rec():
    conn = mysql.connector.connect(user=database["user"], password=database["password"], host=database["host"], database=database["dbname"])
    cursor = conn.cursor(dictionary=True)
    sql = 'SELECT * FROM records WHERE destb is NULL'
    cursor.execute(sql)
    result = cursor.fetchall()
    cursor.close()
    conn.close()
    if len(result) > 0:
        return result
    else:
        return False

def update_rec(mlk, res_id):
    conn = mysql.connector.connect(user=database["user"], password=database["password"], host=database["host"], database=database["dbname"])
    cursor = conn.cursor(dictionary=True)
    sql = 'UPDATE records SET destb = %s WHERE mlk = %s'
    cursor.execute(sql, (res_id, mlk))
    conn.commit()
    cursor.close()
    conn.close()
    return True

def copy_main():
    pass

async def copy_prep():
    async with app:
        data = read_rec()
        if data:
            for w in data:
                if w['mgroup_id']:
                    res = await app.copy_media_group(chat_id = groups[1], from_chat_id = groups[0], message_id = w['desta'])
                    res = res[0]
                else:
                    res = await app.copy_message(chat_id = groups[1], from_chat_id = groups[0], message_id = w['desta'])
                if res and res.id:
                    update_rec(w['mlk'], res.id)
                time.sleep(1)

@app.on_message(filters.command("start") & filters.private)
async def cmd_main(client, message):
    from_user = message.from_user.id
    welcome_text = '''
我是一个资源存储机器人，能够帮你把媒体资源转换为代码链接，便于分享和转发
直接向我发送媒体开始使用，或者发送 /help 查看帮助
'''
    await app.send_message(from_user, welcome_text)

@app.on_message(filters.command("listall") & filters.private)
async def cmd_main(client, message):
    pass

@app.on_message(filters.text & filters.private)
async def ret_main(client, message):
    pass    

app.run(copy_prep())