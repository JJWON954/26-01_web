const loadButton = document.querySelector("#load-button");
const postList = document.querySelector("#post-list");

async function loadPosts() {
  // 사용자에게 현재 상태를 먼저 보여줍니다.
  postList.innerHTML = "<p>데이터를 불러오는 중입니다...</p>";

  // 공개 API에 요청을 보냅니다.
  const response = await fetch("https://koreandummyjson.vercel.app/api/posts");
  const data = await response.json();

  // 화면에 보일 카드 문자열을 만듭니다.
  const postCards = data.posts
    .slice(0, 5)
    .map(function (post) {
      return `
        <article class="post-card">
          <h2>${post.title}</h2>
          <p>${post.content}</p>
        </article>
      `;
    })
    .join("");

  postList.innerHTML = postCards;
}

loadButton.addEventListener("click", loadPosts);