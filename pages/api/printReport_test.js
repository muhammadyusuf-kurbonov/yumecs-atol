import {handle} from "./handler_test";

export default async (req, res) => {
    let {oid, amount, email} = req.body

    await handle(oid, amount, email, res)
}
