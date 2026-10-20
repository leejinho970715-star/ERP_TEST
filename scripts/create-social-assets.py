"""Compose social/launcher derivatives from the generated dashboard; requires Pillow."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
root = Path(__file__).resolve().parents[1]
asset = root / 'assets'
hero = Image.open(asset / 'erp-dashboard.png').convert('RGBA')
print('Dashboard:', hero.size, hero.mode, 'alpha range:', hero.getextrema()[3])
font_path = str(root / '.tmp/Pretendard-Regular.ttf')
bold_path = str(root / '.tmp/Pretendard-Bold.ttf')
def font(size, bold=False):
    return ImageFont.truetype(bold_path if bold else font_path, size)
im = Image.new('RGBA', (1200, 630))
pixels = im.load()
for y in range(630):
    for x in range(1200):
        t = (x / 1200 + y / 630) / 2
        pixels[x,y] = (int(247-24*t), int(252-15*t), 255, 255)
draw = ImageDraw.Draw(im)
for x in range(640,1200,50): draw.line((x,0,x,630), fill=(215,230,247,255))
for y in range(0,630,50): draw.line((640,y,1200,y), fill=(215,230,247,255))
draw.rounded_rectangle((62,99,355,136),radius=18,fill='#ffffff',outline='#d7e6f9')
draw.text((82,108),'FIND YOUR NEXT ERP',font=font(15,True),fill='#5780b8')
draw.text((62,185),'우리 회사에 딱 맞는',font=font(43,True),fill='#183453')
draw.text((62,247),'ERP, 함께 찾아볼까요?',font=font(43,True),fill='#477fe9')
draw.text((65,332),'5가지 질문으로 만나는 맞춤 솔루션',font=font(21),fill='#7188a8')
draw.text((65,380),'ERP 가상 컨설팅 진단',font=font(25,True),fill='#244a78')
logo = Image.open(asset / 'iwon-logo.png').convert('RGBA')
logo.thumbnail((260,95),Image.Resampling.LANCZOS)
im.alpha_composite(logo,(62,492))
hero.thumbnail((575,475),Image.Resampling.LANCZOS)
im.alpha_composite(hero,(615,100))
im.convert('RGB').save(asset / 'erp-og.png',optimize=True)
touch=Image.new('RGBA',(180,180),'#edf6ff')
tile=ImageDraw.Draw(touch)
tile.rounded_rectangle((20,20,160,160),radius=36,fill='#477fee')
tile.rounded_rectangle((49,49,131,127),radius=16,fill='white')
for x,top in [(66,91),(90,68),(114,80)]: tile.line((x,top,x,108),fill='#5d8aef',width=10)
touch.save(asset/'erp-touch.png')
print('Created erp-og.png (1200x630) and erp-touch.png (180x180)')
