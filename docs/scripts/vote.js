/* GPT - keys | 1.0.0 */

/*
========================================
ГОЛОСОВАНИЕ TOP 21
========================================
*/

/*
Вставь данные своего проекта Supabase.
Project URL и Publishable key находятся:
Supabase → Project Settings → API
*/

const SUPABASE_URL = 'https://fnodbpiwkkrdgqvmyanq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZub2RicGl3a2tyZGdxdm15YW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NDk5MDAsImV4cCI6MjA4OTAyNTkwMH0.Gi4l3LAU3S4T77_2xgVWKmkeW34xblrJf04IlE4zu9I';

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


/*
========================================
АНОНИМНЫЙ ID ПОСЕТИТЕЛЯ
========================================
*/

function getVisitorId() {
  let visitorId = localStorage.getItem("top21_visitor_id");

  if (!visitorId) {
    visitorId = crypto.randomUUID();

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

  if (status) {
    status.textContent = message;
  }
}


/*
========================================
ПРОВЕРКА СОХРАНЕННОГО ГОЛОСА
========================================
*/

function restoreVote() {
  const savedVote =
    localStorage.getItem(getVoteKey());

  if (!savedVote) {
    return;
  }

  disableVoteButtons();

  if (savedVote === "yes") {
    showVoteStatus("Ваш голос: Да");
  }

  if (savedVote === "no") {
    showVoteStatus("Ваш голос: Нет");
  }
}


/*
========================================
ОТПРАВКА ГОЛОСА
========================================
*/

async function sendVote(choice) {
  /*
  Не позволяем отправить второй голос,
  если он уже сохранен в этом браузере.
  */

  const savedVote =
    localStorage.getItem(getVoteKey());

  if (savedVote) {
    disableVoteButtons();
    showVoteStatus("Вы уже голосовали.");
    return;
  }

  /*
  Сразу блокируем обе кнопки.
  Поэтому многократное быстрое нажатие
  не создаст несколько запросов.
  */

  disableVoteButtons();
  showVoteStatus("Сохраняется...");

  const visitorId = getVisitorId();

  const voteValue =
    choice === "yes";

  const { error } = await supabaseClient
    .from("top21_votes")
    .insert({
      poem_number: poemNumber,
      visitor_id: visitorId,
      vote: voteValue
    });

  if (error) {
    /*
    PostgreSQL 23505:
    нарушено ограничение UNIQUE.

    Значит этот visitor_id уже голосовал
    за это стихотворение.
    */

    if (error.code === "23505") {
      localStorage.setItem(
        getVoteKey(),
        choice
      );

      showVoteStatus(
        "Вы уже голосовали."
      );

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

  if (choice === "yes") {
    showVoteStatus("Ваш голос: Да");
  } else {
    showVoteStatus("Ваш голос: Нет");
  }
}


/*
========================================
ЗАПУСК ПОСЛЕ ЗАГРУЗКИ СТРАНИЦЫ
========================================
*/

document.addEventListener(
  "DOMContentLoaded",
  restoreVote
);
