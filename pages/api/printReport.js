export default (req, res) => {
    let axios = require("axios")
    let CryptoJS = require("crypto-js")

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
                "unit": "шт",
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
                "Signature": signature
            }
        }).then(function (response) {
        console.log(response.data)
        res.statusCode = 200
        res.send(response.data)
    }).catch(function (error) {
        console.log("Error:")
        console.error(JSON.stringify(error.stack))
        console.log(JSON.stringify(error))
        res.statusCode = 200
        res.send(error)
    })
}