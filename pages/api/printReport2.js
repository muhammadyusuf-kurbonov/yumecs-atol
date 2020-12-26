export default async (req, res) => {
    let axios = require("axios")
    let CryptoJS = require("crypto-js")

    import pino from 'pino'
    import { logflarePinoVercel } from 'pino-logflare'

    const { stream, send } = logflarePinoVercel({
        apiKey: "zatRpKa_kaf5",
        sourceToken: "408f84d5-2ff9-4f08-9e2d-a414adfddc3c"
    });

    const logger = pino({
        browser: {
            transmit: {
                level: "info",
                send: send,
            }
        },
        level: "debug",
        base: {
            env: process.env.ENV || "ENV not set",
            revision: process.env.VERCEL_GITHUB_COMMIT_SHA,
        },
    }, stream);


    const mid = "620000000003267"
    const aid = "443222"
    const site_link = "https://yumecs.uz"
    const redirect_url = "www.yumecs.uz"
    const merchant_mail = "yumecspay@gmail.com"

    res.statusCode = 200

    let {oid, amount, email, phone} = req.body

    logger.info("========REQUEST BODY=================")
    logger.info(req.body)
    logger.info("=====================================")

    let amount_value = parseFloat(amount)

    let signature = CryptoJS.SHA256("CTD378Du" + mid + oid).toString(CryptoJS.enc.Base64)

    let data = {
        "id": oid,
        "orderId": oid,
        "client": {
            "email": email,
            "phone": phone
        },
        "company": {
            "email": "yumecs.uz@gmail.com",
            "sno":"usn_income_outcome",
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
                "object": "service",
                "vat": {"type": "none", "sum": 0}
            }],
            "payments": [{"type": 1, "sum": amount_value}],
            "total": amount_value
        }
    };

    logger.info("============RECEIPT DATA=============")
    logger.info(data)
    logger.info("======================================")


    let receiptResponse = await axios.default.post("https://mpi.mkb.ru:8443/OnlineReceipt/1/" + mid + "/receipt",
        data,
        {
            headers: {
                "Content-Type": "application/json",
                "Signature": signature,
                "Accept-Charset": "utf-8"
            }
        })
    logger.info("===========RECEIPT RESPONSE==========")
    console.log(JSON.stringify(receiptResponse.data))
    logger.info("======================================")


    if (receiptResponse.data.hasOwnProperty("errors")){
        res.send("ID duplicate. Please use other ID.")
        return
    }

    if (!receiptResponse.data.hasOwnProperty("result")){
        logger.info("\n\nUnsuccessful receipt creating\n\n")
        res.send("Failed to create receipt")
        return
    }

    if (receiptResponse.data["result"]["success"]){

        let amount_str = amount + "00"

        while (amount_str.length < 12){
            amount_str = "0"+amount_str
        }

        let payment_info = {
            "mid": mid,
            "aid": aid,
            "amount": amount_str,
            "oid": oid,
            "signature": CryptoJS.SHA256("CTD378Du"+mid+aid+oid+amount_str+"643").toString(CryptoJS.enc.Base64),
            "redirect_url": redirect_url,
            "site_link": site_link,
            "merchant_mail": merchant_mail,
            "receipt_id": oid
        }

        let params = Object.keys(payment_info).map(function(k) {
            return encodeURIComponent(k) + '=' + encodeURIComponent(payment_info[k])
        }).join('&')

        logger.info("==========PAYMENT PARAMS==============")
        console.log(params)
        logger.info("======================================")

        res.redirect("https://mpi.mkb.ru/MPI_payment/?" + params)

    }else{
        res.send({
            status: "Send unsuccessful"
        })
    }


}