"""Screenshot the picker YOUR TEAM card for several dog/rider picks; check the 3 columns don't overlap.
usage: card_shots.py URL OUTDIR [phone|desktop]"""
import sys, json
from playwright.sync_api import sync_playwright
URL, OUT = sys.argv[1], sys.argv[2]; mode = sys.argv[3] if len(sys.argv) > 3 else 'phone'
PICKS = [('ghostbuster','erv'),('meatball','nonna'),('noodle','shockbot'),('beaux','mystery-drone-pilot'),
         ('penny','monkey-jockey'),('diva','ipo'),('kira','fonk'),('mike','dinny')]
errs = []; report = []
with sync_playwright() as p:
    b = p.chromium.launch()
    vp = dict(viewport={'width':390,'height':844}, device_scale_factor=2, is_mobile=True, has_touch=True) if mode=='phone' \
         else dict(viewport={'width':1440,'height':900})
    pg = b.new_page(**vp)
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
    pg.goto(URL); pg.wait_for_timeout(2500)
    pg.click('#enterBtn'); pg.wait_for_timeout(1200)
    for i,(d,r) in enumerate(PICKS):
        pg.click(f'#dogGrid [data-id="{d}"]'); pg.click(f'#riderGrid [data-id="{r}"]'); pg.wait_for_timeout(500)
        info = pg.evaluate("""()=>{const q=s=>document.querySelector('#showcase '+s).getBoundingClientRect();
          const c=q(''),dg=q('.sc-dog'),st=q('.sc-stats'),rw=q('.sc-rw'),ri=document.querySelector('#showcase .sc-rider');
          const img=ri.getBoundingClientRect(); const s=Math.min(img.width/ri.naturalWidth,img.height/ri.naturalHeight);
          const drawnW=ri.naturalWidth*s, drawnL=img.left+(img.width-drawnW)/2;
          const lbl=[...document.querySelectorAll('#showcase .rb-l')].map(e=>e.scrollWidth>e.clientWidth?e.textContent:null).filter(Boolean);
          const h5=[...document.querySelectorAll('#showcase h5')].map(e=>e.scrollWidth>e.clientWidth?e.textContent:null).filter(Boolean);
          return {card:[c.left,c.right,c.height].map(Math.round), dog:[dg.left,dg.right].map(Math.round), stats:[st.left,st.right].map(Math.round),
            riderDrawn:[drawnL,drawnL+drawnW,ri.naturalWidth?1:0].map(Math.round), riderH:Math.round(img.height),
            overlap: dg.right>st.left || st.right>drawnL || drawnL+drawnW>c.right, clippedLabels:lbl, clippedNames:h5,
            pageOverflowX: document.documentElement.scrollWidth>innerWidth}}""")
        info['pick'] = f'{d}+{r}'; report.append(info)
        pg.locator('#showcase').screenshot(path=f'{OUT}/{mode}-card-{i}-{d}-{r}.png')
    b.close()
print(json.dumps({'report':report,'jsErrors':errs}, indent=0))
