const overallPrice = document.querySelector('#overall-price');
const filterBtn = document.querySelector('#filter-btn');
const totals = document.querySelectorAll('.total-cell');

function overallTotal(){
    let thisTotal = 0;

    totals.forEach( total => {
        thisTotal += parseFloat(total.innerText.split(' ')[1])
    })

    return thisTotal
}

window.addEventListener('load', e => {
    overallPrice.innerText = "";
    overallPrice.innerText = ' P '+overallTotal();
})