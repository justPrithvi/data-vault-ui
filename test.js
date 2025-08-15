// here 

// prices = [7, 1, 5, 3, 6, 4]

// initial profit = 0 

// Math.max(inital profix, currProfit)

// o(n), o(1), o(1) => o(n)
// o(1)






// prices = [7, 1, 5, 3, 6, 4]
const profit = (prices) => {
    let finalProfit = 0
    let cp = prices[0]
    for(let i = 1; i<prices.length; i+=1) {
        cp = Math.min(cp, prices[i])
        finalProfit = Math.max(finalProfit, prices[i]-cp)
    }
    return finalProfit;
}

const profitAgain = (prices) => {
    let cp = prices[0]
    let isBought = true
    let finalProfit = 0

    for(let i = 1; i<prices.length; i+=1) {
        if(prices[i] < cp || isBought == false ) {
            cp = prices[i] 
            isBought = true
            continue
        }
        
        if(prices[i] > cp) {
            finalProfit = finalProfit + (prices[i] - cp)
            cp = 0
            isBought = false
        } 
    }
    return finalProfit
}




const prices =  [1, 2, 3]
console.log(profitAgain(prices))







