/* проверка повторного голосования | 1.1.0 */

/*
========================================
ГОЛОСОВАНИЕ TOP 21
========================================
*/

/*
Данные проекта Supabase.

Project URL и Publishable key находятся:
Supabase → Project Settings → API
*/

const SUPABASE_URL =
  "https://fnodbpiwkkrdgqvmyanq.supabase.co";

const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZub2RicGl3a2tyZGdxdm15YW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NDk5MDAsImV4cCI6MjA4OTAyNTkwMH0.Gi4l3LAU3S4T77_2xgVWKmkeW34xblrJf04IlE4zu9I";


const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


/*
========================================
АНОНИМНЫЙ ID ПОСЕТИТЕЛЯ
========================================
*/

function getVisitorId() {

  let visitorId =
    localStorage.getItem(
      "top21_visitor_id"
    );


  if (!visitorId) {

    visitorId =
      crypto.randomUUID();


    localStorage.setItem(
      "top21_visitor_id",
      visitorId
    );

  }


  return visitorId;

}


/*
========================================
КЛЮЧ ГОЛОСА В LOCALSTORAGE
========================================
*/

function getVoteKey() {

  return "top21_vote_" + poemNumber;

}


/*
========================================
БЛОКИРОВКА КНОПОК
========================================
*/

function disableVoteButtons() {

  const yesButton =
    document.getElementById("voteYes");

  const noButton =
    document.getElementById("voteNo");


  if (yesButton) {
    yesButton.disabled = true;
  }


  if (noButton) {
    noButton.disabled = true;
  }

}


/*
========================================
РАЗБЛОКИРОВКА КНОПОК
========================================
*/

function enableVoteButtons() {

  const yesButton =
    document.getElementById("voteYes");

  const noButton =
    document.getElementById("voteNo");


  if (yesButton) {
    yesButton.disabled = false;
  }


  if (noButton) {
    noButton.disabled = false;
  }

}


/*
========================================
ВЫВОД СТАТУСА
========================================
*/

function showVoteStatus(message) {

  const status =
    document.getElementById("voteStatus");


  if (!status) {
    return;
  }


  /*
  Разрешаем переносы строк через \n.
  */

  status.style.whiteSpace =
    "pre-line";


  status.textContent =
    message;

}


/*
========================================
ФОРМИРОВАНИЕ СООБЩЕНИЯ О ГОЛОСЕ
========================================
*/

function getSavedVoteMessage(choice) {

  const answer =
    choice === "yes"
      ? "Да"
      : "Нет";


  return (
    "Вы уже проголосовали за этот стих.\n"
    + "Ваш голос: "
    + answer
  );

}


/*
========================================
ПОКАЗ УЖЕ СОХРАНЕННОГО ГОЛОСА

Сообщение выводится сразу после
открытия страницы.

Таймер ждать не нужно.
========================================
*/

function showSavedVote(choice) {

  const voteDetails =
    document.getElementById(
      "voteDetails"
    );

  const openVoteButton =
    document.getElementById(
      "openVoteButton"
    );


  disableVoteButtons();


  /*
  Сразу открываем скрытый блок
  с сообщением о голосе.
  */

  if (voteDetails) {

    voteDetails.classList.add(
      "open"
    );

  }


  /*
  Главная кнопка голосования
  больше не нужна.
  */

  if (openVoteButton) {

    openVoteButton.disabled = true;

    openVoteButton.textContent =
      "ВЫ УЖЕ ПРОГОЛОСОВАЛИ";

  }


  showVoteStatus(
    getSavedVoteMessage(choice)
  );

}


/*
========================================
ПРОВЕРКА ГОЛОСА В SUPABASE
========================================
*/

async function getVoteFromDatabase() {

  const visitorId =
    getVisitorId();


  const {
    data,
    error
  } = await supabaseClient
    .from("top21_votes")
    .select("vote")
    .eq(
      "poem_number",
      poemNumber
    )
    .eq(
      "visitor_id",
      visitorId
    )
    .maybeSingle();


  if (error) {

    console.error(
      "Ошибка проверки голоса:",
      error
    );

    return null;

  }


  if (!data) {
    return null;
  }


  return data.vote
    ? "yes"
    : "no";

}


/*
========================================
ПРОВЕРКА СОХРАНЕННОГО ГОЛОСА

Проверка выполняется сразу при загрузке:

1. Сначала localStorage.
2. Если там ничего нет — Supabase.
3. Если голос найден — сразу показываем
   сообщение, не ожидая таймера.
========================================
*/

async function restoreVote() {

  const savedVote =
    localStorage.getItem(
      getVoteKey()
    );


  /*
  Голос найден в localStorage.
  */

  if (
    savedVote === "yes"
    || savedVote === "no"
  ) {

    showSavedVote(
      savedVote
    );

    return true;

  }


  /*
  В localStorage ничего нет.

  Проверяем Supabase.
  */

  const databaseVote =
    await getVoteFromDatabase();


  if (!databaseVote) {
    return false;
  }


  /*
  Восстанавливаем голос
  в localStorage.
  */

  localStorage.setItem(
    getVoteKey(),
    databaseVote
  );


  showSavedVote(
    databaseVote
  );


  return true;

}


/*
========================================
ОТПРАВКА ГОЛОСА
========================================
*/

async function sendVote(choice) {

  /*
  Защита от неправильного значения.
  */

  if (
    choice !== "yes"
    && choice !== "no"
  ) {

    console.error(
      "Недопустимое значение голоса:",
      choice
    );

    return;

  }


  /*
  Не позволяем отправить второй голос,
  если он уже сохранен в браузере.
  */

  const savedVote =
    localStorage.getItem(
      getVoteKey()
    );


  if (
    savedVote === "yes"
    || savedVote === "no"
  ) {

    showSavedVote(
      savedVote
    );

    return;

  }


  /*
  Сразу блокируем обе кнопки.

  Поэтому многократное быстрое нажатие
  не создаст несколько запросов.
  */

  disableVoteButtons();


  showVoteStatus(
    "Сохраняется..."
  );


  const visitorId =
    getVisitorId();


  const voteValue =
    choice === "yes";


  const {
    error
  } = await supabaseClient
    .from("top21_votes")
    .insert({

      poem_number:
        poemNumber,

      visitor_id:
        visitorId,

      vote:
        voteValue

    });


  if (error) {

    /*
    PostgreSQL 23505:

    нарушено ограничение UNIQUE.

    Значит этот visitor_id уже голосовал
    за это стихотворение.
    */

    if (error.code === "23505") {

      /*
      Получаем реальный старый голос
      из базы.

      Нельзя использовать новое нажатие,
      потому что пользователь мог раньше
      голосовать иначе.
      */

      const databaseVote =
        await getVoteFromDatabase();


      if (databaseVote) {

        localStorage.setItem(
          getVoteKey(),
          databaseVote
        );


        showSavedVote(
          databaseVote
        );

      } else {

        disableVoteButtons();


        showVoteStatus(
          "Вы уже проголосовали за этот стих."
        );

      }


      return;

    }


    console.error(
      "Ошибка голосования:",
      error
    );


    enableVoteButtons();


    showVoteStatus(
      "Голос не сохранен."
    );


    return;

  }


  /*
  Сохраняем результат в браузере
  только после успешной записи в базу.
  */

  localStorage.setItem(
    getVoteKey(),
    choice
  );


  disableVoteButtons();


  /*
  После первого успешного голосования
  выводим обычное подтверждение.
  */

  if (choice === "yes") {

    showVoteStatus(
      "Ваш голос: Да"
    );

  } else {

    showVoteStatus(
      "Ваш голос: Нет"
    );

  }

}


/*
========================================
ЗАПУСК ПОСЛЕ ЗАГРУЗКИ СТРАНИЦЫ

Проверка запускается сразу.

Ждать окончания таймера не нужно.
========================================
*/

document.addEventListener(
  "DOMContentLoaded",
  function () {

    restoreVote();

  }
);
