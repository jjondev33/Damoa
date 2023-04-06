require('dotenv').config();
const mongoose = require('mongoose');
const Pro_info = require(`./prodInfoSchema.js`);
const test_datas = require(`./test_datas.js`);
const scraping = require('./scraping.js');

mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URI, (err) => {
    if (!err) console.log('db connected');
    else console.log('db error');
});

//크롤링한 데이터를 저장할지 정하는 메소드
async function save_prod_info(pro_info) {

    // 크롤링한 정보(pro_info)에서 pcode와 동일한 값을 조회
    const same_pcode = await Pro_info.findOne({ pcode: pro_info.pcode });

    const today_date = pro_info.prices[0].date;
    const today_lowprice = pro_info.prices[0].low_price;

    if (!same_pcode) { // same_pcode가 없다면

        console.log('최초 데이터와 테스트 데이터 입력');
        
        const new_prod_info = new Pro_info({
            pcode: pro_info.pcode,
            name: pro_info.name,
            img_src: pro_info.img_src,
            prices: pro_info.prices,
        });

        // 테스트용 데이터 입력
        new_prod_info.prices = test_datas.input_test_data(new_prod_info.prices)

        // 인접한 데이터의 low_price가 같다면 date를 비교해서 작은 date 값을 가지고 있는 것만 남긴다 
        new_prod_info.prices = test_datas.removeDuplicatePrices(new_prod_info.prices);

        return await new_prod_info.save();
        
    // 오늘 날짜 , DB문서 최신 날짜 가 같고
    // 오늘 최저 가격이 DB문서 최신 가격보다 작다면
    } else if ( today_date === same_pcode.prices.slice(-1)[0].date && today_lowprice < same_pcode.prices.slice(-1)[0].low_price ) { 

        console.log('동일 날짜에 최저가 갱신');
        console.log(`날짜 : ${today_date}, 최저가 : ${today_lowprice}`);

        
        const filter = { pcode: pro_info.pcode}; // pcode가 같은 문서를 찾는다.
        const update = { $set: { "prices.$[elem].low_price": today_lowprice } }; // 옵션의 필터에 해당하는 배열에 금일 최저가격을 업데이트 한다.
        const options = { new: true, arrayFilters: [ { "elem.date": same_pcode.prices.slice(-1)[0].date } ]}; // new: true = 문서를 반환합니다. , arrayFilters 배열에서 필터를 선택

        return await Pro_info.findOneAndUpdate(filter, update, options);

        
    // 오늘 날짜 , DB문서 최신 날짜 더 최신이고
    // 오늘 최저 가격이 DB문서 최신 가격 다르다면
    } else if (today_date > same_pcode.prices.slice(-1)[0].date && today_lowprice !== same_pcode.prices.slice(-1)[0].low_price) {

        console.log('최저가 변화로 인하여 신규 날짜와 최저가 입력');
        console.log(`날짜 : ${today_date}, 최저가 : ${today_lowprice}`);

        const filter = { pcode: pro_info.pcode}; // pcode가 같은 문서를 찾는다.
        const update = { $push: { "prices": {low_price : today_lowprice, date : today_date} } }; // {최저가격, 날짜} 새로 추가
        const options = { new: true, upsert: true}; // new: true = 문서를 반환합니다.

        return await Pro_info.findOneAndUpdate(filter, update, options);
    };
    return same_pcode;
};


module.exports.save_prod_info = save_prod_info;
