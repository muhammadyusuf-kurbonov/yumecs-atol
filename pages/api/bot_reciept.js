import printReport2 from "./printReport2";

export default async (req, res) => {

    let {oid, amount, email, phone} = req.query
    printReport2.handle(oid, amount, email, phone, res)

}