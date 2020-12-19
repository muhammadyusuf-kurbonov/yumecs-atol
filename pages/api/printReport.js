export default (req, res) => {
    let axios = require("axios")
    let CryptoJS = require("crypto-js")

    let {OrderID, amt, fio} = req.body

    let signature = CryptoJS.SHA256("nXkG847p600000000001560" + OrderID).toString(CryptoJS.enc.Base64)

    console.log(req)

    axios.default.post("https://mpi.mkb.ru:9443/OnlineReceipt/1/600000000001560/receipt",
        {
            "id": OrderID,
            "orderId": OrderID,
            "client": {"email": "muhammadyusuf.kurbonov2002@gmail.com"},
            "company": {
                "email": "muhammadyusuf.kurbonov2002@gmail.com",
                "inn": "5544332219",
                "paymentAddress": "https://v4.online.atol.ru"
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
                    "vat": {"type": "vat10", "sum": 9.09}
                }], "payments": [{"type": 1, "sum": amt}], "total": amt
            }
        },
        {
            headers: {
                "Content-Type": "application/json",
                "Signature": signature
            }
        }).then(function (response) {
        res.send(response.data)
    }).catch(function (error) {
        res.send(error)
    })
}