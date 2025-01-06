//https://raw.githack.com/MrRio/jsPDF/master/docs/index.html


export function getSummary(reviews){
    

    const num = reviews.length;
    const averageRating = reviews.reduce((acc, review) => acc + review.score,0) / num;
    const averageLength = reviews.reduce((acc, review) => acc + review.time, 0) / num;
    const games = reviews.map(review => review.title);
    let mostPlayedTime = -1;
    let mostPlayedGame;
    for(let review of reviews){
        if(review.time>mostPlayedTime){
            mostPlayedTime=review.time;
            mostPlayedGame=review.title;
        }
    }
    return{
        num,
        averageRating,
        averageLength,
        games,
        mostPlayedTime,
        mostPlayedGame
    }

}
