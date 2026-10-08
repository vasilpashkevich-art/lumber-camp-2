#!/usr/bin/env python3
"""Собирает index.html для GitHub Pages из src/lumber-camp.html.

src/lumber-camp.html — фрагмент страницы в том виде, в каком он публикуется
как артефакт в Claude (без <html>/<head>). Claude сам добавляет обёртку с
viewport; для GitHub Pages её добавляем здесь, иначе телефон рисует страницу
как десктопную и всё становится мелким.
"""
import pathlib, re
root = pathlib.Path(__file__).resolve().parent.parent
body = (root / 'src' / 'lumber-camp.html').read_text(encoding='utf-8')
title = re.search(r'<title>(.*?)</title>', body).group(1)
head = f'''<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#0d120f">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="{title}">
<style>html,body{{margin:0;padding:0}}body{{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;-webkit-text-size-adjust:100%;text-size-adjust:100%}}:root{{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}}img{{max-width:100%}}[hidden]{{display:none!important}}</style>
</head>
<body>
'''
(root / 'index.html').write_text(head + body + '\n</body>\n</html>\n', encoding='utf-8')
print('index.html собран:', len(head) + len(body), 'байт')
