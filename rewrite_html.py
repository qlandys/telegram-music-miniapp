# -*- coding: utf-8 -*-
from pathlib import Path

def rewrite():
    path = Path("webapp/index.html")
    text = path.read_text(encoding="utf-8")
    replacements = {
        "<title>�?�?���<����>�?�?�?�� �?��?��-���?��>�?���?���</title>": "<title>ShahMusic · мини-плеер</title>",
        "<h1 class=\"app__title\">�?�?���<��� ��� YouTube</h1>": "<h1 class=\"app__title\">Музыка из YouTube</h1>",
        "<p class=\"app__subtitle\">�?�����?�� �'�?��� �� �?�?�?��?�'���>�?�?�? �?�'���?���?�? ��?�? �+�?�'�?.</p>": "<p class=\"app__subtitle\">Слушай любимые треки напрямую из YouTube Music — прямо в Telegram.</p>",
        "<h2 class=\"placeholder__title\">�\"�>���?�?���? �����?��>�?</h2>": "<h2 class=\"placeholder__title\">Что здесь есть</h2>",
        "<p class=\"placeholder__text\">\n              �-�?��?�? �+�?�?�?�' ���?�?�+�?�?��� �� ���?�?�?��������, �ؑ'�?�+�< �+�<�?�'�?�? �������?�?����'�? �?�?���<��? �� �?�?���?�?���%���'�?�?�? �� �?��?���?�?��? �?���:�?�?����?.\n            </p>": "<p class=\"placeholder__text\">Ищи музыку по названию, артисту или вставляй ссылки из YouTube — поток начнётся без ожидания загрузки.</p>",
        "<h2 class=\"placeholder__title\">�?�?�'�?�?��?</h2>": "<h2 class=\"placeholder__title\">История</h2>",
        "<p class=\"placeholder__text\">\n              �'�?�� �'�?����, ��?�'�?�?�<�� �'�< �������?�?����>, �+�?�?�?�' ���?�? �?�?��?��. �?�?��? �'���� �?" �� �?�?���<��� �?�?�?�?�� ��?�?����'.\n            </p>": "<p class=\"placeholder__text\">Здесь появится список последних треков. Как только начнёшь слушать — мы всё сохраним.</p>",
        "<label class=\"search__label\" for=\"query\">��'�? �?��>�?�ؐ���??</label>": "<label class=\"search__label\" for=\"query\">Что ищем?</label>",
        "placeholder=\"�?�����?��?��?, ����?����'�?�?��' �?" �?�?�>�?���?���\"": "placeholder=\"Название трека, артист или ссылка из YouTube\"",
        "<button id=\"searchButton\" class=\"search__button\">�?�����'��</button>": "<button id=\"searchButton\" class=\"search__button\">Искать</button>",
        "<p class=\"results__placeholder\">\n              �-�?��?�? ���?�?�?�?�'�?�? �?����?�>�?�'���'�< ���?��?���. �'�<�+��?�� �'�?���, �ؑ'�?�+�< �?�'���?���?��'�? ��?�? �+�?�'�?.\n            </p>": "<p class=\"results__placeholder\">Введи запрос, чтобы увидеть подборку музыки.</p>",
        "<h2 class=\"placeholder__title\">�?�?�>�>���Ő�?</h2>": "<h2 class=\"placeholder__title\">Избранное</h2>",
        "<p class=\"placeholder__text\">\n              �\"�?�+���?�>�?�� �>�?�+��?�<�� �'�?���� �? �?�?�?�� ���?�?�+�?�?���. �-�?��?�? �?�?�+��?�'�? ���>����>��?�'�< �� �?�?�:�?���?�'�?�?�<�� �?��>����<.\n            </p>": "<p class=\"placeholder__text\">Скоро здесь появится коллекция сохранённых треков и плейлистов.</p>",
        "<h2 class=\"placeholder__title\">�?�?�?�\"��>�?</h2>": "<h2 class=\"placeholder__title\">Профиль</h2>",
        "<p class=\"placeholder__text\">\n              �?�?����� �?�?�+���?��? ����?�?�?�?���>�?�?�<�� �?���?�'�?�?�����, �?�<�+�?�? �'��? �� ����ؐ�?�'�?�� �?�'�?��?��?�?��.\n            </p>": "<p class=\"placeholder__text\">В этом разделе появятся настройки качества, тёмная тема и подключение к аккаунту бота.</p>",
        "<span class=\"nav-item__label\">�\"�>���?�?���?</span>": "<span class=\"nav-item__label\">Главная</span>",
        "<span class=\"nav-item__label\">�?�?�'�?�?��?</span>": "<span class=\"nav-item__label\">История</span>",
        "<span class=\"nav-item__label\">�?�?��?��</span>": "<span class=\"nav-item__label\">Поиск</span>",
        "<span class=\"nav-item__label\">���+�?�?�?���</span>": "<span class=\"nav-item__label\">Избранное</span>",
        "<span class=\"nav-item__label\">�?�?�?�\"��>�?</span>": "<span class=\"nav-item__label\">Профиль</span>",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    if "<small class=\"app__license\">" not in text:
        text = text.replace("</nav>", "</nav>\n        <small class=\"app__license\">Анимации: LottieFiles (CC BY 4.0).</small>")
    path.write_text(text, encoding="utf-8")


if __name__ == "__main__":
    rewrite()
