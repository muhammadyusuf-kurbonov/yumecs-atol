export default (req, res) => {
    let axios = require("axios")
    let CryptoJS = require("crypto-js")

    let {id} = req.query

    let signature = CryptoJS.SHA256("nXkG847p600000000001560" + id).toString(CryptoJS.enc.Base64)

    axios.default.get("https://mpi.mkb.ru:9443/OnlineReceipt/1/600000000001560/receipt?id="+id,
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