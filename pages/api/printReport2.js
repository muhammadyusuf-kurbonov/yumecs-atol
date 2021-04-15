import {handle} from "./handler";

export default async (req, res) => {
    let {oid, amount, email, phone} = req.body

    await handle(oid, amount, email, phone, res)
}
