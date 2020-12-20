export default (req, res) => {
    let axios = require("axios")
    let CryptoJS = require("crypto-js")

    let {OrderID, amt, fio, MerID} = req.body

    console.log(req)

    let signature = CryptoJS.SHA256("xRXd7yxG" + MerID + OrderID).toString(CryptoJS.enc.Base64)

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
                    "price": amt,
                    "quantity": 1.0,
                    "sum": amt,
                    "unit": "шт",
                    "method": "full_payment",
                    "object": "commodity",
                    "vat": {"type": "none", "sum": 0}
                }],
                "payments": [{"type": 1, "sum": amt}],
                "total": amt
            }
        },
        {
            headers: {
                "Content-Type": "application/json",
                "Signature": signature
            }
        }).then(function (response) {
        console.log(response.statusCode)
        console.log(response.data)
        res.statusCode = 200
        res.send(response.data)
    }).catch(function (error) {
        console.error(JSON.stringify(error.stack))
        res.statusCode = 500
        res.send(error)
    })
}