export default (req, res) => {
    let axios = require("axios")
    let CryptoJS = require("crypto-js")

    if (req.body["ResponseCode"] === "1") {
        let {OrderID, amt, fio, MerID} = req.body

        console.log(req.body)

        let signature = CryptoJS.SHA256("CTD378Du" + MerID + OrderID).toString(CryptoJS.enc.Base64)

        var amount = (parseFloat(amt) / 100.0).toFixed(2)

        let data = {
            "id": OrderID,
            "orderId": OrderID,
            "receipt_id": OrderID,
            "client": {"email": "yumecs.pay@gmail.com"},
            "company": {
                "email": "yumecs.pay@gmail.com",
                "inn": "7726433751",
                "paymentAddress": "https://yumecs.uz"
            },
            "receipt": {
                "items": [{
                    "name": OrderID + " " + fio,
                    "price": amount,
                    "quantity": 1.0,
                    "sum": amount,
                    "unit": encodeURIComponent("шт"),
                    "method": "full_payment",
                    "object": "commodity",
                    "vat": {"type": "none", "sum": 0}
                }],
                "payments": [{"type": 1, "sum": amount}],
                "total": amount
            }
        };

        console.log("Data\n")
        console.log(data)
        console.log("======================================")


        axios.default.post("https://mpi.mkb.ru:8443/OnlineReceipt/1/" + MerID + "/receipt",
            data,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Signature": signature,
                    "Accept-Charset": "utf-8"
                }
            }).then(function (response) {
            console.log("Response: \n")
            console.log(JSON.stringify(response.data))
            res.statusCode = 200
            res.send({
                status: "Send successful"
            })
        }).catch(function (error) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.log(error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', error.message);
            }
            console.log(error.config);
            res.statusCode = 200
            res.send({
                status: "error",
                error: error
            })
        });
    }else{
        res.statusCode = 200;
        res.send({
            message: "Unsuccessful payment",
            "request": req.body
        })
    }
}