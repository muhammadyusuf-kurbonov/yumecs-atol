export default async (req, res) => {
    let axios = require("axios")
    let CryptoJS = require("crypto-js")

    const mid = "620000000003267"
    const aid = "443222"
    const site_link = "https://yumecs.uz"
    const redirect_url = "www.yumecs.uz"
    const merchant_mail = "yumecspay@gmail.com"


    let {oid, amount} = req.body

    console.log(req.body)

    let amount_value = parseFloat(amount)

    let signature = CryptoJS.SHA256("CTD378Du" + mid + oid).toString(CryptoJS.enc.Base64)

    let data = {
        "id": oid,
        "orderId": oid,
        "client": {"email": "yumecs.pay@gmail.com"},
        "company": {
            "email": "yumecs.pay@gmail.com",
            "inn": "7726433751",
            "paymentAddress": "https://yumecs.uz"
        },
        "receipt": {
            "items": [{
                "name": oid,
                "price": amount_value,
                "quantity": 1.0,
                "sum": amount_value,
                "unit": encodeURIComponent("шт"),
                "method": "full_payment",
                "object": "commodity",
                "vat": {"type": "none", "sum": 0}
            }],
            "payments": [{"type": 1, "sum": amount_value}],
            "total": amount_value
        }
    };

    console.log("Data\n")
    console.log(data)
    console.log("======================================")


    let receiptResponse = await axios.default.post("https://mpi.mkb.ru:8443/OnlineReceipt/1/" + mid + "/receipt",
        data,
        {
            headers: {
                "Content-Type": "application/json",
                "Signature": signature,
                "Accept-Charset": "utf-8"
            }
        })
    console.log("Response: \n")
    console.log(JSON.stringify(receiptResponse.data))

    if (receiptResponse.data["success"]){

        let amount_str = amount + "00"

        while (amount_str.length < 12){
            amount_str = "0"+amount_str
        }

        let payment_info = {
            "mid": mid,
            "aid": aid,
            "amount": amount_value,
            "oid": oid,
            "signature": CryptoJS.SHA256("CTD378Du"+mid+aid+oid+amount_str+"643").toString(CryptoJS.enc.Base64),
            "redirect_url": redirect_url,
            "site_link": site_link,
            "merchant_mail": merchant_mail,
            "receipt_id": oid
        }

        let paymentResponse = axios.default.post("https://mpi.mkb.ru/MPI_payment/",
            payment_info)

        console.log(JSON.stringify(paymentResponse))
    }

    res.statusCode = 200
    res.send({
        status: "Send successful"
    })
}