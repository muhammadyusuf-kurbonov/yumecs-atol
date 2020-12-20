export default (req, res) => {
    let axios = require("axios")
    let CryptoJS = require("crypto-js")

    let {OrderID, amt, fio, MerID} = req.body

    console.log(req)

    let signature = CryptoJS.SHA256("xRXd7yxG" + MerID + OrderID).toString(CryptoJS.enc.Base64)

    var amount = (parseFloat(amt) / 100.0).toFixed(2)

    axios.default.post("https://mpi.mkb.ru:8443/OnlineReceipt/1/" + MerID + "/receipt",
        {
            "id": OrderID,
            "orderId": OrderID,
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
        },
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
        console.error(JSON.stringify(error.stack))
        res.statusCode = 200
        res.send(error)
    })
}