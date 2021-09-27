import pino from "pino";
import CryptoJS from "crypto-js";
import axios from 'axios'

import {v1} from "uuid";

async function handle(oid, amount, email, phone, res, site_link = "https://yumecs.uz") {
    const logger = pino()

    // const old_mid = "620000000003267"
    const mid = "621000000001051"
    const aid = "443222"
    const pwd="1dQKdrSc"
    const redirect_url = "www.yumecs.uz"
    const merchant_mail = "yumecspay@gmail.com"

    res.statusCode = 200

    logger.info("========REQUEST BODY=================")
    logger.info(oid, amount, email, phone)
    logger.info("=====================================")

    let amount_value = parseFloat(amount)

    const uuid = v1();

    let signature = CryptoJS.SHA256(pwd + mid + uuid).toString(CryptoJS.enc.Base64)

    let data = {
        "id": uuid,
        "orderId": oid,
        "client": {
            "email": email
        },
        "company": {
            "email": "yumecs.uz@gmail.com",
            "sno":"usn_income_outcome",
            "inn": "7726475367",
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

    if (receiptResponse.data["result"]["success"]) {

        let amount_str = amount + "00"

        while (amount_str.length < 12) {
            amount_str = "0" + amount_str
        }

        let payment_info = {
            "mid": mid,
            "aid": aid,
            "amount": amount_str,
            "oid": oid,
            "signature": CryptoJS.SHA256(pwd + mid + aid + oid + amount_str + "643").toString(CryptoJS.enc.Base64),
            "redirect_url": redirect_url,
            "site_link": site_link,
            "merchant_mail": merchant_mail,
            "receipt_id": uuid
        }

        let params = Object.keys(payment_info).map(function (k) {
            return encodeURIComponent(k) + '=' + encodeURIComponent(payment_info[k])
        }).join('&')

        logger.info("==========PAYMENT PARAMS==============")
        console.log(params)
        logger.info("======================================")

        res.redirect("https://mpi.mkb.ru/MPI_payment/?" + params)

    } else {
        res.send({
            status: "Send unsuccessful"
        })
    }

}

module.exports = { handle }