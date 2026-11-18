# Nuit Lumière — карта эффектов

Все эффекты в этой версии находятся в читаемых исходниках TypeScript/CSS, а не только в собранном минифицированном JavaScript.

## Typewriter

`client/src/components/TypewriterText.tsx` — общий React-компонент: `useState` хранит видимую часть строки, а `useEffect` с `setInterval` добавляет по одному Unicode-символу. По умолчанию интервал — 100 мс. Компонент не использует CSS marquee или CSS-анимацию сокрытия текста.

- Подпись «For the man you desire»: подключена в `client/src/pages/Home.tsx`, цвет и Great Vibes заданы в `client/src/index.css`.
- Стих Mirror: подключён в `client/src/pages/Mirror.tsx`; шрифт, золотой цвет и прозрачный фон находятся в `client/src/pages/Mirror.css`.
- Названия настроений Sun/Rain/Night: `.mirror-mood-title` в `client/src/pages/Mirror.css`.
- Dedication и остальные paragraphs About: подключены в `client/src/pages/About.tsx`; цвет/гарнитура — `client/src/pages/About.css`.

## Golden Dust Cursor

`client/src/components/GoldenDustCursor.tsx` рисует частицы в canvas на `pointermove`; `client/src/components/GoldenDustCursor.css` задаёт декоративный слой без перехвата кликов. Компонент включён глобально из `client/src/App.tsx`. Он рассчитан на мышь/перо и отключается для сенсорного указателя и при включённом системном `prefers-reduced-motion`.

## Oracle Search

`client/src/components/OracleSearch.tsx` и `OracleSearch.css` содержат поле поиска, посимвольный placeholder на JavaScript, мерцающую золотую линию и выдачу по локальному каталогу. Поиск отображается только на Mirror и Gallery; на Gallery используется placeholder `Search fragrances...`, на Mirror — `Tell the Oracle your secret desire...`. На Home и About поисковой строки нет. Поиск фильтрует название, бренд и описание товара; сам по себе он не вызывает AI/оракульный backend. Размещение внутри `SiteLayout` и активные ссылки меню находятся в `client/src/components/Storefront.tsx`.

## Mirror: прокрутка и звук

После выбора Sun/Rain/Night `client/src/pages/Mirror.tsx` ждёт 300 мс и вызывает `scrollIntoView({ behavior: "smooth", block: "center" })` для секции бутылки и стиха. Карточки, смена фона и mood audio triggers находятся в `Mirror.tsx`/`client/src/lib/audioEvents.ts`.

Фоновая тема и приветственная речь — локальные файлы `client/public/media/nuit-lumiere-theme.mp3` и `nuit-lumiere-welcome-velvet.mp3`. Рассказ About проигрывается компонентом `client/src/components/AboutNarration.tsx` из `client/public/media/about-story.mp3`. Атмосферные звуки Sun/Rain/Night подключаются из внешних Mixkit preview URL в `MusicControl.tsx`; для них браузеру нужно интернет-соединение. Голосовые подсказки товара использует Web Speech API браузера в том же компоненте.

## Шрифт

Google Font Great Vibes добавлен к импорту шрифтов в `client/src/index.css`. При первом открытии страницы для загрузки гарнитуры нужен доступ к `fonts.googleapis.com`/`fonts.gstatic.com`; без сети браузер использует запасной cursive.
