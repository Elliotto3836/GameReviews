console.log("working");

function createReviewCard(review){
    const card = document.createElement("div");
    card.style.width = "60rem"
    card.classList.add("mb-4","mx-auto", "bg-white", "border", "border-nord-02", "rounded-lg", "shadow-md", "overflow-hidden","text-lg", "font-semibold", "text-nord1");
    
    const title = document.createElement("div");
    title.classList.add("p-4","text-nord0");
    title.textContent = `${review.title}`;
    card.appendChild(title);

    const author = document.createElement("div");
    author.classList.add("px-4", "pb-2","text-xs","text-nord2");
    author.textContent= `Reviewed by ${review.author}`;
    card.appendChild(author);
    
    const reviewText = document.createElement("div");
    reviewText.classList.add("p-4","text-nord2");
    reviewText.textContent = `${review.body}`;
    card.appendChild(reviewText);
    

    const timestamp = document.createElement("div");
    timestamp.classList.add("px-4", "pb-2","text-xs", "text-nord2");
    timestamp.textContent = `Reviewed on ${review.createdAt}`;
    card.appendChild(timestamp);

    const platform = document.createElement("div");
    platform.classList.add("px-4", "pb-2","text-xs","text-nord2");
    platform.textContent = `Played on ${review.platforms}`;
    card.appendChild(platform);

    const hours = document.createElement("div");
    hours.classList.add("px-4", "pb-2","text-xs","text-nord2");
    hours.textContent = `Play time: ${review.time} hours`;
    card.appendChild(hours);

    const scoreDiv = document.createElement("div");
    scoreDiv.classList.add("p-4","text-4xl","font-bold", "text-nord1");
    scoreDiv.innerHTML = `${review.score}`; 
    card.appendChild(scoreDiv);

    return card;
}

function onType(evt){
    console.log(evt.target.value);
    loadReviews(evt.target.value,reviews,reviewDiv);
}

function loadReviews(query,reviews,reviewDiv){
    reviewDiv.innerHTML="";
    for (const review of reviews.reverse()) {
        if(review.title.toLowerCase().includes(query.toLowerCase())){
            let card = createReviewCard(review);
            reviewDiv.appendChild(card);
        }
    }
}

async function main() {
    const response = await fetch('/api/reviews'); 
    reviews = await response.json(); 
//reverse to get reviews sorted by most recent,,
    reviewDiv = document.getElementById("reviews");
    const searchDiv = document.getElementById("search");
    searchDiv.addEventListener("input",onType);
    loadReviews("",reviews,reviewDiv);
    

}

let reviews;
let reviewDiv;

main();
    

