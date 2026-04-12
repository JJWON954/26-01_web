const loadButton = document.querySelector("#load-button");
const postList = document.querySelector("#post-list");

async function loadPosts() {
  postList.innerHTML = "<p>데이터를 불러오는 중입니다...</p>";

  const response = await fetch("https://koreandummyjson.vercel.app/api/posts");
    const data = await response.json();
    const postCards = data.posts.slice(0, 7).map(function (post) {
      return `
        <article class="post-card">
          <h2>${post.title}</h2>
        </article>
      `;
    }).join("");
    
  postList.innerHTML = postCards;
}

loadButton.addEventListener("click", loadPosts);

//fetch와 response.json()의 역할 설명
//fetch는 서버에 데이터를 요청하는 함수. 
//response.json()은 서버에서 받은 응답을 JSON 형식으로 변환하는 함수.