const moment = require('moment');


// 테스트용 가격 입력
function input_test_data(prices) {
    //테스트 데이터 양
    const test_amount = 20;
    // 날짜 범위
    const date_range = 3;
    // 가격 오차 범위
    const price_range = 500;
    for (var i = 0; i < test_amount; i++) {
        const test_date = Number(moment().subtract(Math.floor(Math.random() * date_range) + date_range * i, 'days').format('YYYYMMDD'));
        const test_lowPrice = Number(prices[0].low_price) + Math.floor(Math.random() * price_range * 2) - price_range;

        prices.unshift({ date: test_date, low_price: test_lowPrice });
    }
    return prices
}

// 인접한 데이터의 low_price가 같다면 date를 비교해서 작은 date 값을 가지고 있는 것만 남긴다.
// 인접한 데이터의 date가 같다면 low_price를 비교해서 작은 low_price를 값을 가지고 있는 것만 남긴다.
function removeDuplicatePrices(prices) {

    prices.sort((a, b) => a.date - b.date);

    for (let i = 0; i < prices.length - 1; i++) {

        if (prices[i].date === prices[i + 1].date) {
            console.log(`날짜 ${prices[i].date} 와 ${prices[i + 1].date}`);
            console.log(`가격 ${prices[i].low_price} 와 ${prices[i + 1].low_price}`);
            if (prices[i].low_price > prices[i + 1].low_price) {
                prices.splice(i + 1, 1);
            } else {
                prices.splice(i, 1);
            };
            i--;
        };

        if (prices[i].low_price === prices[i + 1].low_price) {
            console.log(`날짜 ${prices[i].date} 와 ${prices[i + 1].date}`);
            console.log(`가격 ${prices[i].low_price} 와 ${prices[i + 1].low_price}`);
            if (prices[i].date < prices[i + 1].date) {
                prices.splice(i + 1, 1);
            } else {
                prices.splice(i, 1);
            };
            i--;
        };
    };

    return prices;
}



module.exports.input_test_data = input_test_data;
module.exports.removeDuplicatePrices = removeDuplicatePrices;