# Talo · Lab Pistage-tema för finis-demo

Ett rent ytlager. Det ändrar färger, typsnitt, hörnradier, konturer, fokusmarkering och logotyp, men ingen layout.

## Installera
1. Lägg mappen `talo-lab/` i `finis-demo/`.
2. Lägg till följande rad **sist** i `<head>` på varje sida, efter de befintliga stilmallarna. I appen gäller det `app/index.html`.

   <link rel="stylesheet" href="/finis-demo/talo-lab/talo-lab.css">

## Vad som ändras
- Färger: alla färger i styles.css, receipt-batch.css, mobile-navigation.css och demo-films.css är omkartlagda till Lab-paletten (Carbon #111111, Signal #FF4F12, Bone #F2F1EC, Graphite #D9D7CE).
- Typsnitt: Inter ersätter Manrope och systemtypsnittet. JetBrains Mono används för etiketter. Båda ligger lokalt i `fonts/`, så inga anrop går till Google.
- Logotyp: `img.finis-wordmark` visar `talo-wordmark.svg` i samma ruta.
- Konturer: 1,5 px Carbon ritas som box-shadow och påverkar därför inte storlekar.

## Vad som inte ändras
display, grid, flex, width, height, margin, padding, gap, position, font-size och line-height skrivs aldrig över.
Den enda skillnaden i flödet kommer från att Inter har något andra teckenbredder än det gamla typsnittet. På startsidan i 1440 px blir sidan 10 px kortare. Appens översikt är exakt lika hög.

## Kvar att göra (utanför temat)
- Byt texten "Finis" i HTML/JS och videorna mot "Talo".
- Byt favicon `brand.svg` mot `talo-lab/talo-symbol.svg`.
- Assistenten: lägg in `<span class="talobot">` i rubriken "Lite hjälp på vägen." (se canvasen).

`talo-lab.css` genereras från era befintliga stilmallar. Om de ändras behöver temat genereras om.
