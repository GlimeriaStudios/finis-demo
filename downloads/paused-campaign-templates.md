# Swedish paused campaign templates

Sweden / Swedish / SEK / Europe/Stockholm. No account or import exists. All positive entities stay Paused. Final URLs are blank and must be replaced with verified production destinations before import. The SEK 15,000 test is a separate NOT_APPROVED scenario, not a GBP conversion. Approved spend is SEK 0. Final SEK service prices remain TBD.

Use Ads Editor field mapping and verify current accepted column names. Campaign language sv, Sweden presence targeting, Search-only, billing currency SEK and timezone Europe/Stockholm must be checked in the actual account. No budget is permission to spend. The average daily budget can vary in daily delivery; reconcile the approved dates and ceiling.

Do not enable any entity until the 14 release gates in launch-config.json are verified. Review Swedish ad copy against real operational readiness and replace prelaunch wording with approved final terms. The original £200/month and £600 year-end are reference economics only. No lowest-price or affiliation claim is made.

## campaigns-paused.csv

```csv
Campaign,Campaign status,Campaign type,Budget,Budget type,Languages
SE | Bokföring | Search,Paused,Search,345.39,Daily,sv
SE | Bokslut | Search,Paused,Search,148.03,Daily,sv
```

## keywords-paused.csv

```csv
Campaign,Ad group,Ad group status,Keyword,Criterion Type,Status
SE | Bokföring | Search,Löpande bokföring,Paused,bokföring online,Exact,Paused
SE | Bokföring | Search,Löpande bokföring,Paused,löpande bokföring,Exact,Paused
SE | Bokföring | Search,Löpande bokföring,Paused,bokföring aktiebolag,Phrase,Paused
SE | Bokföring | Search,Löpande bokföring,Paused,bokföring fast pris,Phrase,Paused
SE | Bokföring | Search,Byta byrå,Paused,byta redovisningsbyrå,Exact,Paused
SE | Bokföring | Search,Byta byrå,Paused,digital redovisningsbyrå,Phrase,Paused
SE | Bokslut | Search,Bokslut,Paused,hjälp med bokslut,Exact,Paused
SE | Bokslut | Search,Bokslut,Paused,bokslut aktiebolag,Phrase,Paused
SE | Bokslut | Search,Bokslut,Paused,bokslut fast pris,Phrase,Paused
```

## ads-paused.csv

```csv
Campaign,Ad group,Ad type,Status,Headline 1,Headline 2,Headline 3,Description 1,Description 2,Final URL
SE | Bokföring | Search,Löpande bokföring,Responsive search ad,Paused,Bokföring med tydlig överblick,Se vårt upplägg,För svenska företag,Se hur tjänsten fungerar och vad som ingår innan du väljer.,Utforska bokföring och villkor. Svenskt pris fastställs inför lansering.,
SE | Bokföring | Search,Byta byrå,Responsive search ad,Paused,Dags att byta bokföring?,Se hur bytet går till,Tydligt från första steget,Läs om onboarding och vilka underlag som behövs för att komma igång.,Jämför upplägget med ditt företags behov och se tjänstens omfattning.,
SE | Bokslut | Search,Bokslut,Responsive search ad,Paused,Hjälp med bokslut,Se vad som ingår,Förbered årets bokslut,Se vilka underlag som behövs och om tjänsten passar ditt företag.,Läs om omfattning och villkor innan du skickar en förfrågan.,
```

## negative-keywords.csv

```csv
Campaign,Keyword,Criterion Type
SE | Bokföring | Search,jobb,Negative phrase
SE | Bokföring | Search,lön redovisningskonsult,Negative phrase
SE | Bokföring | Search,kurs,Negative phrase
SE | Bokföring | Search,utbildning,Negative phrase
SE | Bokföring | Search,mall,Negative phrase
SE | Bokföring | Search,definition,Negative phrase
SE | Bokslut | Search,jobb,Negative phrase
SE | Bokslut | Search,lön redovisningskonsult,Negative phrase
SE | Bokslut | Search,kurs,Negative phrase
SE | Bokslut | Search,utbildning,Negative phrase
SE | Bokslut | Search,mall,Negative phrase
SE | Bokslut | Search,definition,Negative phrase
```

Do not blanket-exclude gratis while a free trial is intended. Do not target Wint-branded searches initially. Bid on annual-account or tax-filing intent only when the actual service scope supports it. Sources: [Google budgets](https://support.google.com/google-ads/answer/6385083?hl=en), [Forecasts](https://support.google.com/google-ads/answer/3022575?hl=en).
