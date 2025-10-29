from pathlib import Path

def rewrite():
    path = Path("webapp/app.js")
    text = path.read_text(encoding="utf-8")
    text = text.replace("title: item.title || \"��� ��������\"", "title: item.title || \"Без названия\"")
    text = text.replace("state.errorMessage = \"������ �� �������.\"", "state.errorMessage = \"Ничего не найдено.\"")
    text = text.replace("subtitle.textContent = `������, ${state.user.first_name ?? state.user.username ?? \"����\"}! ����� ���� � ������� ��� ����.`;", "subtitle.textContent = `Привет, ${state.user.first_name ?? state.user.username ?? \"друг\"}! Здесь можно слушать музыку из YouTube.`;")
    text = text.replace("console.warn(\"�� ������� ���������������� ��������:\", error);", "console.warn(\"Не удалось воспроизвести анимацию навигации:\", error);")
    path.write_text(text, encoding=\"utf-8\")


if __name__ == \"__main__\":
    rewrite()
