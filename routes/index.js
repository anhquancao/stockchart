var express = require('express');
var router = express.Router();
var axios = require('axios');
var Stock = require('../models/stock');

function formatData(data) {
    return data.slice(0, 30).reverse().map(function (info) {
        return [info[0], info[1]];
    });
}

/* GET home page. */
router.delete('/stock/:code', function (req, res) {
    var code = req.params.code.toUpperCase();
    Stock.findOne({code: code}, function (err, stock) {
        if (err) console.log(err);
        if (stock) {
            stock.remove(function (err) {
                if (err) {
                    console.log(err);
                    res.json({status: 0})
                } else {
                    res.json({status: 1});
                }
            });

        }else{
            res.json({status: 0});
        }
    })
});

router.get('/stocks', function (req, res) {
    Stock.find()
        .exec(function (err, stocks) {
            if (err) res.json(err);
            var promises = stocks.map(function (stock) {
                return axios.get("https://www.quandl.com/api/v3/datasets/WIKI/" + stock.code + ".json?api_key=" + process.env.QUANDL_KEY);
            });
            axios.all(promises)
                .then(function (responses) {
                    var stocks = [];
                    var dates = [];
                    responses.map(function (response, i) {
                        var temp = formatData(response.data.dataset.data);
                        stocks.push({
                            name: response.data.dataset.name,
                            code: response.data.dataset.dataset_code,
                            data: temp.map(function (item) {
                                return item[1];
                            })
                        });
                        dates = temp.map(function (item) {
                            return item[0];
                        })
                    });
                    res.json({
                        stocks: stocks,
                        dates: dates
                    });
                });


        });
});

router.post('/stock/:code', function (req, res) {
    var code = req.params.code.toUpperCase();
    var url = "https://www.quandl.com/api/v3/datasets/WIKI/" + code + ".json?api_key=" + process.env.QUANDL_KEY;
    axios.get(url)
        .then(function (result) {
            Stock.findOne({code: code}, function (err, stock) {
                if (err) {
                    res.json(err);
                }
                if (stock) {
                    res.json({
                        status: 0,
                        message: "Stock code Existed"
                    })
                } else {
                    var stock = new Stock();
                    stock.name = result.data.dataset.name;
                    stock.code = code;
                    stock.save(function (err) {
                        if (err) {
                            res.json({
                                status: 0,
                                message: "Save error"
                            });
                        } else {
                            axios.get("https://www.quandl.com/api/v3/datasets/WIKI/" + stock.code + ".json?api_key=" + process.env.QUANDL_KEY)
                                .then(function (response) {
                                    var temp = formatData(response.data.dataset.data);
                                    res.json({
                                        status: 1,
                                        data: {
                                            name: response.data.dataset.name,
                                            code: response.data.dataset.dataset_code,
                                            data: temp.map(function (item) {
                                                return item[1];
                                            })
                                        }
                                    });
                                });

                        }
                    });
                }
            });
        })
        .catch(function (error) {
            if (error.response) {
                res.json({
                    status: 0,
                    message: "Stock code not found"
                });
            }
        });

});

module.exports = router;
