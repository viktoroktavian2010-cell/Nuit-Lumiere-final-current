# Nuit Lumière — результаты задания

- [x] **Текст и навигация:** “REMOVE STATIC NUMBERS: Remove any hardcoded numbers like "20" or "30" from the UI. Replace with a neutral label (e.g., "The Collection").”; “CHANGE "MAISON" TO "ABOUT": In the navigation menu, change the word "Maison" to "About". Make sure it links to the /about page. Remove any other references to "Maison" in the text.” В навигации есть `The Collection` и `About → /about`; коммерческие цены сохранены. В исходниках публичного UI не осталось текстовых упоминаний `Maison`.

- [x] **Главный экран:** “UPDATE HERO SECTION: Replace the current main hero image with the attached image of the diamond perfume bottle (BEST FRAGRANCES OF THE WORLD). Make it prominent and blend it with the dark background.” Используется присланное фото с тёмной виньеткой; оно prominent в асимметричном hero.

- [x] **Корзина:** “Create a working cart (add/remove, quantity +/-, total price). Persist in localStorage. Add a mini-cart in the header.” Реализованы add/remove/+/−, цены и subtotal; состояние сохраняется в `localStorage`; мини-корзина отображается в шапке. Preview проверил сохранение после перехода, quantity и обновление суммы, затем удалил тестовый товар.

- [x] **Checkout и доставка:** “Create a checkout page with a form (name, email, phone, address) and validation.”; “Shipping: Add Nova Poshta and Ukrposhta options. No international shipping. Currency: UAH.” Есть поля name/email/phone/address с клиентской и серверной валидацией, Nova Poshta и Ukrposhta, доставка только по Украине, суммы в UAH. Пустая форма показала 4 ошибки; фиктивный заказ не отправлялся, поскольку managed MySQL общая для разработки и production.

- [ ] **Тестовая оплата:** “Payments: Integrate LiqPay or monobank (test mode).” Реализован LiqPay test checkout/callback; принимаются только official `sandbox_` test keys. Checkout не готов до ввода пользователем test `LIQPAY_PUBLIC_KEY` и `LIQPAY_PRIVATE_KEY` через защищённую форму; без них заказ остаётся ожидающим оплаты.

- [ ] **Защищённое администрирование:** “Create a protected /admin route to manage orders and add/edit products.” `/admin` требует настоящую OAuth-сессию и серверную admin-role; доступны список/статусы заказов и создание/редактирование продуктов, включая переименование slug без дубликата. Автоматический owner ID не настроен; для выдачи роли аккаунту требуется `NUIT_ADMIN_EMAIL` через защищённый ввод.

- [x] **Артефакты:** “After completing all tasks, please provide a live preview link so I can see the result.”; “Also, generate a full ZIP archive of the updated project and provide a download link.” Live Preview отвечает, все основные маршруты проверены; полный ZIP исходников, migrations, lockfile, build и статических assets подготовлен без `.git`, `node_modules` и реальных `.env`.

- [x] **Стиль:** “Keep the dark, gold, minimalist premium style. Do not change the overall layout, just fix the errors and add the functionality.” Сохранены тёмная сцена, золото, редакционный hero и лаконичная навигация; добавлены корзина и коммерческие страницы в той же системе.


- [x] **Руководство по Vercel:** “The project is deployed to Vercel, but I get a completely white screen. The Vercel logs are empty. Please provide the exact list of Environment Variables I need to add to Vercel to make the site work. Use the format: KEY=value. (If you have a .env.local file, just list its contents with safe/mock values).” В `docs/vercel-environment.md` перечислены имена переменных и безопасный `.env.local` шаблон, указаны значения, которые Vercel задаёт сам, обязательные сервисные credential dependencies и предел: только переменные не включают отсутствующий Vercel backend adapter. В этом репозитории настоящего `.env.local` и реальных секретов нет.

- [x] **Мужская коллекция:** “Create an elegant section for the Men's collection (e.g., \"For Him\"). Use the attached image as the main visual for this section. Make it look premium, blending with the dark and gold aesthetic. Add the text overlay: \"For the man you desire\".” Главная страница получила отдельный адаптивный блок For Him с приложенным портретом, золотым затемнением и точным текстом поверх изображения.
